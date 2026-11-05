package com.itsm.backend.service.observer;

import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event fired when a new incident is created.
 */
@Getter
public class IncidentCreatedEvent extends ApplicationEvent {

    private final Incident incident;
    private final User actor;

    public IncidentCreatedEvent(Object source, Incident incident, User actor) {
        super(source);
        this.incident = incident;
        this.actor = actor;
    }
}
