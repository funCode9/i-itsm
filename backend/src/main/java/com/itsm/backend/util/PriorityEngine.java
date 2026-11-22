package com.itsm.backend.util;

import com.itsm.backend.domain.enums.Priority;

/**
 * Rule-based Priority Engine.
 *
 * ALGORITHM:
 *   priorityScore = impact × urgency × businessCriticality
 *   Each factor ranges from 1 (Low) to 3 (High).
 *   Score range: 1–27.
 *
 *   18–27 → P1_CRITICAL  (all factors high)
 *   12–17 → P2_HIGH
 *    6–11 → P3_MEDIUM
 *    1–5  → P4_LOW
 *
 * OOP: Abstraction — the algorithm is hidden behind a simple static method.
 */
public final class PriorityEngine {

    private PriorityEngine() { }

    public static int computeScore(int impact, int urgency, int businessCriticality) {
        return impact * urgency * businessCriticality;
    }

    public static Priority determinePriority(int impact, int urgency, int businessCriticality) {
        int score = computeScore(impact, urgency, businessCriticality);
        return fromScore(score);
    }

    public static Priority fromScore(int score) {
        if (score >= 30) return Priority.P0_EMERGENCY;
        if (score >= 18) return Priority.P1_CRITICAL;
        if (score >= 12) return Priority.P2_HIGH;
        if (score >= 6)  return Priority.P3_MEDIUM;
        return Priority.P4_LOW;
    }

    public static Priority bumpPriority(Priority current) {
        if (current == null) return Priority.P2_HIGH;
        return switch (current) {
            case P4_LOW -> Priority.P3_MEDIUM;
            case P3_MEDIUM -> Priority.P2_HIGH;
            case P2_HIGH -> Priority.P1_CRITICAL;
            case P1_CRITICAL, P0_EMERGENCY -> Priority.P0_EMERGENCY;
        };
    }

    public static int scoreForPriority(Priority priority) {
        if (priority == null) return 8;
        return switch (priority) {
            case P0_EMERGENCY -> 36;
            case P1_CRITICAL -> 27;
            case P2_HIGH -> 16;
            case P3_MEDIUM -> 8;
            case P4_LOW -> 2;
        };
    }

    public static String getPriorityLabel(Priority priority) {
        return switch (priority) {
            case P0_EMERGENCY -> "P0 - Emergency";
            case P1_CRITICAL -> "P1 - Critical";
            case P2_HIGH     -> "P2 - High";
            case P3_MEDIUM   -> "P3 - Medium";
            case P4_LOW      -> "P4 - Low";
        };
    }
}
