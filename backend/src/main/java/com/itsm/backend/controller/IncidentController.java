package com.itsm.backend.controller;

import com.itsm.backend.domain.entity.EmailLog;
import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.IncidentNote;
import com.itsm.backend.domain.entity.Notification;
import com.itsm.backend.domain.entity.User;
import com.itsm.backend.domain.enums.IncidentStatus;
import com.itsm.backend.domain.enums.NoteType;
import com.itsm.backend.domain.enums.NotificationType;
import com.itsm.backend.dto.*;
import com.itsm.backend.repository.EmailLogRepository;
import com.itsm.backend.repository.IncidentRepository;
import com.itsm.backend.repository.NotificationRepository;
import com.itsm.backend.repository.UserRepository;
import com.itsm.backend.service.IncidentService;
import com.itsm.backend.service.IncidentNoteService;
import com.itsm.backend.service.intelligence.CategorySuggestionService;
import com.itsm.backend.service.intelligence.DuplicateDetectionService;
import com.itsm.backend.service.intelligence.SlaPredictionService;
import com.itsm.backend.service.intelligence.RootCauseAnalysisService;
import com.itsm.backend.service.intelligence.GeminiResolutionService;
import com.itsm.backend.service.escalation.IncidentEscalationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
@Slf4j
public class IncidentController {

    private final IncidentService incidentService;
    private final IncidentNoteService noteService;
    private final CategorySuggestionService categorySuggestionService;
    private final DuplicateDetectionService duplicateDetectionService;
    private final SlaPredictionService slaPredictionService;
    private final IncidentEscalationService incidentEscalationService;
    private final RootCauseAnalysisService rootCauseAnalysisService;
    private final GeminiResolutionService geminiResolutionService;
    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;
    private final NotificationRepository notificationRepository;
    private final EmailLogRepository emailLogRepository;

    @PostMapping
    public ResponseEntity<Incident> createIncident(@Valid @RequestBody CreateIncidentRequest req,
                                                    Authentication auth) {
        User user = getUser(auth);

        // 1. Create the incident
        Incident incident = incidentService.createIncident(req.getTitle(), req.getDescription(),
                user.getId(), req.getCategoryId(), req.getServiceId(),
                req.getImpact(), req.getUrgency(), req.getBusinessCriticality());

        // 2. Automated Classification & Strategy Assignment Pipeline (Workflow 1)
        try {
            Long effectiveCategoryId = req.getCategoryId();
            if (effectiveCategoryId == null) {
                effectiveCategoryId = categorySuggestionService.suggestCategory(req.getTitle(), req.getDescription())
                        .map(com.itsm.backend.domain.entity.Category::getId)
                        .orElse(null);
            }
            incident = incidentService.classifyAndAssign(incident.getId(), effectiveCategoryId,
                    req.getServiceId(), req.getImpact(), req.getUrgency(), req.getBusinessCriticality(), user);
        } catch (Exception ex) {
            log.warn("Classification/assignment fallback for {}: {}", incident.getIncidentNumber(), ex.getMessage());
        }

        // 3. Duplicate & Similar Incident Detection
        List<Incident> duplicates = duplicateDetectionService.findPotentialDuplicates(
                incident.getTitle(), incident.getDescription(),
                incident.getCategory() != null ? incident.getCategory().getId() : null,
                incident.getService() != null ? incident.getService().getId() : null,
                incident.getId() // exclude the newly created incident itself
        );

        if (!duplicates.isEmpty()) {
            // Upgrade the priority of BOTH the existing duplicate(s) and the new duplicate incident
            incident = incidentService.correlateDuplicatesAndUpgradePriority(incident, duplicates, user);

            return ResponseEntity.ok()
                    .header("X-Incident-Correlated", "true")
                    .header("X-Primary-Incident-Number", duplicates.get(0).getIncidentNumber())
                    .body(incident);
        }

        return ResponseEntity.ok(incident);
    }

    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents(Authentication auth) {
        User user = getUser(auth);
        List<Incident> incidents = switch (user.getRole()) {
            case EMPLOYEE -> incidentService.getIncidentsByReporter(user.getId());
            case TECHNICIAN -> incidentService.getIncidentsByTechnicianForUser(user.getId());
            case ADMINISTRATOR -> incidentService.getAllIncidents();
        };
        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncident(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getIncidentById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Incident> updateStatus(@PathVariable Long id,
                                                  @RequestBody UpdateIncidentStatusRequest req,
                                                  Authentication auth) {
        User user = getUser(auth);
        Incident updated = incidentService.transitionStatus(id, req.getNewStatus(),
                req.getResolutionDetails(), req.getClosureNotes(), user);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/classify")
    public ResponseEntity<Incident> classify(@PathVariable Long id,
                                              @RequestBody ClassifyIncidentRequest req,
                                              Authentication auth) {
        User user = getUser(auth);
        Incident classified = incidentService.classifyAndAssign(id, req.getCategoryId(),
                req.getServiceId(), req.getImpact(), req.getUrgency(),
                req.getBusinessCriticality(), user);
        return ResponseEntity.ok(classified);
    }

    @PostMapping("/{id}/assign/{technicianId}")
    public ResponseEntity<Incident> manualAssign(@PathVariable Long id,
                                                   @PathVariable Long technicianId,
                                                   Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(incidentService.manualAssign(id, technicianId, user));
    }

    @GetMapping("/{id}/notes")
    public ResponseEntity<List<IncidentNote>> getNotes(@PathVariable Long id, Authentication auth) {
        User user = getUser(auth);
        boolean isEmployee = user.getRole() == com.itsm.backend.domain.enums.Role.EMPLOYEE;
        List<IncidentNote> notes = isEmployee
                ? noteService.getVisibleNotes(id)
                : noteService.getNotesByIncident(id);
        return ResponseEntity.ok(notes);
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<IncidentNote> addNote(@PathVariable Long id,
                                                 @Valid @RequestBody AddNoteRequest req,
                                                 Authentication auth) {
        User user = getUser(auth);
        boolean visible = user.getRole() == com.itsm.backend.domain.enums.Role.EMPLOYEE || req.isVisibleToEmployee();
        IncidentNote note = noteService.addNote(id, user.getId(), req.getContent(), req.getNoteType(), visible);
        return ResponseEntity.ok(note);
    }

    @GetMapping("/suggest-category")
    public ResponseEntity<?> suggestCategory(@RequestParam String title,
                                              @RequestParam(required = false) String description) {
        return categorySuggestionService.suggestCategory(title, description)
                .map(cat -> ResponseEntity.ok((Object) Map.of("categoryId", cat.getId(), "categoryName", cat.getName())))
                .orElse(ResponseEntity.ok(Map.of("message", "No suggestion available")));
    }

    @GetMapping("/check-duplicates")
    public ResponseEntity<List<Incident>> checkDuplicates(@RequestParam String title,
                                                            @RequestParam(required = false) String description,
                                                            @RequestParam(required = false) Long categoryId,
                                                            @RequestParam(required = false) Long serviceId,
                                                            @RequestParam(required = false) Long excludeId) {
        return ResponseEntity.ok(duplicateDetectionService.findPotentialDuplicates(
                title, description, categoryId, serviceId, excludeId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Incident>> getMyIncidents(Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(incidentService.getIncidentsByReporter(user.getId()));
    }

    @GetMapping("/{id}/sla-prediction")
    public ResponseEntity<SlaPredictionDTO> getSlaPrediction(@PathVariable Long id) {
        return ResponseEntity.ok(slaPredictionService.predictForIncident(id));
    }

    @PostMapping("/{id}/escalate")
    public ResponseEntity<Incident> escalateIncident(@PathVariable Long id,
                                                      @RequestBody(required = false) Map<String, String> body,
                                                      Authentication auth) {
        User user = getUser(auth);
        String reason = (body != null && body.containsKey("reason"))
                ? body.get("reason")
                : "Manual escalation initiated by " + user.getFullName();
        return ResponseEntity.ok(incidentEscalationService.escalateIncident(id, reason, user));
    }

    @GetMapping("/{id}/root-cause")
    public ResponseEntity<RootCauseAnalysisDTO> getRootCauseAnalysis(@PathVariable Long id) {
        return ResponseEntity.ok(rootCauseAnalysisService.analyzeIncident(id));
    }

    @GetMapping("/{id}/ai-resolution")
    public ResponseEntity<GeminiResolutionDTO> getAiResolution(@PathVariable Long id) {
        return ResponseEntity.ok(geminiResolutionService.generateRecommendation(id));
    }

    @PostMapping("/{id}/ai-resolution/apply-note")
    public ResponseEntity<IncidentNote> applyAiResolutionAsNote(@PathVariable Long id,
                                                                 Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(geminiResolutionService.applyRecommendationAsNote(id, user.getId()));
    }

    private User getUser(Authentication auth) {
        return userRepository.findByUsername(auth.getName()).orElseThrow();
    }
}
