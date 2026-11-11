package com.itsm.backend.service.intelligence;

import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.IncidentSla;
import com.itsm.backend.domain.entity.Technician;
import com.itsm.backend.domain.enums.IncidentStatus;
import com.itsm.backend.domain.enums.Priority;
import com.itsm.backend.domain.enums.SlaStatus;
import com.itsm.backend.dto.SlaPredictionDTO;
import com.itsm.backend.repository.IncidentRepository;
import com.itsm.backend.repository.IncidentSlaRepository;
import com.itsm.backend.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Intelligent Feature: Predictive SLA Violation Detection.
 *
 * Evaluates active incidents using temporal metrics, workflow stage inertia,
 * technician workload, and priority severity to predict SLA breach probability
 * before breach occurs.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SlaPredictionService {

    private final IncidentSlaRepository incidentSlaRepository;
    private final IncidentRepository incidentRepository;
    private final TechnicianRepository technicianRepository;

    @Transactional(readOnly = true)
    public SlaPredictionDTO predictSlaRisk(IncidentSla sla) {
        LocalDateTime now = LocalDateTime.now();
        Incident incident = sla.getIncident();

        LocalDateTime createdAt = incident.getCreatedAt() != null ? incident.getCreatedAt() : now;
        LocalDateTime deadline = sla.getResolutionDeadline();

        long totalWindowMinutes = Math.max(1, Duration.between(createdAt, deadline).toMinutes());
        long elapsedMinutes = Math.max(0, Duration.between(createdAt, now).toMinutes());
        long remainingMinutes = Duration.between(now, deadline).toMinutes();

        double elapsedPct = Math.min(100.0, Math.max(0.0, (elapsedMinutes * 100.0) / totalWindowMinutes));
        boolean isBreached = now.isAfter(deadline) || sla.isResolutionBreached() || sla.getStatus() == SlaStatus.BREACHED;

        List<String> riskFactors = new ArrayList<>();

        if (incident.getStatus() == IncidentStatus.RESOLVED ||
            incident.getStatus() == IncidentStatus.VERIFIED ||
            incident.getStatus() == IncidentStatus.CLOSED) {
            return SlaPredictionDTO.builder()
                    .incidentId(incident.getId())
                    .incidentNumber(incident.getIncidentNumber())
                    .title(incident.getTitle())
                    .priority(incident.getPriority())
                    .status(incident.getStatus())
                    .assignedTechnicianName(incident.getAssignedTechnician() != null ? incident.getAssignedTechnician().getFullName() : "Unassigned")
                    .resolutionDeadline(deadline)
                    .totalWindowMinutes(totalWindowMinutes)
                    .elapsedMinutes(elapsedMinutes)
                    .remainingMinutes(Math.max(0, remainingMinutes))
                    .elapsedPercentage(Math.round(elapsedPct * 10.0) / 10.0)
                    .riskScore(0)
                    .riskLevel("LOW")
                    .currentSlaStatus(sla.getStatus())
                    .isBreached(false)
                    .riskFactors(List.of("Incident resolved/closed; SLA achieved"))
                    .recommendedAction("No action required")
                    .build();
        }

        if (isBreached) {
            riskFactors.add("SLA resolution deadline has passed by " + Math.abs(remainingMinutes) + " minutes");
            return SlaPredictionDTO.builder()
                    .incidentId(incident.getId())
                    .incidentNumber(incident.getIncidentNumber())
                    .title(incident.getTitle())
                    .priority(incident.getPriority())
                    .status(incident.getStatus())
                    .assignedTechnicianName(incident.getAssignedTechnician() != null ? incident.getAssignedTechnician().getFullName() : "Unassigned")
                    .resolutionDeadline(deadline)
                    .totalWindowMinutes(totalWindowMinutes)
                    .elapsedMinutes(elapsedMinutes)
                    .remainingMinutes(remainingMinutes)
                    .elapsedPercentage(100.0)
                    .riskScore(100)
                    .riskLevel("CRITICAL")
                    .currentSlaStatus(SlaStatus.BREACHED)
                    .isBreached(true)
                    .riskFactors(riskFactors)
                    .recommendedAction("Trigger immediate automated escalation and reassign to lead specialist")
                    .build();
        }

        // Compute predictive risk score
        double timeRisk = elapsedPct; // 0..100
        if (elapsedPct >= 70.0) {
            riskFactors.add(String.format("%.1f%% of allocated SLA time elapsed with %d minutes remaining", elapsedPct, remainingMinutes));
        }

        // Workflow Stage Inertia: If stage hasn't progressed, risk escalates faster
        int stageInertiaScore = 0;
        switch (incident.getStatus()) {
            case NEW -> {
                stageInertiaScore = 30;
                riskFactors.add("Incident is still NEW and unclassified");
            }
            case CLASSIFIED -> {
                stageInertiaScore = 25;
                riskFactors.add("Incident classified but technician not assigned");
            }
            case ASSIGNED -> {
                if (elapsedPct > 40.0) {
                    stageInertiaScore = 20;
                    riskFactors.add("Technician assigned but work not yet acknowledged");
                }
            }
            case ACKNOWLEDGED -> {
                if (elapsedPct > 60.0) {
                    stageInertiaScore = 15;
                    riskFactors.add("Acknowledged but active investigation not yet logged");
                }
            }
            case IN_PROGRESS -> stageInertiaScore = 0;
            default -> stageInertiaScore = 0;
        }

        // Priority factor
        int priorityFactor = 0;
        if (incident.getPriority() == Priority.P1_CRITICAL) {
            priorityFactor = 15;
            riskFactors.add("High business criticality (P1 Critical SLA tight window)");
        } else if (incident.getPriority() == Priority.P2_HIGH) {
            priorityFactor = 10;
        }

        // Technician workload factor
        int techWorkloadFactor = 0;
        Technician tech = incident.getAssignedTechnician();
        if (tech != null) {
            long activeTickets = technicianRepository.countActiveIncidents(tech.getId());
            if (activeTickets >= 4) {
                techWorkloadFactor = 15;
                riskFactors.add(String.format("Assigned technician (%s) is heavily loaded (%d active incidents)", tech.getFullName(), activeTickets));
            }
        } else {
            techWorkloadFactor = 25;
            riskFactors.add("No assigned technician to handle incident");
        }

        double compositeScore = (timeRisk * 0.60) + (stageInertiaScore * 0.20) + priorityFactor + techWorkloadFactor;
        int finalRiskScore = (int) Math.min(99, Math.max(5, Math.round(compositeScore)));

        String riskLevel;
        String recommendedAction;
        if (finalRiskScore >= 80) {
            riskLevel = "CRITICAL";
            recommendedAction = "Pre-emptive escalation: Notify supervisor and prepare immediate re-dispatch";
        } else if (finalRiskScore >= 65) {
            riskLevel = "HIGH";
            recommendedAction = "Active monitoring: Expedite status update from technician";
        } else if (finalRiskScore >= 40) {
            riskLevel = "MEDIUM";
            recommendedAction = "Maintain standard tracking; review within next scheduled SLA check";
        } else {
            riskLevel = "LOW";
            recommendedAction = "On track; proceeding within standard parameters";
        }

        return SlaPredictionDTO.builder()
                .incidentId(incident.getId())
                .incidentNumber(incident.getIncidentNumber())
                .title(incident.getTitle())
                .priority(incident.getPriority())
                .status(incident.getStatus())
                .assignedTechnicianName(tech != null ? tech.getFullName() : "Unassigned")
                .resolutionDeadline(deadline)
                .totalWindowMinutes(totalWindowMinutes)
                .elapsedMinutes(elapsedMinutes)
                .remainingMinutes(remainingMinutes)
                .elapsedPercentage(Math.round(elapsedPct * 10.0) / 10.0)
                .riskScore(finalRiskScore)
                .riskLevel(riskLevel)
                .currentSlaStatus(sla.getStatus())
                .isBreached(false)
                .riskFactors(riskFactors)
                .recommendedAction(recommendedAction)
                .build();
    }

    @Transactional(readOnly = true)
    public SlaPredictionDTO predictForIncident(Long incidentId) {
        IncidentSla sla = incidentSlaRepository.findByIncidentId(incidentId)
                .orElse(null);

        if (sla != null) {
            return predictSlaRisk(sla);
        }

        // If no SLA record yet (e.g. unassigned NEW incident)
        Incident incident = incidentRepository.findById(incidentId).orElseThrow();
        return SlaPredictionDTO.builder()
                .incidentId(incident.getId())
                .incidentNumber(incident.getIncidentNumber())
                .title(incident.getTitle())
                .priority(incident.getPriority())
                .status(incident.getStatus())
                .riskScore(incident.getPriority() == Priority.P1_CRITICAL ? 75 : 50)
                .riskLevel(incident.getPriority() == Priority.P1_CRITICAL ? "HIGH" : "MEDIUM")
                .isBreached(false)
                .riskFactors(List.of("Incident not yet assigned; SLA clock pending initial classification"))
                .recommendedAction("Classify and assign to start formal SLA tracking")
                .build();
    }

    @Transactional(readOnly = true)
    public List<SlaPredictionDTO> getAllPredictions() {
        return incidentSlaRepository.findAll().stream()
                .map(this::predictSlaRisk)
                .sorted(Comparator.comparingInt(SlaPredictionDTO::getRiskScore).reversed())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SlaPredictionDTO> getAtRiskIncidents() {
        return getAllPredictions().stream()
                .filter(p -> ("HIGH".equals(p.getRiskLevel()) || "CRITICAL".equals(p.getRiskLevel())) && !p.isBreached())
                .collect(Collectors.toList());
    }
}
