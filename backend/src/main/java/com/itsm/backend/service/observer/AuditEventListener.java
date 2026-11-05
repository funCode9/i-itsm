package com.itsm.backend.service.observer;

import com.itsm.backend.domain.entity.AuditLog;
import com.itsm.backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Observer: Listens to incident events and writes immutable audit log entries.
 *
 * OOP: Observer Pattern — this component is registered as a listener (observer).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditEventListener {

    private final AuditLogRepository auditLogRepository;

    @EventListener
    @Async
    public void onIncidentCreated(IncidentCreatedEvent event) {
        AuditLog log = AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .actor(event.getActor())
                .incident(event.getIncident())
                .action("INCIDENT_CREATED")
                .newState(event.getIncident().getStatus().name())
                .description("Incident " + event.getIncident().getIncidentNumber() + " created by " + event.getActor().getUsername())
                .build();
        auditLogRepository.save(log);
    }

    @EventListener
    @Async
    public void onStatusChanged(IncidentStatusChangedEvent event) {
        AuditLog log = AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .actor(event.getActor())
                .incident(event.getIncident())
                .action("STATUS_CHANGED")
                .previousState(event.getPreviousStatus().name())
                .newState(event.getNewStatus().name())
                .description(event.getDescription())
                .build();
        auditLogRepository.save(log);
    }

    @EventListener
    @Async
    public void onIncidentAssigned(IncidentAssignedEvent event) {
        AuditLog log = AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .actor(event.getActor())
                .incident(event.getIncident())
                .action("INCIDENT_ASSIGNED")
                .newState(event.getIncident().getStatus().name())
                .description("Assigned to technician: " + event.getTechnician().getFullName())
                .build();
        auditLogRepository.save(log);
    }
}
