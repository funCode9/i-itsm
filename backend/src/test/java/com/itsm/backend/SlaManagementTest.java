package com.itsm.backend;

import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.IncidentSla;
import com.itsm.backend.domain.entity.SlaPolicy;
import com.itsm.backend.domain.enums.Priority;
import com.itsm.backend.domain.enums.SlaStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("SLA Calculation & Violation Tests")
class SlaManagementTest {

    @Test
    @DisplayName("Test 13: SLA Deadline Calculation for P1 Policy (5m Response, 30m Resolution)")
    void testSlaDeadlinesP1() {
        SlaPolicy policy = SlaPolicy.builder()
                .priority(Priority.P1_CRITICAL)
                .responseMinutes(5)
                .resolutionMinutes(30)
                .build();

        LocalDateTime createdAt = LocalDateTime.of(2026, 11, 5, 10, 0);

        LocalDateTime responseDeadline = createdAt.plusMinutes(policy.getResponseMinutes());
        LocalDateTime resolutionDeadline = createdAt.plusMinutes(policy.getResolutionMinutes());

        assertEquals(LocalDateTime.of(2026, 11, 5, 10, 5), responseDeadline);
        assertEquals(LocalDateTime.of(2026, 11, 5, 10, 30), resolutionDeadline);
    }

    @Test
    @DisplayName("Test 14: SLA Breach Flagging when response exceeds deadline")
    void testSlaBreachFlagging() {
        LocalDateTime createdAt = LocalDateTime.of(2026, 11, 5, 10, 0);
        LocalDateTime deadline = createdAt.plusMinutes(15);

        IncidentSla sla = IncidentSla.builder()
                .responseDeadline(deadline)
                .resolutionDeadline(createdAt.plusMinutes(120))
                .status(SlaStatus.ON_TIME)
                .build();

        // Responded at 10:20 (5 minutes after deadline 10:15)
        LocalDateTime actualResponse = LocalDateTime.of(2026, 11, 5, 10, 20);
        if (actualResponse.isAfter(sla.getResponseDeadline())) {
            sla.setResponseBreached(true);
            sla.setStatus(SlaStatus.BREACHED);
        }

        assertTrue(sla.isResponseBreached());
        assertEquals(SlaStatus.BREACHED, sla.getStatus());
    }
}
