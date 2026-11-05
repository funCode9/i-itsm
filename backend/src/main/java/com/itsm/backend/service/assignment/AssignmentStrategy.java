package com.itsm.backend.service.assignment;

import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.Technician;

import java.util.Optional;

/**
 * Strategy interface for technician assignment.
 *
 * OOP: Strategy Design Pattern
 * - This interface defines the algorithm contract.
 * - Concrete implementations: SkillBasedAssignmentStrategy, LeastLoadedAssignmentStrategy.
 * - The context (AssignmentStrategyContext) selects the appropriate strategy at runtime.
 *
 * OOP: Abstraction — callers work with this interface, not concrete implementations.
 * OOP: Polymorphism — different strategies can be substituted at runtime.
 */
public interface AssignmentStrategy {

    /**
     * Select the most appropriate available technician for the given incident.
     *
     * @param incident the incident needing assignment
     * @return an Optional containing the selected technician, or empty if none available
     */
    Optional<Technician> assignTechnician(Incident incident);

    /**
     * Returns a human-readable name for this strategy.
     */
    String getStrategyName();
}
