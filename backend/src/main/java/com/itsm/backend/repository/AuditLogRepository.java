package com.itsm.backend.repository;

import com.itsm.backend.domain.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByIncidentIdOrderByTimestampDesc(Long incidentId);
    List<AuditLog> findByActorIdOrderByTimestampDesc(Long actorId);
    List<AuditLog> findAllByOrderByTimestampDesc();
}
