package com.itsm.backend.service;

import com.itsm.backend.domain.entity.*;
import com.itsm.backend.domain.enums.NoteType;
import com.itsm.backend.exception.ResourceNotFoundException;
import com.itsm.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class IncidentNoteService {

    private final IncidentNoteRepository noteRepository;
    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;

    public IncidentNote addNote(Long incidentId, Long authorId, String content, NoteType noteType, boolean visibleToEmployee) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", incidentId));
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", authorId));

        IncidentNote note = IncidentNote.builder()
                .incident(incident)
                .author(author)
                .content(content)
                .noteType(noteType)
                .visibleToEmployee(visibleToEmployee)
                .build();
        return noteRepository.save(note);
    }

    @Transactional(readOnly = true)
    public List<IncidentNote> getNotesByIncident(Long incidentId) {
        return noteRepository.findByIncidentIdOrderByCreatedAtAsc(incidentId);
    }

    @Transactional(readOnly = true)
    public List<IncidentNote> getVisibleNotes(Long incidentId) {
        return noteRepository.findByIncidentIdAndVisibleToEmployeeTrue(incidentId);
    }
}
