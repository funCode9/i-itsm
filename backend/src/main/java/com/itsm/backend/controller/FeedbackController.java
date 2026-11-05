package com.itsm.backend.controller;

import com.itsm.backend.domain.entity.Feedback;
import com.itsm.backend.domain.entity.User;
import com.itsm.backend.dto.FeedbackRequest;
import com.itsm.backend.repository.UserRepository;
import com.itsm.backend.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final UserRepository userRepository;

    @PostMapping("/incident/{incidentId}")
    public ResponseEntity<Feedback> submitFeedback(@PathVariable Long incidentId,
                                                    @Valid @RequestBody FeedbackRequest req,
                                                    Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        return ResponseEntity.ok(feedbackService.submitFeedback(incidentId, user.getId(), req.getRating(), req.getComment()));
    }

    @GetMapping("/incident/{incidentId}")
    public ResponseEntity<Feedback> getFeedback(@PathVariable Long incidentId) {
        return ResponseEntity.ok(feedbackService.getFeedbackByIncident(incidentId));
    }
}
