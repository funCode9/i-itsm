package com.itsm.backend.service;

import com.itsm.backend.domain.entity.SlaPolicy;
import com.itsm.backend.domain.enums.Priority;
import com.itsm.backend.exception.ResourceNotFoundException;
import com.itsm.backend.repository.SlaPolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SlaPolicyService {

    private final SlaPolicyRepository slaPolicyRepository;

    @Transactional(readOnly = true)
    public List<SlaPolicy> getAllPolicies() { return slaPolicyRepository.findAll(); }

    @Transactional(readOnly = true)
    public SlaPolicy getByPriority(Priority priority) {
        return slaPolicyRepository.findByPriority(priority)
                .orElseThrow(() -> new ResourceNotFoundException("SLA Policy not found for priority: " + priority));
    }

    public SlaPolicy updatePolicy(Long id, int responseMinutes, int resolutionMinutes) {
        SlaPolicy policy = slaPolicyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SLA Policy", id));
        policy.setResponseMinutes(responseMinutes);
        policy.setResolutionMinutes(resolutionMinutes);
        return slaPolicyRepository.save(policy);
    }
}
