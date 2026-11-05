package com.itsm.backend.repository;

import com.itsm.backend.domain.entity.IncidentSla;
import com.itsm.backend.domain.enums.SlaStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentSlaRepository extends JpaRepository<IncidentSla, Long> {
    Optional<IncidentSla> findByIncidentId(Long incidentId);

    List<IncidentSla> findByStatus(SlaStatus status);

    @Query("SELECT s FROM IncidentSla s WHERE s.resolutionBreached = true OR s.responseBreached = true")
    List<IncidentSla> findAllBreached();

    long countByResolutionBreachedTrue();
    long countByResponseBreachedTrue();
}
