package com.itsm.backend.service.intelligence;

import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Intelligent Feature B: Duplicate Incident & Related Ticket Detection.
 *
 * Word Similarity Algorithm:
 * 1. Retrieves active open incidents.
 * 2. Compares tokenized words using:
 *    - Exact string equality (score 1.0)
 *    - Stemming / prefix root matching (e.g. print/printer/printing, connect/connection)
 *    - Levenshtein edit distance for typos and spelling variants (≥ 70% threshold)
 *    - Domain synonym clusters (e.g. wifi <-> wireless, down <-> outage <-> broken)
 * 3. Computes soft coverage and soft Jaccard coefficient over title & description.
 * 4. Weights title relevance (60%), description (25%), category (10%), and service (15%).
 * 5. Returns related / duplicate tickets ordered by descending relevance.
 *
 * OOP: Encapsulation — the similarity heuristics are encapsulated within this service.
 * OOP: Abstraction — callers receive a sorted list of matching Incident entities.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DuplicateDetectionService {

    private final IncidentRepository incidentRepository;

    private static final int SIMILARITY_THRESHOLD = 25;
    private static final int MAX_RESULTS = 5;

    // Common ITSM domain synonyms
    private static final Map<String, Set<String>> SYNONYMS = new HashMap<>();

    static {
        addSynonyms("down", "outage", "offline", "unreachable", "crash", "broken", "unavailable", "failed", "failure", "dead");
        addSynonyms("wifi", "wi-fi", "wireless", "wlan", "internet", "network", "connectivity");
        addSynonyms("slow", "slowness", "lag", "latency", "delay", "degraded", "hanging", "stuck");
        addSynonyms("login", "signin", "auth", "authentication", "access", "credentials", "password");
        addSynonyms("error", "exception", "bug", "issue", "failure", "failed", "fault", "problem");
        addSynonyms("printer", "printing", "print", "spooler", "paper", "jam");
        addSynonyms("vpn", "tunnel", "gateway", "remote", "anyconnect", "cisco");
        addSynonyms("database", "db", "postgres", "sql", "query", "connection");
        addSynonyms("keyboard", "key", "keys", "typing", "keystroke");
        addSynonyms("mouse", "trackpad", "cursor", "pointer");
        addSynonyms("monitor", "screen", "display", "hdmi");
        addSynonyms("laptop", "pc", "computer", "desktop", "workstation");
    }

    private static void addSynonyms(String... words) {
        Set<String> set = new HashSet<>(Arrays.asList(words));
        for (String w : words) {
            SYNONYMS.put(w.toLowerCase(), set);
        }
    }

    /**
     * Find potential duplicate or related incidents for an incident being reported.
     */
    public List<Incident> findPotentialDuplicates(String title, String description,
                                                    Long categoryId, Long serviceId,
                                                    Long excludeId) {
        if (title == null || title.trim().isEmpty()) {
            return Collections.emptyList();
        }

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
        double score = 0.0;

        // Title word similarity (Primary signal - up to 60 points)
        Set<String> existingTitleTokens = tokenize(existing.getTitle());
        double titleSim = computeSoftSimilarity(newTitleTokens, existingTitleTokens);
        score += titleSim * 60.0;

        // Description word similarity (Secondary signal - up to 25 points)
        if (!newDescTokens.isEmpty()) {
            Set<String> existingDescTokens = tokenize(existing.getDescription());
            double descSim = computeSoftSimilarity(newDescTokens, existingDescTokens);
            score += descSim * 25.0;
        }

        // Category match (+10 points)
        if (categoryId != null && existing.getCategory() != null
                && existing.getCategory().getId().equals(categoryId)) {
            score += 10.0;
        }

        // Service match (+15 points)
        if (serviceId != null && existing.getService() != null
                && existing.getService().getId().equals(serviceId)) {
            score += 15.0;
        }

        return (int) Math.round(score);
    }

    /**
     * Computes word similarity between two token sets using soft token matching,
     * token coverage, and soft Jaccard index.
     */
    private double computeSoftSimilarity(Set<String> queryTokens, Set<String> targetTokens) {
        if (queryTokens.isEmpty() || targetTokens.isEmpty()) return 0.0;

        double softMatches = 0.0;
        for (String q : queryTokens) {
            double bestMatch = 0.0;
            for (String t : targetTokens) {
                double sim = calculateWordSimilarity(q, t);
                if (sim > bestMatch) {
                    bestMatch = sim;
                }
            }
            if (bestMatch >= 0.65) {
                softMatches += bestMatch;
            }
        }

        double coverage = softMatches / queryTokens.size();
        double jaccard = softMatches / (queryTokens.size() + targetTokens.size() - softMatches);

        // Blended score favoring query coverage while typing
        return (0.6 * coverage) + (0.4 * jaccard);
    }

    /**
     * Calculates fuzzy word similarity between two words.
     */
    private double calculateWordSimilarity(String w1, String w2) {
        if (w1.equals(w2)) return 1.0;

        // 1. Shared prefix / stemming check (e.g., printer & printing -> 0.8)
        int minLen = Math.min(w1.length(), w2.length());
        int maxLen = Math.max(w1.length(), w2.length());
        if (minLen >= 4 && (w1.startsWith(w2) || w2.startsWith(w1))) {
            return (double) minLen / maxLen;
        }

        // 2. Synonym match
        Set<String> syns = SYNONYMS.get(w1);
        if (syns != null && syns.contains(w2)) {
            return 0.85;
        }

        // 3. Levenshtein edit distance for typos
        if (Math.abs(w1.length() - w2.length()) <= 2 && maxLen >= 4) {
            int dist = levenshteinDistance(w1, w2);
            double levSim = 1.0 - ((double) dist / maxLen);
            if (levSim >= 0.70) {
                return levSim;
            }
        }

        return 0.0;
    }

    private int levenshteinDistance(String s1, String s2) {
        int[] costs = new int[s2.length() + 1];
        for (int j = 0; j <= s2.length(); j++) {
            costs[j] = j;
        }
        for (int i = 1; i <= s1.length(); i++) {
            costs[0] = i;
            int nw = i - 1;
            for (int j = 1; j <= s2.length(); j++) {
                int cj = Math.min(1 + Math.min(costs[j], costs[j - 1]),
                        s1.charAt(i - 1) == s2.charAt(j - 1) ? nw : nw + 1);
                nw = costs[j];
                costs[j] = cj;
            }
        }
        return costs[s2.length()];
    }

    private Set<String> tokenize(String text) {
        if (text == null || text.isBlank()) return Collections.emptySet();
        Set<String> tokens = new HashSet<>();
        String[] words = text.toLowerCase().split("[\\s,;.!?()\\[\\]{}\"':/\\\\-]+");
        for (String word : words) {
            word = word.trim();
            if (word.length() >= 3 && !isStopWord(word)) {
                tokens.add(word);
            }
        }
        return tokens;
    }

    private boolean isStopWord(String word) {
        Set<String> stopWords = Set.of(
                "the", "and", "for", "are", "was", "has", "have", "had",
                "that", "this", "with", "not", "can", "our", "your", "their",
                "been", "from", "when", "into", "some", "them", "then", "also"
        );
        return stopWords.contains(word);
    }
}
