package com.itsm.backend;

import com.itsm.backend.domain.entity.*;
import com.itsm.backend.domain.enums.Priority;
import com.itsm.backend.domain.enums.Role;
import com.itsm.backend.repository.*;
import com.itsm.backend.service.IncidentNoteService;
import com.itsm.backend.service.escalation.IncidentEscalationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
@DisplayName("Intelligent Features - Automated Incident Escalation Tests")
class IncidentEscalationTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private TechnicianRepository technicianRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AssignmentHistoryRepository assignmentHistoryRepository;

    @Mock
    private IncidentNoteService noteService;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private EmailLogRepository emailLogRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private IncidentEscalationService escalationService;

    @Test
    @DisplayName("Escalates priority and bumps tier level")
    void testIncidentPriorityEscalation() {
        User admin = User.builder().id(1L).fullName("System Admin").role(Role.ADMINISTRATOR).email("admin@itsm.local").build();
        User reporter = User.builder().id(2L).fullName("Alice Employee").role(Role.EMPLOYEE).email("alice@itsm.local").build();

        Technician currentTech = Technician.builder()
                .id(10L)
                .user(User.builder().id(11L).fullName("Junior Tech").build())
                .skills(List.of())
                .build();

        Technician seniorTech = Technician.builder()
                .id(20L)
                .user(User.builder().id(21L).fullName("Senior Specialist").build())
                .skills(List.of(TechnicianSkill.builder().skillName("Network").build()))
                .build();

        Category cat = Category.builder().id(1L).name("Network").build();

        Incident incident = Incident.builder()
                .id(301L)
                .incidentNumber("INC-20261111-0020")
                .title("Switch outage")
                .priority(Priority.P3_MEDIUM)
                .category(cat)
                .reporter(reporter)
                .assignedTechnician(currentTech)
                .escalated(false)
                .escalationLevel(0)
                .build();

        when(incidentRepository.findById(301L)).thenReturn(Optional.of(incident));
        when(technicianRepository.findAvailableAndEnabled()).thenReturn(List.of(currentTech, seniorTech));
        when(technicianRepository.countActiveIncidents(20L)).thenReturn(1L);
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Incident escalated = escalationService.escalateIncident(301L, "SLA Resolution Deadline Breached", admin);

        assertNotNull(escalated);
        assertTrue(escalated.isEscalated());
        assertEquals(1, escalated.getEscalationLevel());
        assertEquals(Priority.P2_HIGH, escalated.getPriority(), "P3 priority should be bumped to P2");
        assertEquals(seniorTech, escalated.getAssignedTechnician(), "Should reassign to senior specialist");
        verify(incidentRepository, atLeastOnce()).save(any(Incident.class));
    }
}
