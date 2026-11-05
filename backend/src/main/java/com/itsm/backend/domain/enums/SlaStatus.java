package com.itsm.backend.domain.enums;

/**
 * SLA compliance status for an incident.
 */
public enum SlaStatus {
    ON_TIME,
    APPROACHING,  // Within 20% of deadline
    BREACHED
}
