package com.itsm.backend.service;

import com.itsm.backend.domain.entity.*;
import com.itsm.backend.exception.DuplicateResourceException;
import com.itsm.backend.exception.ResourceNotFoundException;
import com.itsm.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;

    public Feedback submitFeedback(Long incidentId, Long userId, int rating, String comment) {
        if (feedbackRepository.existsByIncidentId(incidentId)) {
            throw new DuplicateResourceException("Feedback already submitted for this incident.");
        }
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", incidentId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Feedback feedback = Feedback.builder()
                .incident(incident)
                .submittedBy(user)
                .rating(Math.max(1, Math.min(5, rating)))
                .comment(comment)
                .build();
        return feedbackRepository.save(feedback);
    }

    @Transactional(readOnly = true)
    public Feedback getFeedbackByIncident(Long incidentId) {
        return feedbackRepository.findByIncidentId(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found for incident: " + incidentId));
    }
}
