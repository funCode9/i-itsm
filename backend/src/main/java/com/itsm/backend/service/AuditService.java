package com.itsm.backend.service;

import com.itsm.backend.domain.entity.AuditLog;
import com.itsm.backend.domain.entity.EmailLog;
import com.itsm.backend.repository.AuditLogRepository;
import com.itsm.backend.repository.EmailLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final EmailLogRepository emailLogRepository;

    @Transactional(readOnly = true)
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsForIncident(Long incidentId) {
        return auditLogRepository.findByIncidentIdOrderByTimestampDesc(incidentId);
    }

    @Transactional(readOnly = true)
    public List<EmailLog> getAllEmailLogs() {
        return emailLogRepository.findAllByOrderBySentAtDesc();
    }
}
