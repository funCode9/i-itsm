package com.itsm.backend.domain.enums;

/**
 * Technician assignment strategies available in the system.
 * The active strategy is stored in SystemConfig and read at runtime.
 */
public enum AssignmentStrategyType {
    SKILL_BASED,
    LEAST_LOADED
}
