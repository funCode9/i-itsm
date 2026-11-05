package com.itsm.backend.service.intelligence;

import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Intelligent Feature B: Duplicate Incident Detection.
 *
 * Algorithm:
 * 1. Retrieve all open incidents (status not in RESOLVED/VERIFIED/CLOSED).
 * 2. For each open incident, compute a similarity score against the new incident:
 *    - Title word overlap (Jaccard-like coefficient × 40 points)
 *    - Description keyword overlap (× 30 points)
 *    - Same category (+15 points)
 *    - Same service (+15 points)
 * 3. Any incident scoring ≥ 50 is considered a potential duplicate.
 * 4. Return the top-5 matches by score for human review.
 *
 * NOTE: This does NOT automatically merge incidents. It only flags and suggests.
 *
 * OOP: Encapsulation — the similarity algorithm is entirely within this service.
 * OOP: Abstraction — callers receive a simple list of potential duplicates.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DuplicateDetectionService {

    private final IncidentRepository incidentRepository;

    private static final int SIMILARITY_THRESHOLD = 40;
    private static final int MAX_RESULTS = 5;

    /**
     * Find potential duplicate incidents for a new incident being created.
     * @param title          new incident title
     * @param description    new incident description
     * @param categoryId     new incident category id (nullable)
     * @param serviceId      new incident service id (nullable)
     * @param excludeId      exclude this incident id from results (use when editing)
     * @return list of potential duplicate incidents, ordered by similarity score
     */
    public List<Incident> findPotentialDuplicates(String title, String description,
                                                    Long categoryId, Long serviceId,
                                                    Long excludeId) {
        List<Incident> openIncidents = incidentRepository.findAllOpen();

        Set<String> newTitleTokens = tokenize(title);
        Set<String> newDescTokens = tokenize(description);

        Map<Incident, Integer> scored = new LinkedHashMap<>();

        for (Incident existing : openIncidents) {
            if (excludeId != null && existing.getId().equals(excludeId)) continue;

            int score = computeSimilarity(existing, newTitleTokens, newDescTokens, categoryId, serviceId);
            if (score >= SIMILARITY_THRESHOLD) {
                scored.put(existing, score);
            }
        }

        return scored.entrySet().stream()
                .sorted(Map.Entry.<Incident, Integer>comparingByValue().reversed())
                .limit(MAX_RESULTS)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private int computeSimilarity(Incident existing,
                                   Set<String> newTitleTokens,
                                   Set<String> newDescTokens,
                                   Long categoryId, Long serviceId) {
        int score = 0;

        // Title overlap
        Set<String> existingTitleTokens = tokenize(existing.getTitle());
        double titleJaccard = jaccardSimilarity(newTitleTokens, existingTitleTokens);
        score += (int) (titleJaccard * 40);

        // Description overlap
        Set<String> existingDescTokens = tokenize(existing.getDescription());
        double descJaccard = jaccardSimilarity(newDescTokens, existingDescTokens);
        score += (int) (descJaccard * 30);

        // Category match
        if (categoryId != null && existing.getCategory() != null
                && existing.getCategory().getId().equals(categoryId)) {
            score += 15;
        }

        // Service match
        if (serviceId != null && existing.getService() != null
                && existing.getService().getId().equals(serviceId)) {
            score += 15;
        }

        return score;
    }

    private double jaccardSimilarity(Set<String> a, Set<String> b) {
        if (a.isEmpty() || b.isEmpty()) return 0.0;
        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        Set<String> union = new HashSet<>(a);
        union.addAll(b);
        return (double) intersection.size() / union.size();
    }

    private Set<String> tokenize(String text) {
        if (text == null || text.isBlank()) return Collections.emptySet();
        Set<String> tokens = new HashSet<>();
        String[] words = text.toLowerCase().split("[\\s,;.!?()\\[\\]{}\"']+");
        for (String word : words) {
            if (word.length() >= 3) {
                // Simple stop word filter
                if (!isStopWord(word)) tokens.add(word);
            }
        }
        return tokens;
    }

    private boolean isStopWord(String word) {
        Set<String> stopWords = Set.of("the", "and", "for", "are", "was", "has", "have",
                "that", "this", "with", "not", "can", "our", "your", "their");
        return stopWords.contains(word);
    }
}
