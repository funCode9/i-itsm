package com.itsm.backend.service.observer;

import com.itsm.backend.domain.entity.Notification;
import com.itsm.backend.domain.entity.EmailLog;
import com.itsm.backend.domain.entity.User;
import com.itsm.backend.domain.enums.NotificationType;
import com.itsm.backend.repository.NotificationRepository;
import com.itsm.backend.repository.EmailLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Observer: Listens to incident events and creates in-app + simulated email notifications.
 *
 * OOP: Observer Pattern — two notification mechanisms triggered by the same events.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationRepository notificationRepository;
    private final EmailLogRepository emailLogRepository;

    @EventListener
    @Async
    public void onIncidentCreated(IncidentCreatedEvent event) {
        // Notify the reporter that their incident was received
        createInAppNotification(
            event.getActor(),
            "Incident Created",
            "Your incident " + event.getIncident().getIncidentNumber() + " has been submitted successfully.",
            NotificationType.INCIDENT_CREATED,
            event.getIncident().getId(),
            event.getIncident().getIncidentNumber()
        );
        sendEmailLog(
            event.getActor(),
            "Incident Created: " + event.getIncident().getIncidentNumber(),
            "Dear " + event.getActor().getFullName() + ",\n\nYour incident has been created:\nNumber: "
            + event.getIncident().getIncidentNumber() + "\nTitle: " + event.getIncident().getTitle()
            + "\nPriority: " + (event.getIncident().getPriority() != null ? event.getIncident().getPriority() : "Pending")
            + "\n\nWe will assign a technician shortly.\n\nI-ITSM System",
            event.getIncident().getId(), event.getIncident().getIncidentNumber()
        );
    }

    @EventListener
    @Async
    public void onStatusChanged(IncidentStatusChangedEvent event) {
        User reporter = event.getIncident().getReporter();
        String msg = "Incident " + event.getIncident().getIncidentNumber() + " status changed from "
                + event.getPreviousStatus() + " to " + event.getNewStatus();

        createInAppNotification(reporter, "Incident Status Updated", msg,
                NotificationType.STATUS_CHANGED,
                event.getIncident().getId(), event.getIncident().getIncidentNumber());

        // If resolved, notify reporter to provide feedback
        if (event.getNewStatus().name().equals("RESOLVED")) {
            createInAppNotification(reporter, "Please Provide Feedback",
                    "Incident " + event.getIncident().getIncidentNumber() + " has been resolved. Please rate the support.",
                    NotificationType.FEEDBACK_REQUESTED,
                    event.getIncident().getId(), event.getIncident().getIncidentNumber());
        }
    }

    @EventListener
    @Async
    public void onIncidentAssigned(IncidentAssignedEvent event) {
        User techUser = event.getTechnician().getUser();
        createInAppNotification(techUser,
                "New Incident Assigned",
                "Incident " + event.getIncident().getIncidentNumber() + " has been assigned to you: " + event.getIncident().getTitle(),
                NotificationType.INCIDENT_ASSIGNED,
                event.getIncident().getId(), event.getIncident().getIncidentNumber());

        sendEmailLog(techUser,
                "New Incident Assigned: " + event.getIncident().getIncidentNumber(),
                "Dear " + techUser.getFullName() + ",\n\nA new incident has been assigned to you:\nNumber: "
                + event.getIncident().getIncidentNumber() + "\nTitle: " + event.getIncident().getTitle()
                + "\nPriority: " + event.getIncident().getPriority()
                + "\n\nPlease acknowledge and begin investigation.\n\nI-ITSM System",
                event.getIncident().getId(), event.getIncident().getIncidentNumber());
    }

    private void createInAppNotification(User recipient, String title, String message,
                                          NotificationType type, Long incidentId, String incidentNumber) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .notificationType(type)
                .relatedIncidentId(incidentId)
                .relatedIncidentNumber(incidentNumber)
                .build();
        notificationRepository.save(notification);
    }

    private void sendEmailLog(User recipient, String subject, String body, Long incidentId, String incidentNumber) {
        EmailLog email = EmailLog.builder()
                .recipientEmail(recipient.getEmail())
                .recipientName(recipient.getFullName())
                .subject(subject)
                .body(body)
                .relatedIncidentId(incidentId)
                .relatedIncidentNumber(incidentNumber)
                .build();
        emailLogRepository.save(email);
        log.info("[EMAIL SIMULATED] To: {} | Subject: {}", recipient.getEmail(), subject);
    }
}
