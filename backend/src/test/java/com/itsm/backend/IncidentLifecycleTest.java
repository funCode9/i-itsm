package com.itsm.backend;

import com.itsm.backend.domain.enums.IncidentStatus;
import com.itsm.backend.exception.InvalidStateTransitionException;
import com.itsm.backend.service.IncidentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Finite State Machine & Lifecycle Transition Tests")
class IncidentLifecycleTest {

    private final IncidentService incidentService = new IncidentService(
            null, null, null, null, null, null, null, null, null, null, null, null, null
    );

    @Test
    @DisplayName("Test 11: Valid Sequential Lifecycle Transitions")
    void testValidTransitions() {
        assertDoesNotThrow(() -> incidentService.validateTransition(IncidentStatus.NEW, IncidentStatus.CLASSIFIED));
        assertDoesNotThrow(() -> incidentService.validateTransition(IncidentStatus.CLASSIFIED, IncidentStatus.ASSIGNED));
        assertDoesNotThrow(() -> incidentService.validateTransition(IncidentStatus.ASSIGNED, IncidentStatus.ACKNOWLEDGED));
        assertDoesNotThrow(() -> incidentService.validateTransition(IncidentStatus.ACKNOWLEDGED, IncidentStatus.IN_PROGRESS));
        assertDoesNotThrow(() -> incidentService.validateTransition(IncidentStatus.IN_PROGRESS, IncidentStatus.RESOLVED));
        assertDoesNotThrow(() -> incidentService.validateTransition(IncidentStatus.RESOLVED, IncidentStatus.VERIFIED));
        assertDoesNotThrow(() -> incidentService.validateTransition(IncidentStatus.RESOLVED, IncidentStatus.CLOSED));
        assertDoesNotThrow(() -> incidentService.validateTransition(IncidentStatus.VERIFIED, IncidentStatus.CLOSED));
    }

    @Test
    @DisplayName("Test 12: Invalid Direct Transitions Trigger InvalidStateTransitionException")
    void testInvalidTransitions() {
        // Cannot jump directly from NEW to CLOSED
        assertThrows(InvalidStateTransitionException.class, () ->
                incidentService.validateTransition(IncidentStatus.NEW, IncidentStatus.CLOSED));

        // Cannot jump directly from NEW to RESOLVED
        assertThrows(InvalidStateTransitionException.class, () ->
                incidentService.validateTransition(IncidentStatus.NEW, IncidentStatus.RESOLVED));

        // Cannot transition from CLOSED to any state
        assertThrows(InvalidStateTransitionException.class, () ->
                incidentService.validateTransition(IncidentStatus.CLOSED, IncidentStatus.IN_PROGRESS));
    }
}
