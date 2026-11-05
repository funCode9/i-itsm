package com.itsm.backend.service.assignment;

import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.Technician;
import com.itsm.backend.domain.entity.TechnicianSkill;
import com.itsm.backend.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Strategy A: Skill-Based Assignment.
 *
 * Algorithm:
 * 1. Build a keyword set from the incident's category name.
 * 2. Score each available technician by how many of their skills match the keyword set.
 * 3. Return the technician with the highest skill-match score.
 * 4. If no match is found, fall back to the least-loaded technician.
 *
 * OOP: Polymorphism — implements AssignmentStrategy.
 * OOP: Encapsulation — matching algorithm is hidden inside this class.
 */
@Component("skillBasedStrategy")
@RequiredArgsConstructor
@Slf4j
public class SkillBasedAssignmentStrategy implements AssignmentStrategy {

    private final TechnicianRepository technicianRepository;

    @Override
    public Optional<Technician> assignTechnician(Incident incident) {
        List<Technician> available = technicianRepository.findAvailableAndEnabled();
        if (available.isEmpty()) {
            log.warn("No available technicians for skill-based assignment");
            return Optional.empty();
        }

        Set<String> incidentKeywords = buildKeywords(incident);
        log.info("Skill-based assignment for incident {} with keywords: {}", incident.getIncidentNumber(), incidentKeywords);

        Technician bestMatch = null;
        int bestScore = -1;

        for (Technician tech : available) {
            int score = computeSkillScore(tech, incidentKeywords);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = tech;
            }
        }

        if (bestMatch != null) {
            log.info("Skill-based assigned technician {} (score: {})", bestMatch.getFullName(), bestScore);
        }
        return Optional.ofNullable(bestMatch);
    }

    private Set<String> buildKeywords(Incident incident) {
        Set<String> keywords = new HashSet<>();
        if (incident.getCategory() != null) {
            keywords.add(incident.getCategory().getName().toLowerCase());
        }
        if (incident.getService() != null) {
            keywords.add(incident.getService().getName().toLowerCase());
        }
        // Add words from title
        if (incident.getTitle() != null) {
            Arrays.stream(incident.getTitle().toLowerCase().split("\\s+"))
                  .filter(w -> w.length() > 3)
                  .forEach(keywords::add);
        }
        return keywords;
    }

    private int computeSkillScore(Technician tech, Set<String> keywords) {
        int score = 0;
        for (TechnicianSkill skill : tech.getSkills()) {
            String skillLower = skill.getSkillName().toLowerCase();
            for (String keyword : keywords) {
                if (skillLower.contains(keyword) || keyword.contains(skillLower)) {
                    score++;
                }
            }
        }
        return score;
    }

    @Override
    public String getStrategyName() {
        return "SKILL_BASED";
    }
}
