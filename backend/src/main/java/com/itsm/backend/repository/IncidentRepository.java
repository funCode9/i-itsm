package com.itsm.backend.repository;

import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.enums.IncidentStatus;
import com.itsm.backend.domain.enums.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long>, JpaSpecificationExecutor<Incident> {

    Optional<Incident> findByIncidentNumber(String incidentNumber);

    List<Incident> findByReporterId(Long reporterId);

    List<Incident> findByAssignedTechnicianId(Long technicianId);

    List<Incident> findByStatus(IncidentStatus status);

    List<Incident> findByPriority(Priority priority);

    List<Incident> findByCategoryId(Long categoryId);

    List<Incident> findByServiceId(Long serviceId);

    List<Incident> findByDuplicateOfId(Long duplicateOfId);

    List<Incident> findByAssignedTechnicianIdAndStatusNotIn(Long technicianId, List<IncidentStatus> statuses);

    @Query("SELECT i FROM Incident i WHERE i.status NOT IN ('RESOLVED','VERIFIED','CLOSED')")
    List<Incident> findAllOpen();

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.status NOT IN ('RESOLVED','VERIFIED','CLOSED')")
    long countOpen();

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.priority = 'P1_CRITICAL' AND i.status NOT IN ('RESOLVED','VERIFIED','CLOSED')")
    long countOpenCritical();

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.status IN ('RESOLVED','VERIFIED','CLOSED')")
    long countResolved();

    @Query("SELECT i FROM Incident i WHERE i.createdAt BETWEEN :from AND :to")
    List<Incident> findByCreatedAtBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.assignedTechnician.id = :techId AND i.status NOT IN ('RESOLVED','VERIFIED','CLOSED')")
    long countActiveByTechnician(@Param("techId") Long techId);
}
