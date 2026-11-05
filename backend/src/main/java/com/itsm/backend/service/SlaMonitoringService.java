package com.itsm.backend.service;

import com.itsm.backend.domain.entity.*;
import com.itsm.backend.domain.enums.SlaStatus;
import com.itsm.backend.domain.enums.NotificationType;
import com.itsm.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * SLA monitoring service with scheduled checks.
 * Runs every 60 seconds to detect approaching and breached SLAs.
 *
 * OOP: Encapsulation — SLA logic is isolated in this service.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SlaMonitoringService {

    private final IncidentSlaRepository incidentSlaRepository;
    private final NotificationRepository notificationRepository;
    private final EmailLogRepository emailLogRepository;

    /** Run every 60 seconds */
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void monitorSlaCompliance() {
        List<IncidentSla> slaRecords = incidentSlaRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        for (IncidentSla sla : slaRecords) {
            Incident incident = sla.getIncident();
            // Skip already-closed incidents
            if (incident.getStatus().name().equals("CLOSED") || incident.getStatus().name().equals("VERIFIED")) continue;

            SlaStatus previousStatus = sla.getStatus();
            SlaStatus newStatus = computeSlaStatus(sla, now);

            if (newStatus != previousStatus) {
                sla.setStatus(newStatus);
                incidentSlaRepository.save(sla);

                if (newStatus == SlaStatus.APPROACHING) {
                    log.warn("SLA APPROACHING for incident {}", incident.getIncidentNumber());
                    sendSlaWarningNotification(sla, incident, false);
                } else if (newStatus == SlaStatus.BREACHED) {
                    log.error("SLA BREACHED for incident {}", incident.getIncidentNumber());
                    if (!sla.isResolutionBreached()) {
                        sla.setResolutionBreached(true);
                        incidentSlaRepository.save(sla);
                    }
                    sendSlaWarningNotification(sla, incident, true);
                }
            }
        }
    }

    private SlaStatus computeSlaStatus(IncidentSla sla, LocalDateTime now) {
        LocalDateTime deadline = sla.getResolutionDeadline();
        if (now.isAfter(deadline)) return SlaStatus.BREACHED;

        // "Approaching" = within 20% of the total window remaining
        long totalMinutes = java.time.Duration.between(sla.getIncident().getCreatedAt(), deadline).toMinutes();
        long remainingMinutes = java.time.Duration.between(now, deadline).toMinutes();
        if (totalMinutes > 0 && remainingMinutes <= (totalMinutes * 0.2)) return SlaStatus.APPROACHING;

        return SlaStatus.ON_TIME;
    }

    private void sendSlaWarningNotification(IncidentSla sla, Incident incident, boolean breached) {
        String title = breached ? "⚠️ SLA Breached" : "⏰ SLA Approaching";
        String message = breached
                ? "SLA has been BREACHED for incident " + incident.getIncidentNumber()
                : "SLA deadline approaching for incident " + incident.getIncidentNumber()
                  + " (deadline: " + sla.getResolutionDeadline() + ")";

        NotificationType type = breached ? NotificationType.SLA_BREACH : NotificationType.SLA_WARNING;

        // Notify reporter
        Notification reporterNotif = Notification.builder()
                .recipient(incident.getReporter())
                .title(title)
                .message(message)
                .notificationType(type)
                .relatedIncidentId(incident.getId())
                .relatedIncidentNumber(incident.getIncidentNumber())
                .build();
        notificationRepository.save(reporterNotif);

        // Notify assigned technician if exists
        if (incident.getAssignedTechnician() != null) {
            Notification techNotif = Notification.builder()
                    .recipient(incident.getAssignedTechnician().getUser())
                    .title(title)
                    .message(message)
                    .notificationType(type)
                    .relatedIncidentId(incident.getId())
                    .relatedIncidentNumber(incident.getIncidentNumber())
                    .build();
            notificationRepository.save(techNotif);
        }

        // Log simulated email
        EmailLog email = EmailLog.builder()
                .recipientEmail(incident.getReporter().getEmail())
                .recipientName(incident.getReporter().getFullName())
                .subject(title + ": " + incident.getIncidentNumber())
                .body(message)
                .relatedIncidentId(incident.getId())
                .relatedIncidentNumber(incident.getIncidentNumber())
                .build();
        emailLogRepository.save(email);
    }

    @Transactional(readOnly = true)
    public List<IncidentSla> getAllSlaRecords() {
        return incidentSlaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<IncidentSla> getBreachedSlas() {
        return incidentSlaRepository.findAllBreached();
    }
}
