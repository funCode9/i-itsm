package com.itsm.backend.service.intelligence;

import com.itsm.backend.domain.entity.Category;
import com.itsm.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Intelligent Feature A: Automatic Category Suggestion.
 *
 * Algorithm:
 * 1. Tokenize the incident description and title into normalized words.
 * 2. For each active category, count how many of its comma-separated keywords
 *    appear in the incident text.
 * 3. Return the category with the highest keyword match score.
 * 4. If no keywords match (score = 0), return Optional.empty().
 *
 * OOP: Encapsulation — the matching algorithm is fully self-contained.
 * OOP: Abstraction — consumers call suggestCategory() without knowing the algorithm.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CategorySuggestionService {

    private final CategoryRepository categoryRepository;

    /**
     * Suggest a category based on incident title + description keywords.
     * @return Optional containing the suggested Category, or empty if no confident match.
     */
    public Optional<Category> suggestCategory(String title, String description) {
        List<Category> categories = categoryRepository.findByActiveTrue();
        if (categories.isEmpty()) return Optional.empty();

        String combinedText = ((title != null ? title : "") + " " + (description != null ? description : "")).toLowerCase();
        Set<String> textTokens = tokenize(combinedText);

        Category bestCategory = null;
        int bestScore = 0;

        for (Category category : categories) {
            if (category.getKeywords() == null || category.getKeywords().isBlank()) continue;
            int score = scoreCategory(category, textTokens);
            if (score > bestScore) {
                bestScore = score;
                bestCategory = category;
            }
        }

        if (bestScore > 0) {
            log.info("Category suggestion: '{}' with score {}", bestCategory.getName(), bestScore);
            return Optional.of(bestCategory);
        }
        return Optional.empty();
    }

    private int scoreCategory(Category category, Set<String> textTokens) {
        String[] keywords = category.getKeywords().toLowerCase().split(",");
        int score = 0;
        for (String keyword : keywords) {
            keyword = keyword.trim();
            if (!keyword.isEmpty() && textTokens.contains(keyword)) {
                score++;
            }
            // Also check if keyword is a substring of any token
            for (String token : textTokens) {
                if (token.contains(keyword) || keyword.contains(token)) {
                    score++;
                    break;
                }
            }
        }
        return score;
    }

    private Set<String> tokenize(String text) {
        Set<String> tokens = new HashSet<>();
        String[] words = text.split("[\\s,;.!?()\\[\\]{}\"']+");
        for (String word : words) {
            if (word.length() >= 3) {
                tokens.add(word.toLowerCase());
            }
        }
        return tokens;
    }
}
