package com.itsm.backend;

import com.itsm.backend.domain.entity.Category;
import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.ItService;
import com.itsm.backend.dto.RootCauseAnalysisDTO;
import com.itsm.backend.repository.IncidentNoteRepository;
import com.itsm.backend.repository.IncidentRepository;
import com.itsm.backend.service.intelligence.RootCauseAnalysisService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
@DisplayName("Intelligent Features - Automated Root-Cause Analysis Tests")
class RootCauseAnalysisTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private IncidentNoteRepository noteRepository;

    @InjectMocks
    private RootCauseAnalysisService rootCauseAnalysisService;

    @Test
    @DisplayName("Infers Network & Infrastructure RCA for VPN connectivity failure")
    void testNetworkRootCauseAnalysis() {
        Category cat = Category.builder().id(1L).name("Network").build();
        ItService svc = ItService.builder().id(10L).name("Corporate VPN").build();

        Incident incident = Incident.builder()
                .id(201L)
                .incidentNumber("INC-20261111-0010")
                .title("Cannot reach internal gateway via VPN")
                .description("VPN tunnel drops every 2 minutes with high packet loss and unreachable gateway ip")
                .category(cat)
                .service(svc)
                .createdAt(LocalDateTime.now())
                .build();

        when(incidentRepository.findById(201L)).thenReturn(Optional.of(incident));
        when(noteRepository.findByIncidentIdOrderByCreatedAtAsc(201L)).thenReturn(Collections.emptyList());
        when(incidentRepository.findAll()).thenReturn(Collections.emptyList());

        RootCauseAnalysisDTO rca = rootCauseAnalysisService.analyzeIncident(201L);

        assertNotNull(rca);
        assertEquals("Network & Infrastructure", rca.getDomainClassification());
        assertTrue(rca.getConfidenceScore() >= 60);
        assertTrue(rca.getEvidenceKeywords().contains("vpn"));
        assertFalse(rca.getRemediationSteps().isEmpty());
        assertNotNull(rca.getRecommendedWorkaround());
    }

    @Test
    @DisplayName("Infers Database RCA for deadlock and connection pool exhaustion")
    void testDatabaseRootCauseAnalysis() {
        Incident incident = Incident.builder()
                .id(202L)
                .incidentNumber("INC-20261111-0011")
                .title("Hikari connection pool timeout during checkout")
                .description("Postgres database deadlock detected on order_items table; queries timing out")
                .createdAt(LocalDateTime.now())
                .build();

        when(incidentRepository.findById(202L)).thenReturn(Optional.of(incident));
        when(noteRepository.findByIncidentIdOrderByCreatedAtAsc(202L)).thenReturn(Collections.emptyList());
        when(incidentRepository.findAll()).thenReturn(Collections.emptyList());

        RootCauseAnalysisDTO rca = rootCauseAnalysisService.analyzeIncident(202L);

        assertNotNull(rca);
        assertEquals("Database & Persistence", rca.getDomainClassification());
        assertTrue(rca.getConfidenceScore() >= 65);
        assertFalse(rca.getRemediationSteps().isEmpty());
    }
}
