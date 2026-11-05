package com.itsm.backend;

import com.itsm.backend.domain.entity.*;
import com.itsm.backend.repository.TechnicianRepository;
import com.itsm.backend.service.assignment.LeastLoadedAssignmentStrategy;
import com.itsm.backend.service.assignment.SkillBasedAssignmentStrategy;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Strategy Pattern - Technician Assignment Strategies")
class AssignmentStrategyTest {

    @Mock
    private TechnicianRepository technicianRepository;

    @InjectMocks
    private SkillBasedAssignmentStrategy skillBasedStrategy;

    @InjectMocks
    private LeastLoadedAssignmentStrategy leastLoadedStrategy;

    @Test
    @DisplayName("Test 9: Strategy Pattern - Skill-Based Strategy selects matching technician")
    void testSkillBasedStrategy() {
        User user1 = User.builder().fullName("Alex Network").build();
        Technician tech1 = Technician.builder()
                .id(1L)
                .user(user1)
                .available(true)
                .skills(List.of(TechnicianSkill.builder().skillName("vpn").build(),
                                TechnicianSkill.builder().skillName("network").build()))
                .build();

        User user2 = User.builder().fullName("Maria Hardware").build();
        Technician tech2 = Technician.builder()
                .id(2L)
                .user(user2)
                .available(true)
                .skills(List.of(TechnicianSkill.builder().skillName("hardware").build(),
                                TechnicianSkill.builder().skillName("printer").build()))
                .build();

        when(technicianRepository.findAvailableAndEnabled()).thenReturn(List.of(tech1, tech2));

        Incident incident = Incident.builder()
                .incidentNumber("INC-TEST-01")
                .title("VPN connection issue")
                .category(Category.builder().name("Network").build())
                .build();

        Optional<Technician> assigned = skillBasedStrategy.assignTechnician(incident);

        assertTrue(assigned.isPresent());
        assertEquals("Alex Network", assigned.get().getFullName());
    }

    @Test
    @DisplayName("Test 10: Strategy Pattern - Least-Loaded Strategy assigns to lowest active workload")
    void testLeastLoadedStrategy() {
        User user1 = User.builder().fullName("Tech Busy").build();
        Technician tech1 = Technician.builder().id(1L).user(user1).available(true).build();

        User user2 = User.builder().fullName("Tech Free").build();
        Technician tech2 = Technician.builder().id(2L).user(user2).available(true).build();

        when(technicianRepository.findAvailableAndEnabled()).thenReturn(List.of(tech1, tech2));
        when(technicianRepository.countActiveIncidents(1L)).thenReturn(8L);
        when(technicianRepository.countActiveIncidents(2L)).thenReturn(1L);

        Incident incident = Incident.builder().incidentNumber("INC-TEST-02").build();

        Optional<Technician> assigned = leastLoadedStrategy.assignTechnician(incident);

        assertTrue(assigned.isPresent());
        assertEquals("Tech Free", assigned.get().getFullName());
    }
}
