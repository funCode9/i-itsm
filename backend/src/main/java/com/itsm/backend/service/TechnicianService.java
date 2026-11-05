package com.itsm.backend.service;

import com.itsm.backend.domain.entity.*;
import com.itsm.backend.domain.enums.Role;
import com.itsm.backend.exception.DuplicateResourceException;
import com.itsm.backend.exception.ResourceNotFoundException;
import com.itsm.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Manages technician profiles, skills, and availability.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TechnicianService {

    private final TechnicianRepository technicianRepository;
    private final UserRepository userRepository;
    private final TechnicianSkillRepository technicianSkillRepository;
    private final IncidentRepository incidentRepository;

    public Technician createTechnicianProfile(Long userId, String specialization, List<String> skills) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (technicianRepository.findByUserId(userId).isPresent()) {
            throw new DuplicateResourceException("Technician profile already exists for user: " + user.getUsername());
        }

        // Ensure user has TECHNICIAN role
        user.setRole(Role.TECHNICIAN);
        userRepository.save(user);

        Technician technician = Technician.builder()
                .user(user)
                .specialization(specialization)
                .available(true)
                .build();
        technician = technicianRepository.save(technician);

        if (skills != null) {
            for (String skillName : skills) {
                TechnicianSkill skill = TechnicianSkill.builder()
                        .technician(technician)
                        .skillName(skillName.trim())
                        .build();
                technicianSkillRepository.save(skill);
            }
        }

        return technicianRepository.findById(technician.getId()).orElse(technician);
    }

    @Transactional(readOnly = true)
    public Technician getTechnicianById(Long id) {
        return technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technician", id));
    }

    @Transactional(readOnly = true)
    public Technician getTechnicianByUserId(Long userId) {
        return technicianRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician profile not found for user: " + userId));
    }

    @Transactional(readOnly = true)
    public List<Technician> getAllTechnicians() {
        return technicianRepository.findAll();
    }

    public Technician updateAvailability(Long technicianId, boolean available) {
        Technician tech = getTechnicianById(technicianId);
        tech.setAvailable(available);
        return technicianRepository.save(tech);
    }

    public Technician updateSkills(Long technicianId, List<String> skills) {
        Technician tech = getTechnicianById(technicianId);
        technicianSkillRepository.deleteByTechnicianId(technicianId);

        for (String skillName : skills) {
            TechnicianSkill skill = TechnicianSkill.builder()
                    .technician(tech)
                    .skillName(skillName.trim())
                    .build();
            technicianSkillRepository.save(skill);
        }
        return technicianRepository.findById(technicianId).orElse(tech);
    }

    @Transactional(readOnly = true)
    public long getActiveIncidentCount(Long technicianId) {
        return incidentRepository.countActiveByTechnician(technicianId);
    }
}
