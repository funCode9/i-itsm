package com.itsm.backend.service.observer;

import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.Technician;
import com.itsm.backend.domain.entity.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event fired when a technician is assigned to an incident.
 */
@Getter
public class IncidentAssignedEvent extends ApplicationEvent {

    private final Incident incident;
    private final Technician technician;
    private final User actor;

    public IncidentAssignedEvent(Object source, Incident incident, Technician technician, User actor) {
        super(source);
        this.incident = incident;
        this.technician = technician;
        this.actor = actor;
    }
}
