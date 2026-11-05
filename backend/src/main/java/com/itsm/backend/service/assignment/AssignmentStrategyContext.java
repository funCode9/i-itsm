package com.itsm.backend.service.assignment;

import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.Technician;
import com.itsm.backend.domain.enums.AssignmentStrategyType;
import com.itsm.backend.repository.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Context class for the Strategy Design Pattern.
 * Reads the active strategy from SystemConfig at runtime and delegates assignment.
 *
 * OOP: Strategy Pattern — holds a reference to the active AssignmentStrategy.
 * OOP: Polymorphism — the same assignTechnician() call produces different results depending on strategy.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AssignmentStrategyContext {

    private final SkillBasedAssignmentStrategy skillBasedStrategy;
    private final LeastLoadedAssignmentStrategy leastLoadedStrategy;
    private final SystemConfigRepository systemConfigRepository;

    private static final String CONFIG_KEY = "ASSIGNMENT_STRATEGY";

    public Optional<Technician> assignTechnician(Incident incident) {
        AssignmentStrategy strategy = getActiveStrategy();
        log.info("Using assignment strategy: {}", strategy.getStrategyName());
        return strategy.assignTechnician(incident);
    }

    public AssignmentStrategy getActiveStrategy() {
        String strategyName = systemConfigRepository.findByConfigKey(CONFIG_KEY)
                .map(c -> c.getConfigValue())
                .orElse(AssignmentStrategyType.SKILL_BASED.name());

        return switch (strategyName) {
            case "LEAST_LOADED" -> leastLoadedStrategy;
            default -> skillBasedStrategy;
        };
    }

    public AssignmentStrategyType getActiveStrategyType() {
        String strategyName = systemConfigRepository.findByConfigKey(CONFIG_KEY)
                .map(c -> c.getConfigValue())
                .orElse(AssignmentStrategyType.SKILL_BASED.name());
        return AssignmentStrategyType.valueOf(strategyName);
    }
}
