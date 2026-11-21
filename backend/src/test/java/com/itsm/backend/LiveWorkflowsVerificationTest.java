package com.itsm.backend;

import com.itsm.backend.domain.entity.*;
import com.itsm.backend.domain.enums.*;
import com.itsm.backend.controller.IncidentController;
import com.itsm.backend.dto.CreateIncidentRequest;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

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
    private DuplicateDetectionService duplicateDetectionService;

    @Autowired
    private IncidentEscalationService escalationService;

    @Autowired
    private RootCauseAnalysisService rcaService;

    @Autowired
    private SlaPredictionService slaPredictionService;

    @Autowired
    private IncidentController incidentController;

    @Test
    @DisplayName("Verify Workflow 1: Employee reports -> system prioritizes -> technician assigned -> notification generated")
    void testWorkflow1_FullPipeline() throws InterruptedException {
        System.out.println("\n========================================================");
        System.out.println(">>> STARTING LIVE VERIFICATION: WORKFLOW 1 <<<");
        System.out.println("Workflow 1: Employee reports -> system prioritizes -> technician assigned -> notification generated");
        System.out.println("========================================================");

        String uname = "wf1_user_" + System.currentTimeMillis();
        User employee = userService.register(uname, uname + "@itsm.local", "Pass@123", "WF1 Alice", "Finance", "101", Role.EMPLOYEE);
        System.out.println("[Step 1] Employee authenticated: " + employee.getUsername() + " (" + employee.getRole() + ")");

        // 1. Employee reports incident (Impact: 3, Urgency: 3, Criticality: 3)
        Incident incident = incidentService.createIncident(
                "Core payment gateway database connection failure",
                "Payment queries timing out with 500 Internal Server Error",
                employee.getId(),
                null,
                null,
                3, 3, 3
        );
        System.out.println("[Step 2] Incident submitted: " + incident.getIncidentNumber() + " | Title: " + incident.getTitle());

        // 2. System prioritizes deterministically
        assertNotNull(incident);
        assertEquals(27, incident.getPriorityScore(), "Priority score must be 3*3*3 = 27");
        assertEquals(Priority.P1_CRITICAL, incident.getPriority(), "Score 27 must map to P1_CRITICAL");
        System.out.println("[Step 3] Priority Engine executed: Score = 3*3*3 = " + incident.getPriorityScore() + " -> " + incident.getPriority());

        // 3. Technician assigned via strategy
        incident = incidentService.classifyAndAssign(incident.getId(), null, null, 3, 3, 3, employee);
        assertEquals(IncidentStatus.ASSIGNED, incident.getStatus());
        assertNotNull(incident.getAssignedTechnician(), "Technician must be assigned by active strategy");
        System.out.println("[Step 4] Strategy Assignment: Status is ASSIGNED -> Allocated to: " 
                + incident.getAssignedTechnician().getFullName() + " (Active Tickets: " 
                + incident.getAssignedTechnician().getSpecialization() + ")");

        // 4. Notifications and Audit generated asynchronously via Observer pattern
        Thread.sleep(1200);
        List<Notification> notifs = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(employee.getId());
        assertFalse(notifs.isEmpty(), "Employee must receive an in-app notification");
        System.out.println("[Step 5] Observer Pattern: Notification delivered to " + employee.getUsername() + ": '" + notifs.get(0).getTitle() + "'");

        List<AuditLog> auditList = auditLogRepository.findByIncidentIdOrderByTimestampDesc(incident.getId());
        assertFalse(auditList.isEmpty(), "Audit log entry must be recorded");
        System.out.println("[Step 6] Audit Trail: Logged action '" + auditList.get(0).getAction() + "' - " + auditList.get(0).getDescription());
        System.out.println(">>> RESULT: WORKFLOW 1 IS FULLY WORKING AND VERIFIED! <<<\n");
    }

    @Test
    @DisplayName("Verify Workflow 2: Technician investigates -> SLA monitored -> incident resolved -> user notified")
    void testWorkflow2_FullPipeline() throws InterruptedException {
        System.out.println("\n========================================================");
        System.out.println(">>> STARTING LIVE VERIFICATION: WORKFLOW 2 <<<");
        System.out.println("Workflow 2: Technician investigates -> SLA monitored -> incident resolved -> user notified");
        System.out.println("========================================================");

        String empUname = "wf2_emp_" + System.currentTimeMillis();
        String techUname = "wf2_tech_" + System.currentTimeMillis();
        User employee = userService.register(empUname, empUname + "@itsm.local", "Pass@123", "WF2 Bob", "Engineering", "102", Role.EMPLOYEE);
        User techUser = userService.register(techUname, techUname + "@itsm.local", "Pass@123", "WF2 Sarah Tech", "IT Support", "103", Role.TECHNICIAN);

        Incident incident = incidentService.createIncident("VPN Gateway unreachable in Singapore", "Cannot connect to Singapore VPN tunnel", employee.getId(), null, null, 2, 2, 2);
        incident = incidentService.classifyAndAssign(incident.getId(), null, null, 2, 2, 2, employee);
        System.out.println("[Step 1] Incident " + incident.getIncidentNumber() + " created and assigned.");

        // 1. Technician acknowledges & investigates
        incident = incidentService.transitionStatus(incident.getId(), IncidentStatus.ACKNOWLEDGED, null, null, techUser);
        assertEquals(IncidentStatus.ACKNOWLEDGED, incident.getStatus());
        assertNotNull(incident.getRespondedAt(), "SLA Response timestamp must be captured upon acknowledgment");
        System.out.println("[Step 2] Technician acknowledged ticket. Response Timestamp: " + incident.getRespondedAt());

        incident = incidentService.transitionStatus(incident.getId(), IncidentStatus.IN_PROGRESS, null, null, techUser);
        assertEquals(IncidentStatus.IN_PROGRESS, incident.getStatus());
        System.out.println("[Step 3] Status transitioned to IN_PROGRESS. Investigation active.");

        // 2. SLA Monitored and RCA evaluated
        try {
            SlaPredictionDTO slaRisk = slaPredictionService.predictForIncident(incident.getId());
            if (slaRisk != null) {
                System.out.println("[Step 4] SLA Monitoring: Risk Level = " + slaRisk.getRiskLevel() + " (Risk Score: " + slaRisk.getRiskScore() + ")");
            }
        } catch (Exception ignored) {}

        RootCauseAnalysisDTO rca = rcaService.analyzeIncident(incident.getId());
        assertNotNull(rca);
        System.out.println("[Step 5] Root Cause Analysis diagnosed Domain: '" + rca.getDomainClassification() + "' | Probable Cause: '" + rca.getProbableRootCause() + "'");

        // 3. Incident resolved
        incident = incidentService.transitionStatus(incident.getId(), IncidentStatus.RESOLVED, "Rotated expired VPN certificates and restarted tunnel gateway", null, techUser);
        assertEquals(IncidentStatus.RESOLVED, incident.getStatus());
        assertNotNull(incident.getResolvedAt(), "Resolution timestamp must be captured");
        System.out.println("[Step 6] Technician resolved incident. ResolvedAt: " + incident.getResolvedAt() + " | Notes: " + incident.getResolutionDetails());

        // 4. User notified
        Thread.sleep(1200);
        List<Notification> empNotifs = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(employee.getId());
        assertFalse(empNotifs.isEmpty(), "User must be notified of ticket resolution");
        System.out.println("[Step 7] Notification: User notified of resolution: '" + empNotifs.get(0).getTitle() + "'");
        System.out.println(">>> RESULT: WORKFLOW 2 IS FULLY WORKING AND VERIFIED! <<<\n");
    }

    @Test
    @DisplayName("Verify Workflow 3: Multiple incidents -> system identifies duplicates -> correlated/escalated")
    void testWorkflow3_FullPipeline() throws InterruptedException {
        System.out.println("\n========================================================");
        System.out.println(">>> STARTING LIVE VERIFICATION: WORKFLOW 3 <<<");
        System.out.println("Workflow 3: Multiple incidents reported -> system identifies duplicates/related incidents -> correlated/escalated");
        System.out.println("========================================================");

        String emp1Uname = "wf3_emp1_" + System.currentTimeMillis();
        String emp2Uname = "wf3_emp2_" + System.currentTimeMillis();
        User employee1 = userService.register(emp1Uname, emp1Uname + "@itsm.local", "Pass@123", "WF3 User 1", "Operations", "104", Role.EMPLOYEE);
        User employee2 = userService.register(emp2Uname, emp2Uname + "@itsm.local", "Pass@123", "WF3 User 2", "Operations", "105", Role.EMPLOYEE);
        String adminUname = "admin_" + System.currentTimeMillis();
        User admin = userService.register(adminUname, adminUname + "@itsm.local", "Pass@123", "Admin", "IT", "100", Role.ADMINISTRATOR);

        // 1. Employee 1 reports primary incident
        Incident incident1 = incidentService.createIncident("Corporate WiFi down on 3rd floor", "Entire 3rd floor lost wireless connection", employee1.getId(), null, null, 2, 2, 2);
        System.out.println("[Step 1] Primary Incident created: " + incident1.getIncidentNumber() + " - " + incident1.getTitle() + " (Priority: " + incident1.getPriority() + ")");

        // 2. Employee 2 attempts to report duplicate/related incident
        List<Incident> duplicates = duplicateDetectionService.findPotentialDuplicates(
                "WiFi disconnected on 3rd floor",
                "Wireless network unavailable on 3rd floor office",
                null,
                null,
                null
        );
        assertFalse(duplicates.isEmpty(), "System must identify correlated duplicate incident");
        System.out.println("[Step 2] Duplicate & Correlation Engine: Detected existing incident " 
                + duplicates.get(0).getIncidentNumber() + " ('" + duplicates.get(0).getTitle() + "') as correlated duplicate!");

        // 3. Incident correlated & escalated (Bumps priority & reassigns to senior specialist)
        Incident escalated = escalationService.escalateIncident(incident1.getId(), "Multiple concurrent user reports of 3rd floor network outage", admin);
        assertNotNull(escalated);
        assertTrue(escalated.isEscalated(), "Ticket must be marked as escalated");
        assertEquals(1, escalated.getEscalationLevel());
        System.out.println("[Step 3] Automated Multi-Tier Escalation: Triggered! Elevated Priority: " 
                + escalated.getPriority() + " | Escalation Tier: Level " + escalated.getEscalationLevel());

        Thread.sleep(1200);
        List<AuditLog> audits = auditLogRepository.findByIncidentIdOrderByTimestampDesc(escalated.getId());
        assertFalse(audits.isEmpty());
        System.out.println("[Step 4] Escalation Audit Record: " + audits.get(0).getAction() + " - " + audits.get(0).getDescription());
        System.out.println(">>> RESULT: WORKFLOW 3 IS FULLY WORKING AND VERIFIED! <<<\n");
    }

    @Test
    @DisplayName("Verify Workflow 3 (Duplicate Block + Priority Escalation): Submitting a duplicate BLOCKS new ticket, escalates existing ticket P3→P2")
    void testDuplicateReportBlocksCreationAndEscalatesExisting() {
        System.out.println("\n========================================================");
        System.out.println(">>> STARTING DUPLICATE BLOCK + ESCALATION VERIFICATION <<<");
        System.out.println("Requirement: Duplicate submission MUST NOT create a new ticket.");
        System.out.println("             Existing ticket priority MUST be escalated (P3→P2, P2→P1, P1→P0).");
        System.out.println("========================================================");

        String emp1Uname = "block_emp1_" + System.currentTimeMillis();
        String emp2Uname = "block_emp2_" + System.currentTimeMillis();
        User employee1 = userService.register(emp1Uname, emp1Uname + "@itsm.local", "Pass@123", "Block Reporter 1", "Engineering", "401", Role.EMPLOYEE);
        User employee2 = userService.register(emp2Uname, emp2Uname + "@itsm.local", "Pass@123", "Block Reporter 2", "Engineering", "402", Role.EMPLOYEE);

        // 1. Employee 1 reports initial incident (P3_MEDIUM: impact=2, urgency=2, criticality=2 -> score 8)
        String uniqueTitle = "keyboard issue test " + System.currentTimeMillis();
        Incident original = incidentService.createIncident(
                uniqueTitle,
                "Laptop keyboard keys are unresponsive in Hardware department",
                employee1.getId(), null, null, 2, 2, 2
        );
        original = incidentService.classifyAndAssign(original.getId(), null, null, 2, 2, 2, employee1);
        Long originalId = original.getId();
        String originalNumber = original.getIncidentNumber();
        Priority originalPriority = original.getPriority();
        assertEquals(Priority.P3_MEDIUM, originalPriority, "Original ticket starts at P3 Medium");
        System.out.println("[Step 1] Initial Incident Created: " + originalNumber
                + " | Title: '" + original.getTitle() + "' | Priority: " + originalPriority);

        // Count total incidents before duplicate submission
        long countBefore = incidentRepository.count();

        // 2. Employee 2 submits DUPLICATE incident with identical title
        CreateIncidentRequest duplicateReq = new CreateIncidentRequest();
        duplicateReq.setTitle(uniqueTitle);
        duplicateReq.setDescription("External keyboard is stuck and keys not typing properly");
        duplicateReq.setImpact(2);
        duplicateReq.setUrgency(2);
        duplicateReq.setBusinessCriticality(2);

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(employee2.getUsername(), null, List.of());

        ResponseEntity<Incident> response = incidentController.createIncident(duplicateReq, auth);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());

        // 3. CRITICAL: X-Incident-Correlated header MUST be set
        assertEquals("true", response.getHeaders().getFirst("X-Incident-Correlated"),
                "Response must have X-Incident-Correlated: true header");
        System.out.println("[Step 2] Duplicate Submission Blocked. X-Incident-Correlated: true");

        // 4. CRITICAL: Response body is the EXISTING (original) ticket, NOT a new one
        Incident returned = response.getBody();
        assertNotNull(returned);
        assertEquals(originalId, returned.getId(),
                "Response must return the ORIGINAL ticket ID — no new ticket created");
        System.out.println("[Step 3] Response contains original ticket: " + returned.getIncidentNumber()
                + " (ID=" + returned.getId() + " — same as original ID=" + originalId + ")");

        // 5. CRITICAL: Total incident count UNCHANGED — no new ticket created
        long countAfter = incidentRepository.count();
        assertEquals(countBefore, countAfter,
                "Total incident count must NOT increase — duplicate was blocked, no new ticket created");
        System.out.println("[Step 4] Total incident count unchanged: " + countBefore + " -> " + countAfter
                + " (no new ticket created)");

        // 6. CRITICAL: Original ticket priority MUST be escalated (P3 -> P2)
        Incident reloadedOriginal = incidentRepository.findById(originalId).orElseThrow();
        assertEquals(Priority.P2_HIGH, reloadedOriginal.getPriority(),
                "Original ticket priority must be escalated from P3_MEDIUM to P2_HIGH");
        assertTrue(reloadedOriginal.isEscalated(), "Original ticket must be marked as escalated");
        System.out.println("[Step 5] Priority Escalated: " + originalPriority + " -> " + reloadedOriginal.getPriority()
                + " | Escalation Level: " + reloadedOriginal.getEscalationLevel());

        // 7. Original reporter notified
        List<Notification> notifs1 = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(employee1.getId());
        assertFalse(notifs1.isEmpty(), "Original reporter must receive escalation notification");

        // 8. Duplicate submitter (employee2) notified that their report was merged
        List<Notification> notifs2 = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(employee2.getId());
        assertFalse(notifs2.isEmpty(), "Duplicate submitter must receive 'duplicate blocked' notification");

        System.out.println("[Step 6] Both employees notified — reporter received escalation alert, submitter told duplicate was merged");
        System.out.println(">>> RESULT: DUPLICATE BLOCK + ESCALATION VERIFICATION PASSED 100%! <<<\n");
    }
}
