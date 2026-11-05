package com.itsm.backend.controller;

import com.itsm.backend.domain.entity.User;
import com.itsm.backend.repository.UserRepository;
import com.itsm.backend.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;
    private final UserRepository userRepository;

    @GetMapping("/incident/{incidentId}")
    public ResponseEntity<?> getIncidentAudit(@PathVariable Long incidentId) {
        return ResponseEntity.ok(auditService.getAuditLogsForIncident(incidentId));
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(auditService.getAllAuditLogs());
    }
}
