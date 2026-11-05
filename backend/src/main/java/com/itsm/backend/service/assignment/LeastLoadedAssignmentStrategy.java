package com.itsm.backend.service.assignment;

import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.Technician;
import com.itsm.backend.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Strategy B: Least-Loaded Assignment.
 *
 * Algorithm:
 * 1. Retrieve all available, enabled technicians.
 * 2. For each, count their active incidents (not in RESOLVED/VERIFIED/CLOSED state).
 * 3. Return the technician with the minimum active incident count.
 * 4. Tie-break: alphabetical order by name.
 *
 * OOP: Polymorphism — implements AssignmentStrategy.
 */
@Component("leastLoadedStrategy")
@RequiredArgsConstructor
@Slf4j
public class LeastLoadedAssignmentStrategy implements AssignmentStrategy {

    private final TechnicianRepository technicianRepository;

    @Override
    public Optional<Technician> assignTechnician(Incident incident) {
        List<Technician> available = technicianRepository.findAvailableAndEnabled();
        if (available.isEmpty()) {
            log.warn("No available technicians for least-loaded assignment");
            return Optional.empty();
        }

        return available.stream()
                .min(Comparator.comparingLong((Technician t) ->
                        technicianRepository.countActiveIncidents(t.getId()))
                .thenComparing(t -> t.getFullName()));
    }

    @Override
    public String getStrategyName() {
        return "LEAST_LOADED";
    }
}
