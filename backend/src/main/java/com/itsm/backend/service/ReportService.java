package com.itsm.backend.service;

import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.repository.IncidentRepository;
import com.itsm.backend.repository.IncidentSlaRepository;
import com.itsm.backend.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Aggregates statistics for the admin dashboard and reports.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final IncidentRepository incidentRepository;
    private final IncidentSlaRepository incidentSlaRepository;
    private final TechnicianRepository technicianRepository;

    public Map<String, Object> getAdminDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalIncidents", incidentRepository.count());
        stats.put("openIncidents", incidentRepository.countOpen());
        stats.put("criticalIncidents", incidentRepository.countOpenCritical());
        stats.put("resolvedIncidents", incidentRepository.countResolved());
        stats.put("slaBreaches", incidentSlaRepository.countByResolutionBreachedTrue());
        stats.put("responseBreaches", incidentSlaRepository.countByResponseBreachedTrue());
        return stats;
    }

    public List<Map<String, Object>> getTechnicianWorkload() {
        return technicianRepository.findAll().stream().map(tech -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("technicianId", tech.getId());
            entry.put("name", tech.getFullName());
            entry.put("specialization", tech.getSpecialization());
            entry.put("available", tech.isAvailable());
            entry.put("activeIncidents", incidentRepository.countActiveByTechnician(tech.getId()));
            return entry;
        }).collect(Collectors.toList());
    }

    public Map<String, Long> getIncidentsByStatus() {
        return incidentRepository.findAll().stream()
                .collect(Collectors.groupingBy(i -> i.getStatus().name(), Collectors.counting()));
    }

    public Map<String, Long> getIncidentsByPriority() {
        return incidentRepository.findAll().stream()
                .filter(i -> i.getPriority() != null)
                .collect(Collectors.groupingBy(i -> i.getPriority().name(), Collectors.counting()));
    }

    public Map<String, Long> getIncidentsByCategory() {
        return incidentRepository.findAll().stream()
                .filter(i -> i.getCategory() != null)
                .collect(Collectors.groupingBy(i -> i.getCategory().getName(), Collectors.counting()));
    }

    public Map<String, Long> getIncidentsByService() {
        return incidentRepository.findAll().stream()
                .filter(i -> i.getService() != null)
                .collect(Collectors.groupingBy(i -> i.getService().getName(), Collectors.counting()));
    }
}
