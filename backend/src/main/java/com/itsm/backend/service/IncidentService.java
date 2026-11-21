package com.itsm.backend.service;

import com.itsm.backend.domain.entity.*;
import com.itsm.backend.domain.enums.*;
import com.itsm.backend.exception.*;
import com.itsm.backend.repository.*;
import com.itsm.backend.service.assignment.AssignmentStrategyContext;
import com.itsm.backend.service.observer.*;
import com.itsm.backend.util.IncidentNumberGenerator;
import com.itsm.backend.util.PriorityEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Core business logic for incident management.
 * Enforces the incident lifecycle FSM, priority engine, and assignment.
 *
 * OOP: Encapsulation — all incident business logic is centralized here.
 * OOP: Composition — composes AssignmentStrategyContext, PriorityEngine, event publisher.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ItServiceRepository itServiceRepository;
    private final TechnicianRepository technicianRepository;
    private final AssignmentHistoryRepository assignmentHistoryRepository;
    private final SlaPolicyRepository slaPolicyRepository;
    private final IncidentSlaRepository incidentSlaRepository;
    private final AssignmentStrategyContext assignmentStrategyContext;
    private final ApplicationEventPublisher eventPublisher;
    private final IncidentNoteService noteService;
    private final NotificationRepository notificationRepository;
    private final EmailLogRepository emailLogRepository;

    /** Valid state transitions for the incident lifecycle FSM */
    private static final Map<IncidentStatus, Set<IncidentStatus>> VALID_TRANSITIONS = Map.of(
        IncidentStatus.NEW,         Set.of(IncidentStatus.CLASSIFIED),
        IncidentStatus.CLASSIFIED,  Set.of(IncidentStatus.ASSIGNED),
        IncidentStatus.ASSIGNED,    Set.of(IncidentStatus.ACKNOWLEDGED),
        IncidentStatus.ACKNOWLEDGED,Set.of(IncidentStatus.IN_PROGRESS),
        IncidentStatus.IN_PROGRESS, Set.of(IncidentStatus.RESOLVED),
        IncidentStatus.RESOLVED,    Set.of(IncidentStatus.VERIFIED, IncidentStatus.IN_PROGRESS, IncidentStatus.CLOSED),
        IncidentStatus.VERIFIED,    Set.of(IncidentStatus.CLOSED),
        IncidentStatus.CLOSED,      Set.of()
    );

    public Incident createIncident(String title, String description, Long reporterId,
                                    Long categoryId, Long serviceId,
                                    int impact, int urgency, int businessCriticality) {
        if (title == null || title.trim().isEmpty()) {
            throw new InvalidInputException("Incident title is mandatory and cannot be blank");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new InvalidInputException("Incident description is mandatory and cannot be blank");
        }
        if (impact < 1 || impact > 3 || urgency < 1 || urgency > 3 || businessCriticality < 1 || businessCriticality > 3) {
            throw new InvalidInputException("Priority factors (impact, urgency, business criticality) must be calibrated between 1 and 3");
        }

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", reporterId));

        Category category = categoryId != null ? categoryRepository.findById(categoryId).orElse(null) : null;
        ItService service = serviceId != null ? itServiceRepository.findById(serviceId)
                .orElseThrow(() -> new ServiceNotFoundException(serviceId)) : null;

        int score = PriorityEngine.computeScore(impact, urgency, businessCriticality);
        Priority priority = PriorityEngine.fromScore(score);

        Incident incident = Incident.builder()
                .incidentNumber(generateUniqueNumber())
                .title(title)
                .description(description)
                .reporter(reporter)
                .category(category)
                .service(service)
                .impact(impact)
                .urgency(urgency)
                .businessCriticality(businessCriticality)
                .priorityScore(score)
                .priority(priority)
                .status(IncidentStatus.NEW)
                .build();

        incident = incidentRepository.save(incident);
        log.info("Created incident {} with priority {}", incident.getIncidentNumber(), priority);

        eventPublisher.publishEvent(new IncidentCreatedEvent(this, incident, reporter));
        return incident;
    }

    public Incident classifyAndAssign(Long incidentId, Long categoryId, Long serviceId,
                                       int impact, int urgency, int businessCriticality,
                                       User actor) {
        Incident incident = getIncidentById(incidentId);
        validateTransition(incident.getStatus(), IncidentStatus.CLASSIFIED);

        if (categoryId != null) {
            incident.setCategory(categoryRepository.findById(categoryId).orElse(null));
        }
        if (serviceId != null) {
            incident.setService(itServiceRepository.findById(serviceId).orElse(null));
        }

        incident.setImpact(impact);
        incident.setUrgency(urgency);
        incident.setBusinessCriticality(businessCriticality);
        int score = PriorityEngine.computeScore(impact, urgency, businessCriticality);
        incident.setPriorityScore(score);
        incident.setPriority(PriorityEngine.fromScore(score));

        IncidentStatus prev = incident.getStatus();
        incident.setStatus(IncidentStatus.CLASSIFIED);
        incident = incidentRepository.save(incident);

        eventPublisher.publishEvent(new IncidentStatusChangedEvent(this, incident, prev, IncidentStatus.CLASSIFIED, actor,
                "Incident classified with priority " + incident.getPriority()));

        // Auto-assign technician
        return autoAssign(incident, actor);
    }

    public Incident autoAssign(Incident incident, User actor) {
        validateTransition(incident.getStatus(), IncidentStatus.ASSIGNED);

        Optional<Technician> techOpt = assignmentStrategyContext.assignTechnician(incident);
        if (techOpt.isEmpty()) {
            log.warn("No technician available for incident {}", incident.getIncidentNumber());
            return incident;
        }

        return doAssign(incident, techOpt.get(), actor, false,
                assignmentStrategyContext.getActiveStrategyType(), "Auto-assigned by strategy");
    }

    public Incident manualAssign(Long incidentId, Long technicianId, User actor) {
        Incident incident = getIncidentById(incidentId);
        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician", technicianId));

        if (!technician.isAvailable()) {
            throw new TechnicianUnavailableException(technician.getId(), technician.getFullName());
        }

        long activeTickets = technicianRepository.countActiveIncidents(technicianId);
        if (activeTickets >= 10) {
            throw new TechnicianWorkloadExceededException(technician.getFullName(), activeTickets, 10);
        }

        return doAssign(incident, technician, actor, true, null, "Manually assigned by admin");
    }

    private Incident doAssign(Incident incident, Technician technician, User actor,
                               boolean manual, AssignmentStrategyType strategyType, String reason) {
        IncidentStatus prev = incident.getStatus();
        incident.setAssignedTechnician(technician);
        incident.setStatus(IncidentStatus.ASSIGNED);
        incident = incidentRepository.save(incident);

        // Record assignment history
        AssignmentHistory history = AssignmentHistory.builder()
                .incident(incident)
                .technician(technician)
                .assignedBy(actor)
                .assignedAt(LocalDateTime.now())
                .strategy(strategyType)
                .manual(manual)
                .reason(reason)
                .build();
        assignmentHistoryRepository.save(history);

        // Create SLA record
        createSlaRecord(incident);

        eventPublisher.publishEvent(new IncidentAssignedEvent(this, incident, technician, actor));
        eventPublisher.publishEvent(new IncidentStatusChangedEvent(this, incident, prev, IncidentStatus.ASSIGNED, actor, reason));
        return incident;
    }

    public Incident transitionStatus(Long incidentId, IncidentStatus newStatus,
                                      String resolutionDetails, String closureNotes, User actor) {
        Incident incident = getIncidentById(incidentId);
        validateTransition(incident.getStatus(), newStatus);
        IncidentStatus prev = incident.getStatus();

        incident.setStatus(newStatus);

        if (newStatus == IncidentStatus.ACKNOWLEDGED && incident.getRespondedAt() == null) {
            incident.setRespondedAt(LocalDateTime.now());
            updateSlaResponseTime(incident);
        }
        if (newStatus == IncidentStatus.RESOLVED) {
            incident.setResolvedAt(LocalDateTime.now());
            if (resolutionDetails != null) incident.setResolutionDetails(resolutionDetails);
            updateSlaResolutionTime(incident);
        }
        if (newStatus == IncidentStatus.CLOSED) {
            incident.setClosedAt(LocalDateTime.now());
            if (closureNotes != null) incident.setClosureNotes(closureNotes);
        }

        incident = incidentRepository.save(incident);
        eventPublisher.publishEvent(new IncidentStatusChangedEvent(this, incident, prev, newStatus, actor,
                "Status changed to " + newStatus.name()));
        return incident;
    }

    private void createSlaRecord(Incident incident) {
        SlaPolicy policy = slaPolicyRepository.findByPriority(incident.getPriority())
                .orElseThrow(() -> new MissingSlaConfigurationException(incident.getPriority() != null ? incident.getPriority().name() : "UNKNOWN"));

        LocalDateTime base = incident.getCreatedAt() != null ? incident.getCreatedAt() : LocalDateTime.now();
        IncidentSla sla = IncidentSla.builder()
                .incident(incident)
                .policy(policy)
                .responseDeadline(base.plusMinutes(policy.getResponseMinutes()))
                .resolutionDeadline(base.plusMinutes(policy.getResolutionMinutes()))
                .build();
        incidentSlaRepository.save(sla);
    }

    private void updateSlaResponseTime(Incident incident) {
        incidentSlaRepository.findByIncidentId(incident.getId()).ifPresent(sla -> {
            sla.setRespondedAt(incident.getRespondedAt());
            if (incident.getRespondedAt().isAfter(sla.getResponseDeadline())) {
                sla.setResponseBreached(true);
            }
            incidentSlaRepository.save(sla);
        });
    }

    private void updateSlaResolutionTime(Incident incident) {
        incidentSlaRepository.findByIncidentId(incident.getId()).ifPresent(sla -> {
            sla.setResolvedAt(incident.getResolvedAt());
            if (incident.getResolvedAt().isAfter(sla.getResolutionDeadline())) {
                sla.setResolutionBreached(true);
                sla.setStatus(SlaStatus.BREACHED);
            } else {
                sla.setStatus(SlaStatus.ON_TIME);
            }
            incidentSlaRepository.save(sla);
        });
    }

    public void validateTransition(IncidentStatus current, IncidentStatus next) {
        Set<IncidentStatus> allowed = VALID_TRANSITIONS.getOrDefault(current, Set.of());
        if (!allowed.contains(next)) {
            throw new InvalidStateTransitionException(current.name(), next.name());
        }
    }

    @Transactional(readOnly = true)
    public Incident getIncidentById(Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new InvalidIncidentException(id));
    }

    @Transactional(readOnly = true)
    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Incident> getIncidentsByReporter(Long reporterId) {
        return incidentRepository.findByReporterId(reporterId);
    }

    @Transactional(readOnly = true)
    public List<Incident> getIncidentsByTechnician(Long technicianId) {
        return incidentRepository.findByAssignedTechnicianId(technicianId);
    }

    @Transactional(readOnly = true)
    public List<Incident> getIncidentsByTechnicianForUser(Long userId) {
        // Find technician by user id
        return technicianRepository.findByUserId(userId)
                .map(tech -> incidentRepository.findByAssignedTechnicianId(tech.getId()))
                .orElse(List.of());
    }

    private String generateUniqueNumber() {
        String number;
        do {
            number = IncidentNumberGenerator.generate();
        } while (incidentRepository.findByIncidentNumber(number).isPresent());
        return number;
    }

    /**
     * Correlates duplicate / similar incidents and upgrades the priority of BOTH the existing
     * incident(s) and the new duplicate incident (e.g., P3_MEDIUM -> P2_HIGH, P2_HIGH -> P1_CRITICAL).
     */
    public Incident correlateDuplicatesAndUpgradePriority(Incident newIncident, List<Incident> duplicates, User actor) {
        if (duplicates == null || duplicates.isEmpty()) return newIncident;

        Incident primaryCandidate = duplicates.get(0);
        Incident rootPrimary = primaryCandidate.getDuplicateOf() != null ? primaryCandidate.getDuplicateOf() : primaryCandidate;

        // 1. Link new incident to root primary
        newIncident.setDuplicateOf(rootPrimary);
        newIncident.setPotentialDuplicate(true);

        // Inherit assigned technician from primary to streamline handling
        if (rootPrimary.getAssignedTechnician() != null && newIncident.getAssignedTechnician() == null) {
            newIncident.setAssignedTechnician(rootPrimary.getAssignedTechnician());
            newIncident.setStatus(IncidentStatus.ASSIGNED);
        }

        // 2. Compute upgraded priority: bump rootPrimary's priority
        Priority basePriority = rootPrimary.getPriority() != null ? rootPrimary.getPriority() : Priority.P3_MEDIUM;
        Priority upgradedPriority = PriorityEngine.bumpPriority(basePriority);

        // If new incident arrived with higher priority, respect the higher severity
        if (newIncident.getPriority() != null && newIncident.getPriority().compareTo(upgradedPriority) < 0) {
            upgradedPriority = newIncident.getPriority();
        }

        int newScore = PriorityEngine.scoreForPriority(upgradedPriority);

        // 3. Upgrade rootPrimary and all existing duplicate tickets in the cluster
        List<Incident> cluster = new ArrayList<>();
        cluster.add(rootPrimary);
        cluster.addAll(incidentRepository.findByDuplicateOfId(rootPrimary.getId()));

        for (Incident existing : cluster) {
            if (existing.getId().equals(newIncident.getId())) continue;

            Priority prev = existing.getPriority();
            existing.setPriority(upgradedPriority);
            existing.setPriorityScore(newScore);
            existing.setEscalated(true);
            int level = existing.getEscalationLevel() != null ? existing.getEscalationLevel() + 1 : 1;
            existing.setEscalationLevel(level);
            existing.setImpact(Math.min(3, Math.max(existing.getImpact(), newIncident.getImpact()) + 1));
            existing.setEscalationReason(String.format(
                    "Duplicate outage surge: Concurrent report %s ('%s') received. Priority upgraded %s -> %s to reflect multi-user impact.",
                    newIncident.getIncidentNumber(), newIncident.getTitle(), prev, upgradedPriority
            ));
            incidentRepository.save(existing);

            // Update SLA policy and deadlines to match upgraded priority
            updateSlaPolicyForUpgradedPriority(existing, upgradedPriority);

            // Add investigation audit note
            String noteText = String.format(
                    "⚡ [AUTOMATED PRIORITY UPGRADE - DUPLICATE CLUSTER]\n" +
                    "Similar incident %s ('%s') reported by %s.\n" +
                    "Priority automatically upgraded: %s -> %s (Tier %d) due to multi-user impact.",
                    newIncident.getIncidentNumber(), newIncident.getTitle(), actor.getFullName(),
                    prev, upgradedPriority, level
            );
            try {
                noteService.addNote(existing.getId(), actor.getId(), noteText, NoteType.INVESTIGATION, true);
            } catch (Exception e) {
                log.warn("Failed to attach note to incident {}: {}", existing.getIncidentNumber(), e.getMessage());
            }

            // Notify reporter & assigned technician
            notifyPriorityUpgrade(existing, newIncident, prev, upgradedPriority);
        }

        // 4. Upgrade the NEW incident
        Priority prevNew = newIncident.getPriority();
        newIncident.setPriority(upgradedPriority);
        newIncident.setPriorityScore(newScore);
        newIncident.setEscalated(true);
        newIncident.setEscalationLevel(1);
        newIncident.setImpact(Math.min(3, Math.max(newIncident.getImpact(), rootPrimary.getImpact())));
        newIncident.setEscalationReason(String.format(
                "Correlated duplicate of %s ('%s'). Priority upgraded %s -> %s due to concurrent reports.",
                rootPrimary.getIncidentNumber(), rootPrimary.getTitle(), prevNew, upgradedPriority
        ));
        newIncident = incidentRepository.save(newIncident);

        // Update SLA policy for new incident
        updateSlaPolicyForUpgradedPriority(newIncident, upgradedPriority);

        // Add investigation audit note on new incident
        String newNoteText = String.format(
                "⚡ [CORRELATED DUPLICATE INCIDENT - PRIORITY UPGRADED]\n" +
                "Correlated with active incident %s ('%s').\n" +
                "Priority automatically upgraded: %s -> %s to expedite resolution.",
                rootPrimary.getIncidentNumber(), rootPrimary.getTitle(),
                prevNew, upgradedPriority
        );
        try {
            noteService.addNote(newIncident.getId(), actor.getId(), newNoteText, NoteType.INVESTIGATION, true);
        } catch (Exception e) {
            log.warn("Failed to attach note to new incident {}: {}", newIncident.getIncidentNumber(), e.getMessage());
        }

        // Notify reporter of new incident
        notifyPriorityUpgrade(newIncident, rootPrimary, prevNew, upgradedPriority);

        log.info("Correlated incidents {} and {}. Both upgraded to priority {}",
                rootPrimary.getIncidentNumber(), newIncident.getIncidentNumber(), upgradedPriority);

        return newIncident;
    }

    private void updateSlaPolicyForUpgradedPriority(Incident incident, Priority upgradedPriority) {
        incidentSlaRepository.findByIncidentId(incident.getId()).ifPresent(sla -> {
            slaPolicyRepository.findByPriority(upgradedPriority).ifPresent(policy -> {
                sla.setPolicy(policy);
                LocalDateTime base = incident.getCreatedAt() != null ? incident.getCreatedAt() : LocalDateTime.now();
                sla.setResponseDeadline(base.plusMinutes(policy.getResponseMinutes()));
                sla.setResolutionDeadline(base.plusMinutes(policy.getResolutionMinutes()));
                incidentSlaRepository.save(sla);
                log.info("Adjusted SLA policy for incident {} to {} (Resolution deadline: {})",
                        incident.getIncidentNumber(), upgradedPriority, sla.getResolutionDeadline());
            });
        });
    }

    private void notifyPriorityUpgrade(Incident incident, Incident correlatedWith, Priority oldP, Priority newP) {
        if (incident.getReporter() != null) {
            try {
                Notification notif = Notification.builder()
                        .recipient(incident.getReporter())
                        .title("⚡ Priority Upgraded: " + incident.getIncidentNumber() + " -> " + newP)
                        .message(String.format(
                                "Your incident %s ('%s') has been correlated with %s. Priority was automatically upgraded from %s to %s to expedite resolution.",
                                incident.getIncidentNumber(), incident.getTitle(), correlatedWith.getIncidentNumber(), oldP, newP
                        ))
                        .notificationType(NotificationType.ESCALATION)
                        .relatedIncidentId(incident.getId())
                        .relatedIncidentNumber(incident.getIncidentNumber())
                        .build();
                notificationRepository.save(notif);

                emailLogRepository.save(EmailLog.builder()
                        .recipientEmail(incident.getReporter().getEmail())
                        .recipientName(incident.getReporter().getFullName())
                        .subject("⚡ Priority Upgraded: " + incident.getIncidentNumber() + " -> " + newP)
                        .body(String.format(
                                "Hello %s,\n\nIncident %s has been correlated with %s. Due to multiple user reports of this issue, priority has been upgraded from %s to %s.\n\nStatus: %s\nAssigned Specialist: %s",
                                incident.getReporter().getFullName(), incident.getIncidentNumber(), correlatedWith.getIncidentNumber(),
                                oldP, newP, incident.getStatus(),
                                incident.getAssignedTechnician() != null ? incident.getAssignedTechnician().getFullName() : "Awaiting assignment"
                        ))
                        .relatedIncidentId(incident.getId())
                        .relatedIncidentNumber(incident.getIncidentNumber())
                        .build());
            } catch (Exception e) {
                log.warn("Failed to notify reporter of priority upgrade: {}", e.getMessage());
            }
        }

        if (incident.getAssignedTechnician() != null && incident.getAssignedTechnician().getUser() != null) {
            try {
                Notification techNotif = Notification.builder()
                        .recipient(incident.getAssignedTechnician().getUser())
                        .title("🚨 Priority Elevated: " + incident.getIncidentNumber() + " -> " + newP)
                        .message(String.format(
                                "Assigned incident %s ('%s') priority elevated from %s to %s due to duplicate report surge (%s).",
                                incident.getIncidentNumber(), incident.getTitle(), oldP, newP, correlatedWith.getIncidentNumber()
                        ))
                        .notificationType(NotificationType.ESCALATION)
                        .relatedIncidentId(incident.getId())
                        .relatedIncidentNumber(incident.getIncidentNumber())
                        .build();
                notificationRepository.save(techNotif);
            } catch (Exception e) {
                log.warn("Failed to notify technician of priority upgrade: {}", e.getMessage());
            }
        }
    }
}
