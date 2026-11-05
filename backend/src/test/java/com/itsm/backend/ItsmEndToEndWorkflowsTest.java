package com.itsm.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.User;
import com.itsm.backend.domain.enums.IncidentStatus;
import com.itsm.backend.domain.enums.Role;
import com.itsm.backend.dto.LoginRequest;
import com.itsm.backend.repository.AuditLogRepository;
import com.itsm.backend.repository.IncidentRepository;
import com.itsm.backend.repository.NotificationRepository;
import com.itsm.backend.repository.UserRepository;
import com.itsm.backend.service.IncidentService;
import com.itsm.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@DisplayName("End-to-End Workflows & Integration Tests")
class ItsmEndToEndWorkflowsTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IncidentService incidentService;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    @DisplayName("Test 15: Full Authentication, Role-based Authorization & Bad Credentials rejection")
    void testAuthenticationAndRolePermissions() throws Exception {
        String testEmp = "test_emp_" + System.currentTimeMillis();
        // Register new employee
        String employeeJson = String.format("""
            {
                "username": "%s",
                "email": "%s@itsm.local",
                "password": "Password@123",
                "fullName": "Test Employee",
                "role": "EMPLOYEE"
            }
        """, testEmp, testEmp);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(employeeJson))
                .andExpect(status().isOk());

        // Login with valid credentials
        LoginRequest validLogin = new LoginRequest();
        validLogin.setUsername(testEmp);
        validLogin.setPassword("Password@123");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLogin)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("token").asText();
        assertNotNull(token);

        // Access protected employee API with token
        mockMvc.perform(get("/api/incidents")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // Attempt to access admin API as employee -> Must be 403 Forbidden
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        // Attempt login with wrong password -> Must be 401 Unauthorized
        LoginRequest badLogin = new LoginRequest();
        badLogin.setUsername("test_emp");
        badLogin.setPassword("WrongPassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Workflow 1: Employee reports incident, triggers Observer Pattern (Notifications & Audit)")
    void testWorkflow1_EmployeeReportIncident() throws InterruptedException {
        String uname = "wf1_emp_" + System.currentTimeMillis();
        User emp = userService.register(uname, uname + "@itsm.local", "Pass@123", "WF1 Employee", "Sales", "123", Role.EMPLOYEE);

        Incident incident = incidentService.createIncident(
                "Cannot access sales ERP",
                "Sales ERP throws error code 500 when logging in",
                emp.getId(),
                null,
                null,
                3, 2, 2
        );

        assertNotNull(incident.getId());
        assertEquals(uname, incident.getReporter().getUsername());
        assertEquals(IncidentStatus.NEW, incident.getStatus());

        // Wait briefly for Async Observer listeners to persist audit & notifications
        Thread.sleep(1000);

        assertFalse(auditLogRepository.findAll().isEmpty(), "Audit log should be recorded via Observer pattern");
    }

    @Test
    @DisplayName("Workflow 2: Technician acknowledges and resolves incident with notes")
    void testWorkflow2_TechnicianInvestigationAndResolution() {
        String empUname = "wf2_emp_" + System.currentTimeMillis();
        String techUname = "wf2_tech_" + System.currentTimeMillis();
        User emp = userService.register(empUname, empUname + "@itsm.local", "Pass@123", "WF2 Employee", "HR", "123", Role.EMPLOYEE);
        User techUser = userService.register(techUname, techUname + "@itsm.local", "Pass@123", "WF2 Tech", "IT", "123", Role.TECHNICIAN);

        Incident incident = incidentService.createIncident("Laptop keyboard unresponsive", "Spacebar stuck", emp.getId(), null, null, 1, 1, 1);

        // Move to CLASSIFIED and ASSIGNED
        incidentService.transitionStatus(incident.getId(), IncidentStatus.CLASSIFIED, null, null, techUser);
        incidentService.transitionStatus(incident.getId(), IncidentStatus.ASSIGNED, null, null, techUser);

        // Technician ACKNOWLEDGED
        incident = incidentService.transitionStatus(incident.getId(), IncidentStatus.ACKNOWLEDGED, null, null, techUser);
        assertEquals(IncidentStatus.ACKNOWLEDGED, incident.getStatus());
        assertNotNull(incident.getRespondedAt());

        // Technician IN_PROGRESS
        incident = incidentService.transitionStatus(incident.getId(), IncidentStatus.IN_PROGRESS, null, null, techUser);
        assertEquals(IncidentStatus.IN_PROGRESS, incident.getStatus());

        // Technician RESOLVED
        incident = incidentService.transitionStatus(incident.getId(), IncidentStatus.RESOLVED, "Cleaned physical spacebar switch", null, techUser);
        assertEquals(IncidentStatus.RESOLVED, incident.getStatus());
        assertEquals("Cleaned physical spacebar switch", incident.getResolutionDetails());
    }

    @Test
    @DisplayName("Workflow 3: Admin monitors metrics and Employee verifies closure")
    void testWorkflow3_AdminMonitoringAndClosure() {
        String empUname = "wf3_emp_" + System.currentTimeMillis();
        String adminUname = "wf3_admin_" + System.currentTimeMillis();
        User emp = userService.register(empUname, empUname + "@itsm.local", "Pass@123", "WF3 Emp", "Finance", "123", Role.EMPLOYEE);
        User admin = userService.register(adminUname, adminUname + "@itsm.local", "Pass@123", "WF3 Admin", "IT", "123", Role.ADMINISTRATOR);

        Incident incident = incidentService.createIncident("Printer jam", "Paper stuck in tray 2", emp.getId(), null, null, 1, 1, 1);
        incidentService.transitionStatus(incident.getId(), IncidentStatus.CLASSIFIED, null, null, admin);
        incidentService.transitionStatus(incident.getId(), IncidentStatus.ASSIGNED, null, null, admin);
        incidentService.transitionStatus(incident.getId(), IncidentStatus.ACKNOWLEDGED, null, null, admin);
        incidentService.transitionStatus(incident.getId(), IncidentStatus.IN_PROGRESS, null, null, admin);
        incidentService.transitionStatus(incident.getId(), IncidentStatus.RESOLVED, "Cleared jammed paper", null, admin);

        // Employee VERIFIED
        incident = incidentService.transitionStatus(incident.getId(), IncidentStatus.VERIFIED, null, null, emp);
        assertEquals(IncidentStatus.VERIFIED, incident.getStatus());

        // CLOSED
        incident = incidentService.transitionStatus(incident.getId(), IncidentStatus.CLOSED, null, "Ticket closed successfully", admin);
        assertEquals(IncidentStatus.CLOSED, incident.getStatus());
        assertNotNull(incident.getClosedAt());
    }
}
