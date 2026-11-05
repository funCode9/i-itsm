package com.itsm.backend.domain.enums;

/**
 * Incident priority levels derived from the Priority Engine.
 *
 * Priority Score = Impact × Urgency × BusinessCriticality  (each 1–3)
 * Score 18–27 → P1_CRITICAL
 * Score 12–17 → P2_HIGH
 * Score  6–11 → P3_MEDIUM
 * Score  1–5  → P4_LOW
 */
public enum Priority {
    P1_CRITICAL,
    P2_HIGH,
    P3_MEDIUM,
    P4_LOW
}
