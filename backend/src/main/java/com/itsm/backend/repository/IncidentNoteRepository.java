package com.itsm.backend.repository;

import com.itsm.backend.domain.entity.IncidentNote;
import com.itsm.backend.domain.enums.NoteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentNoteRepository extends JpaRepository<IncidentNote, Long> {
    List<IncidentNote> findByIncidentIdOrderByCreatedAtAsc(Long incidentId);
    List<IncidentNote> findByIncidentIdAndNoteType(Long incidentId, NoteType noteType);
    List<IncidentNote> findByIncidentIdAndVisibleToEmployeeTrue(Long incidentId);
}
