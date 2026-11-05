package com.itsm.backend.repository;

import com.itsm.backend.domain.entity.AssignmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentHistoryRepository extends JpaRepository<AssignmentHistory, Long> {
    List<AssignmentHistory> findByIncidentIdOrderByAssignedAtDesc(Long incidentId);
    List<AssignmentHistory> findByTechnicianIdOrderByAssignedAtDesc(Long technicianId);
}
