package com.itsm.backend.domain.enums;

/**
 * Types of in-app notifications.
 */
public enum NotificationType {
    INCIDENT_CREATED,
    INCIDENT_ASSIGNED,
    STATUS_CHANGED,
    SLA_WARNING,
    SLA_BREACH,
    INFO_REQUESTED,
    INCIDENT_RESOLVED,
    INCIDENT_CLOSED,
    FEEDBACK_REQUESTED
}
