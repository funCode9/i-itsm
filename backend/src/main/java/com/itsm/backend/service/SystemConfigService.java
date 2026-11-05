package com.itsm.backend.service;

import com.itsm.backend.domain.enums.AssignmentStrategyType;
import com.itsm.backend.domain.entity.SystemConfig;
import com.itsm.backend.repository.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SystemConfigService {

    private final SystemConfigRepository systemConfigRepository;
    private static final String STRATEGY_KEY = "ASSIGNMENT_STRATEGY";

    public void setAssignmentStrategy(AssignmentStrategyType strategy) {
        SystemConfig config = systemConfigRepository.findByConfigKey(STRATEGY_KEY)
                .orElse(SystemConfig.builder().configKey(STRATEGY_KEY)
                        .description("Active technician assignment strategy").build());
        config.setConfigValue(strategy.name());
        systemConfigRepository.save(config);
    }

    @Transactional(readOnly = true)
    public AssignmentStrategyType getAssignmentStrategy() {
        return systemConfigRepository.findByConfigKey(STRATEGY_KEY)
                .map(c -> AssignmentStrategyType.valueOf(c.getConfigValue()))
                .orElse(AssignmentStrategyType.SKILL_BASED);
    }
}
