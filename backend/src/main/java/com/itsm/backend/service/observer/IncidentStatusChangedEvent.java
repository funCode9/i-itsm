package com.itsm.backend.service.observer;

import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.User;
import com.itsm.backend.domain.enums.IncidentStatus;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Application event fired whenever an incident's status changes.
 * Observed by: AuditEventListener, NotificationEventListener, SlaEventListener.
 *
 * OOP: Observer Pattern — this event is the "notification" sent to registered listeners.
 */
@Getter
public class IncidentStatusChangedEvent extends ApplicationEvent {

    private final Incident incident;
    private final IncidentStatus previousStatus;
    private final IncidentStatus newStatus;
    private final User actor;
    private final String description;

    public IncidentStatusChangedEvent(Object source, Incident incident,
                                      IncidentStatus previousStatus, IncidentStatus newStatus,
                                      User actor, String description) {
        super(source);
        this.incident = incident;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.actor = actor;
        this.description = description;
    }
}
