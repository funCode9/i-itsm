package com.itsm.backend.service.escalation;

import com.itsm.backend.domain.entity.*;
import com.itsm.backend.domain.enums.*;
import com.itsm.backend.exception.ResourceNotFoundException;
import com.itsm.backend.repository.*;
import com.itsm.backend.service.IncidentNoteService;
import com.itsm.backend.service.assignment.AssignmentStrategyContext;
import com.itsm.backend.service.observer.IncidentAssignedEvent;
import com.itsm.backend.service.observer.IncidentStatusChangedEvent;
import com.itsm.backend.util.PriorityEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Intelligent Feature: Automated Incident Escalation.
 *
 * Implements multi-tier incident escalation:
 * 1. Elevates incident priority (P4 -> P3 -> P2 -> P1).
 * 2. Auto-reassigns to the most qualified alternative specialist or least-loaded technician.
 * 3. Injects formal investigation/audit notes.
 * 4. Broadcasts multi-channel high-priority alerts to reporter, specialist, and administrators.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IncidentEscalationService {

    private final IncidentRepository incidentRepository;
    private final TechnicianRepository technicianRepository;
    private final UserRepository userRepository;
    private final AssignmentHistoryRepository assignmentHistoryRepository;
    private final IncidentNoteService noteService;
    private final NotificationRepository notificationRepository;
    private final EmailLogRepository emailLogRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public Incident escalateIncident(Long incidentId, String reason, User actor) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", incidentId));

        return executeEscalation(incident, reason, actor);
    }

    @Transactional
    public void autoEscalateOnBreach(Incident incident, String breachReason) {
        if (incident.getStatus() == IncidentStatus.RESOLVED ||
            incident.getStatus() == IncidentStatus.VERIFIED ||
            incident.getStatus() == IncidentStatus.CLOSED) {
            return;
        }

        // Avoid infinite re-escalation loops if already escalated to level 2 or above
        if (incident.isEscalated() && incident.getEscalationLevel() != null && incident.getEscalationLevel() >= 2) {
            log.info("Incident {} already escalated to maximum level {}", incident.getIncidentNumber(), incident.getEscalationLevel());
            return;
        }

        User systemActor = userRepository.findByRole(Role.ADMINISTRATOR).stream()
                .findFirst()
                .orElse(incident.getReporter());

        log.warn("Auto-escalating incident {} due to SLA breach: {}", incident.getIncidentNumber(), breachReason);
        executeEscalation(incident, breachReason, systemActor);
    }

    private Incident executeEscalation(Incident incident, String reason, User actor) {
        int currentLevel = incident.getEscalationLevel() != null ? incident.getEscalationLevel() : 0;
        int nextLevel = currentLevel + 1;

        incident.setEscalated(true);
        incident.setEscalationLevel(nextLevel);
        incident.setEscalationReason(reason);

        // 1. Elevate priority if not already P0
        Priority previousPriority = incident.getPriority();
        Priority newPriority = bumpPriority(previousPriority);
        if (newPriority != previousPriority) {
            incident.setPriority(newPriority);
            int newScore = switch (newPriority) {
                case P0_EMERGENCY -> 30;
                case P1_CRITICAL  -> 27;
                case P2_HIGH      -> 16;
                case P3_MEDIUM    -> 8;
                case P4_LOW       -> 2;
            };
            incident.setPriorityScore(newScore);
            log.info("Incident {} priority bumped from {} to {}", incident.getIncidentNumber(), previousPriority, newPriority);
        }

        // 2. Select alternative specialist
        Technician previousTech = incident.getAssignedTechnician();
        Technician escalationTarget = findEscalationTarget(incident, previousTech);

        boolean reassigned = false;
        if (escalationTarget != null && (previousTech == null || !escalationTarget.getId().equals(previousTech.getId()))) {
            incident.setAssignedTechnician(escalationTarget);
            reassigned = true;

            AssignmentHistory history = AssignmentHistory.builder()
                    .incident(incident)
                    .technician(escalationTarget)
                    .assignedBy(actor)
                    .assignedAt(LocalDateTime.now())
                    .strategy(AssignmentStrategyType.SKILL_BASED)
                    .manual(false)
                    .reason("Automated Escalation (Tier " + nextLevel + "): " + reason)
                    .build();
            assignmentHistoryRepository.save(history);

            log.info("Incident {} escalated and reassigned from {} to {}",
                    incident.getIncidentNumber(),
                    previousTech != null ? previousTech.getFullName() : "None",
                    escalationTarget.getFullName());

            eventPublisher.publishEvent(new IncidentAssignedEvent(this, incident, escalationTarget, actor));
        }

        incident = incidentRepository.save(incident);

        // 3. Inject audit/investigation note
        String noteContent = String.format(
                "🚨 [AUTOMATED ESCALATION - TIER %d]\nReason: %s\nPriority Adjusted: %s -> %s%s",
                nextLevel,
                reason,
                previousPriority,
                newPriority,
                reassigned ? "\nReassigned to: " + escalationTarget.getFullName() : ""
        );

        try {
            noteService.addNote(incident.getId(), actor.getId(), noteContent, NoteType.INVESTIGATION, true);
        } catch (Exception e) {
            log.warn("Failed to attach escalation note: {}", e.getMessage());
        }

        // 4. Send escalation alerts
        sendEscalationAlerts(incident, nextLevel, reason, escalationTarget, actor);

        eventPublisher.publishEvent(new IncidentStatusChangedEvent(
                this, incident, incident.getStatus(), incident.getStatus(), actor,
                "Incident Escalated to Tier " + nextLevel + ": " + reason
        ));

        return incident;
    }

    private Priority bumpPriority(Priority current) {
        if (current == null) return Priority.P2_HIGH;
        return switch (current) {
            case P4_LOW       -> Priority.P3_MEDIUM;
            case P3_MEDIUM    -> Priority.P2_HIGH;
            case P2_HIGH      -> Priority.P1_CRITICAL;
            case P1_CRITICAL  -> Priority.P0_EMERGENCY;
            case P0_EMERGENCY -> Priority.P0_EMERGENCY; // cap at P0
        };
    }

    private Technician findEscalationTarget(Incident incident, Technician excludeTech) {
        List<Technician> available = technicianRepository.findAvailableAndEnabled();
        if (available.isEmpty()) return null;

        // Prefer someone with matching skill who is NOT the current technician
        String categoryName = incident.getCategory() != null ? incident.getCategory().getName().toLowerCase() : "";

        return available.stream()
                .filter(t -> excludeTech == null || !t.getId().equals(excludeTech.getId()))
                .min(Comparator.comparingLong((Technician t) -> {
                    // Skill match bonus: subtract 10 from sort key if technician has category skill
                    boolean hasSkill = t.getSkills().stream()
                            .anyMatch(s -> s.getSkillName().toLowerCase().contains(categoryName));
                    long workload = technicianRepository.countActiveIncidents(t.getId());
                    return hasSkill ? (workload - 10) : workload;
                }))
                .orElse(available.get(0));
    }

    private void sendEscalationAlerts(Incident incident, int tier, String reason, Technician targetTech, User actor) {
        String title = "🚨 Incident Escalated (Tier " + tier + "): " + incident.getIncidentNumber();
        String body = String.format("Incident %s ('%s') has been escalated. Reason: %s",
                incident.getIncidentNumber(), incident.getTitle(), reason);

        // Notify Reporter
        notificationRepository.save(Notification.builder()
                .recipient(incident.getReporter())
                .title(title)
                .message("Your incident has been elevated to Tier " + tier + " for urgent resolution.")
                .notificationType(NotificationType.ESCALATION)
                .relatedIncidentId(incident.getId())
                .relatedIncidentNumber(incident.getIncidentNumber())
                .build());

        // Notify Assigned Technician
        if (targetTech != null) {
            notificationRepository.save(Notification.builder()
                    .recipient(targetTech.getUser())
                    .title(title)
                    .message("Escalated incident assigned to your queue with highest dispatch priority.")
                    .notificationType(NotificationType.ESCALATION)
                    .relatedIncidentId(incident.getId())
                    .relatedIncidentNumber(incident.getIncidentNumber())
                    .build());
        }

        // Notify Administrators
        List<User> admins = userRepository.findByRole(Role.ADMINISTRATOR);
        for (User admin : admins) {
            notificationRepository.save(Notification.builder()
                    .recipient(admin)
                    .title(title)
                    .message(body)
                    .notificationType(NotificationType.ESCALATION)
                    .relatedIncidentId(incident.getId())
                    .relatedIncidentNumber(incident.getIncidentNumber())
                    .build());
        }

        // Email log simulation
        emailLogRepository.save(EmailLog.builder()
                .recipientEmail(incident.getReporter().getEmail())
                .recipientName(incident.getReporter().getFullName())
                .subject(title)
                .body(body)
                .relatedIncidentId(incident.getId())
                .relatedIncidentNumber(incident.getIncidentNumber())
                .build());
    }
}
