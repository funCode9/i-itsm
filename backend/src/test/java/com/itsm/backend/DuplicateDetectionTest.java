package com.itsm.backend;

import com.itsm.backend.domain.entity.Category;
import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.ItService;
import com.itsm.backend.repository.IncidentRepository;
import com.itsm.backend.service.intelligence.DuplicateDetectionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Intelligent Features - Duplicate Incident Detection Tests")
class DuplicateDetectionTest {

    @Mock
    private IncidentRepository incidentRepository;

    @InjectMocks
    private DuplicateDetectionService duplicateDetectionService;

    @Test
    @DisplayName("Test 7: Detect Duplicate Incident with similar title and service")
    void testDuplicateDetectionSuccess() {
        Category netCategory = Category.builder().id(10L).name("Network").build();
        ItService wifiService = ItService.builder().id(20L).name("Corporate WiFi").build();

        Incident existing = Incident.builder()
                .id(101L)
                .incidentNumber("INC-20261105-0001")
                .title("Corporate WiFi is down on 3rd floor")
                .description("Cannot connect to corporate wifi anywhere on floor 3")
                .category(netCategory)
                .service(wifiService)
                .build();

        when(incidentRepository.findAllOpen()).thenReturn(List.of(existing));

        List<Incident> duplicates = duplicateDetectionService.findPotentialDuplicates(
                "Corporate WiFi not working on 3rd floor",
                "Wifi connection dropped on the 3rd floor",
                10L,
                20L,
                null
        );

        assertFalse(duplicates.isEmpty());
        assertEquals("INC-20261105-0001", duplicates.get(0).getIncidentNumber());
    }

    @Test
    @DisplayName("Test 8: Distinguish Unrelated Incidents as non-duplicates")
    void testDifferentIncidentNotDuplicate() {
        Category netCategory = Category.builder().id(10L).name("Network").build();
        Category hwCategory = Category.builder().id(11L).name("Hardware").build();

        Incident existing = Incident.builder()
                .id(101L)
                .incidentNumber("INC-20261105-0001")
                .title("Corporate WiFi is down")
                .description("Wifi connection dropped")
                .category(netCategory)
                .build();

        when(incidentRepository.findAllOpen()).thenReturn(List.of(existing));

        List<Incident> duplicates = duplicateDetectionService.findPotentialDuplicates(
                "Laptop battery replaced",
                "Laptop battery swollen, need physical hardware replacement",
                11L,
                null,
                null
        );

        assertTrue(duplicates.isEmpty());
    }
}
