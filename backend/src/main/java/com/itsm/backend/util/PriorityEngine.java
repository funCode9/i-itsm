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
        if (score >= 18) return Priority.P1_CRITICAL;
        if (score >= 12) return Priority.P2_HIGH;
        if (score >= 6)  return Priority.P3_MEDIUM;
        return Priority.P4_LOW;
    }

    public static String getPriorityLabel(Priority priority) {
        return switch (priority) {
            case P1_CRITICAL -> "P1 - Critical";
            case P2_HIGH     -> "P2 - High";
            case P3_MEDIUM   -> "P3 - Medium";
            case P4_LOW      -> "P4 - Low";
        };
    }
}
