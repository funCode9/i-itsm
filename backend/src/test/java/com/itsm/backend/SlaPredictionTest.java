package com.itsm.backend;

import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.IncidentSla;
import com.itsm.backend.domain.entity.SlaPolicy;
import com.itsm.backend.domain.entity.Technician;
import com.itsm.backend.domain.enums.IncidentStatus;
import com.itsm.backend.domain.enums.Priority;
import com.itsm.backend.domain.enums.SlaStatus;
import com.itsm.backend.dto.SlaPredictionDTO;
import com.itsm.backend.repository.IncidentRepository;
import com.itsm.backend.repository.IncidentSlaRepository;
import com.itsm.backend.repository.TechnicianRepository;
import com.itsm.backend.service.intelligence.SlaPredictionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Intelligent Features - Predictive SLA Violation Detection Tests")
class SlaPredictionTest {

    @Mock
    private IncidentSlaRepository incidentSlaRepository;

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private TechnicianRepository technicianRepository;

    @InjectMocks
    private SlaPredictionService slaPredictionService;

    @Test
    @DisplayName("Predicts HIGH/CRITICAL SLA risk when 85% elapsed in NEW status")
    void testPredictHighSlaRisk() {
        LocalDateTime createdAt = LocalDateTime.now().minusMinutes(85);
        LocalDateTime deadline = LocalDateTime.now().plusMinutes(15);

        Incident incident = Incident.builder()
                .id(100L)
                .incidentNumber("INC-20261111-0001")
                .title("Database slow response")
                .status(IncidentStatus.NEW)
                .priority(Priority.P1_CRITICAL)
                .createdAt(createdAt)
                .build();

        IncidentSla sla = IncidentSla.builder()
                .id(1L)
                .incident(incident)
                .policy(SlaPolicy.builder().priority(Priority.P1_CRITICAL).resolutionMinutes(100).build())
                .resolutionDeadline(deadline)
                .status(SlaStatus.ON_TIME)
                .build();

        SlaPredictionDTO prediction = slaPredictionService.predictSlaRisk(sla);

        assertNotNull(prediction);
        assertEquals("INC-20261111-0001", prediction.getIncidentNumber());
        assertTrue(prediction.getRiskScore() >= 70, "Risk score should be high due to 85% elapsed time + NEW stage inertia");
        assertTrue(prediction.getRiskLevel().equals("HIGH") || prediction.getRiskLevel().equals("CRITICAL"));
        assertFalse(prediction.getRiskFactors().isEmpty());
    }

    @Test
    @DisplayName("Predicts LOW SLA risk for freshly created ticket with plenty of time")
    void testPredictLowSlaRisk() {
        LocalDateTime createdAt = LocalDateTime.now().minusMinutes(5);
        LocalDateTime deadline = LocalDateTime.now().plusMinutes(240);

        Technician tech = Technician.builder()
                .id(5L)
                .user(com.itsm.backend.domain.entity.User.builder().fullName("Alex Specialist").build())
                .build();

        Incident incident = Incident.builder()
                .id(101L)
                .incidentNumber("INC-20261111-0002")
                .title("Minor font issue")
                .status(IncidentStatus.IN_PROGRESS)
                .priority(Priority.P4_LOW)
                .assignedTechnician(tech)
                .createdAt(createdAt)
                .build();

        IncidentSla sla = IncidentSla.builder()
                .id(2L)
                .incident(incident)
                .resolutionDeadline(deadline)
                .status(SlaStatus.ON_TIME)
                .build();

        when(technicianRepository.countActiveIncidents(5L)).thenReturn(1L);

        SlaPredictionDTO prediction = slaPredictionService.predictSlaRisk(sla);

        assertNotNull(prediction);
        assertTrue(prediction.getRiskScore() < 50, "Risk score should be low for fresh P4 in progress");
        assertEquals("LOW", prediction.getRiskLevel());
    }
}
