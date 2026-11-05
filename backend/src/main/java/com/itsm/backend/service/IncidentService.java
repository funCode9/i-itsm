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

    /** Valid state transitions for the incident lifecycle FSM */
    private static final Map<IncidentStatus, Set<IncidentStatus>> VALID_TRANSITIONS = Map.of(
        IncidentStatus.NEW,         Set.of(IncidentStatus.CLASSIFIED),
        IncidentStatus.CLASSIFIED,  Set.of(IncidentStatus.ASSIGNED),
        IncidentStatus.ASSIGNED,    Set.of(IncidentStatus.ACKNOWLEDGED),
        IncidentStatus.ACKNOWLEDGED,Set.of(IncidentStatus.IN_PROGRESS),
        IncidentStatus.IN_PROGRESS, Set.of(IncidentStatus.RESOLVED),
        IncidentStatus.RESOLVED,    Set.of(IncidentStatus.VERIFIED, IncidentStatus.IN_PROGRESS),
        IncidentStatus.VERIFIED,    Set.of(IncidentStatus.CLOSED),
        IncidentStatus.CLOSED,      Set.of()
    );

    public Incident createIncident(String title, String description, Long reporterId,
                                    Long categoryId, Long serviceId,
                                    int impact, int urgency, int businessCriticality) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", reporterId));

        Category category = categoryId != null ? categoryRepository.findById(categoryId).orElse(null) : null;
        ItService service = serviceId != null ? itServiceRepository.findById(serviceId).orElse(null) : null;

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
        slaPolicyRepository.findByPriority(incident.getPriority()).ifPresent(policy -> {
            LocalDateTime base = incident.getCreatedAt() != null ? incident.getCreatedAt() : LocalDateTime.now();
            IncidentSla sla = IncidentSla.builder()
                    .incident(incident)
                    .policy(policy)
                    .responseDeadline(base.plusMinutes(policy.getResponseMinutes()))
                    .resolutionDeadline(base.plusMinutes(policy.getResolutionMinutes()))
                    .build();
            incidentSlaRepository.save(sla);
        });
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
                .orElseThrow(() -> new ResourceNotFoundException("Incident", id));
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
        int attempts = 0;
        do {
            number = IncidentNumberGenerator.generate();
            attempts++;
        } while (incidentRepository.findByIncidentNumber(number).isPresent() && attempts < 10);
        return number;
    }
}
