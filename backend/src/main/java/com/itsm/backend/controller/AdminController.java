package com.itsm.backend.controller;

import com.itsm.backend.domain.entity.User;
import com.itsm.backend.domain.enums.AssignmentStrategyType;
import com.itsm.backend.domain.enums.Role;
import com.itsm.backend.dto.CreateTechnicianRequest;
import com.itsm.backend.repository.UserRepository;
import com.itsm.backend.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class AdminController {

    private final UserService userService;
    private final TechnicianService technicianService;
    private final SystemConfigService systemConfigService;
    private final ReportService reportService;
    private final AuditService auditService;
    private final SlaMonitoringService slaMonitoringService;
    private final UserRepository userRepository;

    // ===== USER MANAGEMENT =====

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Role role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    @PatchMapping("/users/{id}/toggle")
    public ResponseEntity<?> toggleUser(@PathVariable Long id, @RequestParam boolean enabled) {
        User user = userService.getUserById(id);
        userService.updateUser(id, user.getFullName(), user.getDepartment(), user.getPhone(), enabled);
        return ResponseEntity.ok(Map.of("message", "User " + (enabled ? "enabled" : "disabled")));
    }

    // ===== TECHNICIAN MANAGEMENT =====

    @PostMapping("/technicians")
    public ResponseEntity<?> createTechnician(@RequestBody CreateTechnicianRequest req) {
        return ResponseEntity.ok(technicianService.createTechnicianProfile(
                req.getUserId(), req.getSpecialization(), req.getSkills()));
    }

    // ===== ASSIGNMENT STRATEGY =====

    @GetMapping("/strategy")
    public ResponseEntity<?> getStrategy() {
        return ResponseEntity.ok(Map.of("strategy", systemConfigService.getAssignmentStrategy()));
    }

    @PutMapping("/strategy")
    public ResponseEntity<?> setStrategy(@RequestParam AssignmentStrategyType strategy) {
        systemConfigService.setAssignmentStrategy(strategy);
        return ResponseEntity.ok(Map.of("message", "Strategy updated to " + strategy));
    }

    // ===== REPORTS =====

    @GetMapping("/reports/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(reportService.getAdminDashboardStats());
    }

    @GetMapping("/reports/workload")
    public ResponseEntity<List<Map<String, Object>>> getWorkload() {
        return ResponseEntity.ok(reportService.getTechnicianWorkload());
    }

    @GetMapping("/reports/by-status")
    public ResponseEntity<Map<String, Long>> getByStatus() {
        return ResponseEntity.ok(reportService.getIncidentsByStatus());
    }

    @GetMapping("/reports/by-priority")
    public ResponseEntity<Map<String, Long>> getByPriority() {
        return ResponseEntity.ok(reportService.getIncidentsByPriority());
    }

    @GetMapping("/reports/by-category")
    public ResponseEntity<Map<String, Long>> getByCategory() {
        return ResponseEntity.ok(reportService.getIncidentsByCategory());
    }

    @GetMapping("/reports/by-service")
    public ResponseEntity<Map<String, Long>> getByService() {
        return ResponseEntity.ok(reportService.getIncidentsByService());
    }

    // ===== AUDIT =====

    @GetMapping("/audit")
    public ResponseEntity<?> getAuditLogs() {
        return ResponseEntity.ok(auditService.getAllAuditLogs());
    }

    @GetMapping("/audit/emails")
    public ResponseEntity<?> getEmailLogs() {
        return ResponseEntity.ok(auditService.getAllEmailLogs());
    }

    // ===== SLA MONITORING =====

    @GetMapping("/sla/all")
    public ResponseEntity<?> getAllSla() {
        return ResponseEntity.ok(slaMonitoringService.getAllSlaRecords());
    }

    @GetMapping("/sla/breached")
    public ResponseEntity<?> getBreachedSla() {
        return ResponseEntity.ok(slaMonitoringService.getBreachedSlas());
    }
}
