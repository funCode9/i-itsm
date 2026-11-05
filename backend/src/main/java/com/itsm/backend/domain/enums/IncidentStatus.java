package com.itsm.backend.domain.enums;

/**
 * Incident lifecycle statuses.
 * Valid transitions are enforced in IncidentService (FSM pattern).
 *
 * NEW → CLASSIFIED → ASSIGNED → ACKNOWLEDGED → IN_PROGRESS → RESOLVED → VERIFIED → CLOSED
 */
public enum IncidentStatus {
    NEW,
    CLASSIFIED,
    ASSIGNED,
    ACKNOWLEDGED,
    IN_PROGRESS,
    RESOLVED,
    VERIFIED,
    CLOSED
}
