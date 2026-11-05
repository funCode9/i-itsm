package com.itsm.backend.repository;

import com.itsm.backend.domain.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Long> {
    Optional<Technician> findByUserId(Long userId);
    List<Technician> findByAvailableTrue();

    @Query("SELECT t FROM Technician t WHERE t.available = true AND t.user.enabled = true")
    List<Technician> findAvailableAndEnabled();

    @Query("SELECT t FROM Technician t JOIN t.skills s WHERE s.skillName = :skill AND t.available = true AND t.user.enabled = true")
    List<Technician> findBySkillAndAvailable(@Param("skill") String skill);

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.assignedTechnician.id = :techId AND i.status NOT IN ('RESOLVED', 'VERIFIED', 'CLOSED')")
    long countActiveIncidents(@Param("techId") Long techId);
}
