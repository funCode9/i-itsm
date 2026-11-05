package com.itsm.backend.controller;

import com.itsm.backend.domain.entity.Technician;
import com.itsm.backend.domain.entity.User;
import com.itsm.backend.dto.CreateTechnicianRequest;
import com.itsm.backend.repository.UserRepository;
import com.itsm.backend.service.IncidentService;
import com.itsm.backend.service.TechnicianService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/technician")
@RequiredArgsConstructor
public class TechnicianController {

    private final TechnicianService technicianService;
    private final IncidentService incidentService;
    private final UserRepository userRepository;

    @GetMapping("/all")
    public ResponseEntity<List<Technician>> getAllTechnicians() {
        return ResponseEntity.ok(technicianService.getAllTechnicians());
    }

    @GetMapping("/profile")
    public ResponseEntity<Technician> getMyProfile(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        return ResponseEntity.ok(technicianService.getTechnicianByUserId(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Technician> getTechnician(@PathVariable Long id) {
        return ResponseEntity.ok(technicianService.getTechnicianById(id));
    }

    @GetMapping("/{id}/workload")
    public ResponseEntity<Map<String, Object>> getWorkload(@PathVariable Long id) {
        long count = technicianService.getActiveIncidentCount(id);
        Technician tech = technicianService.getTechnicianById(id);
        return ResponseEntity.ok(Map.of(
                "technicianId", id,
                "name", tech.getFullName(),
                "activeIncidents", count,
                "available", tech.isAvailable()
        ));
    }

    @GetMapping("/my-incidents")
    public ResponseEntity<?> getMyIncidents(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        Technician tech = technicianService.getTechnicianByUserId(user.getId());
        return ResponseEntity.ok(incidentService.getIncidentsByTechnician(tech.getId()));
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<Technician> setAvailability(@PathVariable Long id,
                                                       @RequestParam boolean available) {
        return ResponseEntity.ok(technicianService.updateAvailability(id, available));
    }

    @PutMapping("/{id}/skills")
    public ResponseEntity<Technician> updateSkills(@PathVariable Long id,
                                                    @RequestBody List<String> skills) {
        return ResponseEntity.ok(technicianService.updateSkills(id, skills));
    }
}
