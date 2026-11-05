package com.itsm.backend.repository;

import com.itsm.backend.domain.entity.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    List<EmailLog> findByRelatedIncidentIdOrderBySentAtDesc(Long incidentId);
    List<EmailLog> findAllByOrderBySentAtDesc();
}
