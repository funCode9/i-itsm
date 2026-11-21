import os, sys

# We will run a JUnit test runner or invoke a Spring Boot test to execute and trace all 3 workflows
test_code = """package com.itsm.backend;

import com.itsm.backend.domain.entity.*;
import com.itsm.backend.domain.enums.*;
import com.itsm.backend.dto.SlaPredictionDTO;
import com.itsm.backend.dto.RootCauseAnalysisDTO;
import com.itsm.backend.repository.*;
import com.itsm.backend.service.IncidentService;
import com.itsm.backend.service.UserService;
import com.itsm.backend.service.escalation.IncidentEscalationService;
import com.itsm.backend.service.intelligence.DuplicateDetectionService;
import com.itsm.backend.service.intelligence.RootCauseAnalysisService;
import com.itsm.backend.service.intelligence.SlaPredictionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DisplayName("Faculty 3-Workflow Live Verification Suite")
public class LiveWorkflowsVerificationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private IncidentService incidentService;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private EmailLogRepository emailLogRepository;

    @Autowired
    private DuplicateDetectionService duplicateDetectionService;

    @Autowired
    private IncidentEscalationService escalationService;

    @Autowired
    private RootCauseAnalysisService rcaService;

    @Autowired
    private SlaPredictionService slaPredictionService;

    @Test
    @DisplayName("Verify Workflow 1: Employee reports -> system prioritizes -> technician assigned -> notification generated")
    void testWorkflow1_FullPipeline() throws InterruptedException {
        System.out.println("=== EXECUTING WORKFLOW 1 VERIFICATION ===");
        String uname = "wf1_user_" + System.currentTimeMillis();
        User employee = userService.register(uname, uname + "@itsm.local", "Pass@123", "WF1 Alice", "Finance", "101", Role.EMPLOYEE);

        // 1. Employee reports incident (Impact: 3, Urgency: 3, Criticality: 3)
        Incident incident = incidentService.createIncident(
                "Core payment gateway database connection failure",
                "Payment queries timing out with 500 Internal Server Error",
                employee.getId(),
                null,
                null,
                3, 3, 3
        );

        // 2. System prioritizes deterministically
        assertNotNull(incident);
        assertEquals(27, incident.getPriorityScore(), "Priority score must be 3*3*3 = 27");
        assertEquals(Priority.P1_CRITICAL, incident.getPriority(), "Score 27 must map to P1_CRITICAL");
        System.out.println("[WF1] Priority Engine calculated score: " + incident.getPriorityScore() + " -> " + incident.getPriority());

        // 3. Technician assigned via strategy
        incident = incidentService.classifyAndAssign(incident.getId(), null, null, 3, 3, 3, employee);
        assertEquals(IncidentStatus.ASSIGNED, incident.getStatus());
        assertNotNull(incident.getAssignedTechnician(), "Technician must be assigned by active strategy");
        System.out.println("[WF1] Technician assigned: " + incident.getAssignedTechnician().getFullName() + " (Strategy executed)");

        // 4. Notifications and Audit generated asynchronously via Observer pattern
        Thread.sleep(1200);
        List<Notification> notifs = notificationRepository.findByRecipientOrderByCreatedAtDesc(employee);
        assertFalse(notifs.isEmpty(), "Employee must receive an in-app notification");
        System.out.println("[WF1] In-app notification delivered to employee: " + notifs.get(0).getTitle());

        List<AuditLog> auditList = auditLogRepository.findByIncidentOrderByTimestampDesc(incident);
        assertFalse(auditList.isEmpty(), "Audit log entry must be recorded");
        System.out.println("[WF1] Immutable audit log recorded: " + auditList.get(0).getAction());
        System.out.println("=== WORKFLOW 1: VERIFIED & WORKING 100% ===\\n");
    }

    @Test
    @DisplayName("Verify Workflow 2: Technician investigates -> SLA monitored -> incident resolved -> user notified")
    void testWorkflow2_FullPipeline() throws InterruptedException {
        System.out.println("=== EXECUTING WORKFLOW 2 VERIFICATION ===");
        String empUname = "wf2_emp_" + System.currentTimeMillis();
        String techUname = "wf2_tech_" + System.currentTimeMillis();
        User employee = userService.register(empUname, empUname + "@itsm.local", "Pass@123", "WF2 Bob", "Engineering", "102", Role.EMPLOYEE);
        User techUser = userService.register(techUname, techUname + "@itsm.local", "Pass@123", "WF2 Sarah Tech", "IT Support", "103", Role.TECHNICIAN);

        Incident incident = incidentService.createIncident("VPN Gateway unreachable", "Cannot connect to Singapore VPN", employee.getId(), null, null, 2, 2, 2);
        incident = incidentService.classifyAndAssign(incident.getId(), null, null, 2, 2, 2, employee);

        // 1. Technician investigates
        incident = incidentService.transitionStatus(incident.getId(), IncidentStatus.ACKNOWLEDGED, null, null, techUser);
        assertEquals(IncidentStatus.ACKNOWLEDGED, incident.getStatus());
        assertNotNull(incident.getRespondedAt(), "SLA Response timestamp must be captured upon acknowledgment");
        System.out.println("[WF2] Technician acknowledged ticket. RespondedAt: " + incident.getRespondedAt());

        incident = incidentService.transitionStatus(incident.getId(), IncidentStatus.IN_PROGRESS, null, null, techUser);
        assertEquals(IncidentStatus.IN_PROGRESS, incident.getStatus());

        // Check SLA prediction and Root Cause Analysis
        SlaPredictionDTO slaRisk = slaPredictionService.predictSlaViolation(incident.getId());
        assertNotNull(slaRisk);
        System.out.println("[WF2] SLA Monitoring status: " + slaRisk.getRiskLevel() + " (Risk Score: " + slaRisk.getRiskScore() + ")");

        RootCauseAnalysisDTO rca = rcaService.analyzeRootCause(incident.getId());
        assertNotNull(rca);
        System.out.println("[WF2] Root Cause Analysis diagnosed failure category: " + rca.getPrimaryCategory());

        // 2. Incident resolved
        incident = incidentService.transitionStatus(incident.getId(), IncidentStatus.RESOLVED, "Rotated expired VPN certificates and restarted tunnel", null, techUser);
        assertEquals(IncidentStatus.RESOLVED, incident.getStatus());
        assertNotNull(incident.getResolvedAt(), "Resolution timestamp must be captured");
        System.out.println("[WF2] Incident resolved with details: " + incident.getResolutionDetails());

        // 3. User notified
        Thread.sleep(1200);
        List<Notification> empNotifs = notificationRepository.findByRecipientOrderByCreatedAtDesc(employee);
        assertFalse(empNotifs.isEmpty(), "User must be notified of ticket resolution");
        System.out.println("[WF2] User notification verified: " + empNotifs.get(0).getTitle());
        System.out.println("=== WORKFLOW 2: VERIFIED & WORKING 100% ===\\n");
    }

    @Test
    @DisplayName("Verify Workflow 3: Multiple incidents -> system identifies duplicates -> correlated/escalated")
    void testWorkflow3_FullPipeline() throws InterruptedException {
        System.out.println("=== EXECUTING WORKFLOW 3 VERIFICATION ===");
        String emp1Uname = "wf3_emp1_" + System.currentTimeMillis();
        String emp2Uname = "wf3_emp2_" + System.currentTimeMillis();
        User employee1 = userService.register(emp1Uname, emp1Uname + "@itsm.local", "Pass@123", "WF3 User 1", "Operations", "104", Role.EMPLOYEE);
        User employee2 = userService.register(emp2Uname, emp2Uname + "@itsm.local", "Pass@123", "WF3 User 2", "Operations", "105", Role.EMPLOYEE);
        User admin = userService.register("admin_" + System.currentTimeMillis(), "admin@itsm.local", "Pass@123", "Admin", "IT", "100", Role.ADMINISTRATOR);

        // 1. Employee 1 reports primary incident
        Incident incident1 = incidentService.createIncident("Corporate WiFi down on 3rd floor", "Entire 3rd floor lost wireless connection", employee1.getId(), null, null, 2, 2, 2);
        System.out.println("[WF3] Incident 1 reported: " + incident1.getIncidentNumber() + " - " + incident1.getTitle());

        // 2. Employee 2 attempts to report duplicate/related incident
        List<Incident> duplicates = duplicateDetectionService.findPotentialDuplicates(
                "WiFi disconnected on 3rd floor",
                "Wireless network unavailable on 3rd floor office",
                null,
                null,
                null
        );
        assertFalse(duplicates.isEmpty(), "System must identify correlated duplicate incident");
        System.out.println("[WF3] Duplicate Detection identified matching incident: " + duplicates.get(0).getIncidentNumber());

        // 3. Incident correlated & escalated (Bumps priority & reassigns to senior specialist)
        Incident escalated = escalationService.escalateIncident(incident1.getId(), "Multiple concurrent user reports of 3rd floor network outage", admin);
        assertNotNull(escalated);
        assertTrue(escalated.isEscalated(), "Ticket must be marked as escalated");
        assertEquals(1, escalated.getEscalationLevel());
        System.out.println("[WF3] Incident escalated! New Priority: " + escalated.getPriority() + " | Escalation Level: " + escalated.getEscalationLevel());

        Thread.sleep(1200);
        List<AuditLog> audits = auditLogRepository.findByIncidentOrderByTimestampDesc(escalated);
        assertFalse(audits.isEmpty());
        System.out.println("[WF3] Escalation audit log: " + audits.get(0).getDescription());
        System.out.println("=== WORKFLOW 3: VERIFIED & WORKING 100% ===\\n");
    }
}
"""

with open(r"c:\dev\i-itsm\backend\src\test\java\com\itsm\backend\LiveWorkflowsVerificationTest.java", "w", encoding="utf-8") as f:
    f.write(test_code)

print("Created LiveWorkflowsVerificationTest.java successfully.")
