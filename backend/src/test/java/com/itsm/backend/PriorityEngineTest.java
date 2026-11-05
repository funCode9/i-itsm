package com.itsm.backend;

import com.itsm.backend.domain.enums.Priority;
import com.itsm.backend.util.PriorityEngine;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Priority Engine Unit Tests")
class PriorityEngineTest {

    @Test
    @DisplayName("Test 1: Compute P1 Critical Priority (Score 18-27)")
    void testComputeCriticalPriority() {
        // 3 * 3 * 3 = 27 -> P1_CRITICAL
        assertEquals(27, PriorityEngine.computeScore(3, 3, 3));
        assertEquals(Priority.P1_CRITICAL, PriorityEngine.determinePriority(3, 3, 3));

        // 3 * 2 * 3 = 18 -> P1_CRITICAL
        assertEquals(18, PriorityEngine.computeScore(3, 2, 3));
        assertEquals(Priority.P1_CRITICAL, PriorityEngine.determinePriority(3, 2, 3));
    }

    @Test
    @DisplayName("Test 2: Compute P2 High Priority (Score 12-17)")
    void testComputeHighPriority() {
        // 2 * 3 * 2 = 12 -> P2_HIGH
        assertEquals(12, PriorityEngine.computeScore(2, 3, 2));
        assertEquals(Priority.P2_HIGH, PriorityEngine.determinePriority(2, 3, 2));

        // 3 * 2 * 2 = 12 -> P2_HIGH
        assertEquals(Priority.P2_HIGH, PriorityEngine.fromScore(16));
    }

    @Test
    @DisplayName("Test 3: Compute P3 Medium Priority (Score 6-11)")
    void testComputeMediumPriority() {
        // 2 * 2 * 2 = 8 -> P3_MEDIUM
        assertEquals(8, PriorityEngine.computeScore(2, 2, 2));
        assertEquals(Priority.P3_MEDIUM, PriorityEngine.determinePriority(2, 2, 2));

        // 1 * 3 * 2 = 6 -> P3_MEDIUM
        assertEquals(Priority.P3_MEDIUM, PriorityEngine.fromScore(6));
        assertEquals(Priority.P3_MEDIUM, PriorityEngine.fromScore(11));
    }

    @Test
    @DisplayName("Test 4: Compute P4 Low Priority (Score 1-5)")
    void testComputeLowPriority() {
        // 1 * 1 * 1 = 1 -> P4_LOW
        assertEquals(1, PriorityEngine.computeScore(1, 1, 1));
        assertEquals(Priority.P4_LOW, PriorityEngine.determinePriority(1, 1, 1));

        // 1 * 2 * 2 = 4 -> P4_LOW
        assertEquals(Priority.P4_LOW, PriorityEngine.fromScore(5));
    }
}
