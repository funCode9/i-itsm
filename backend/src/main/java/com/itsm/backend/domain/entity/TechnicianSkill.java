package com.itsm.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A skill tag associated with a Technician.
 * Used by SkillBasedAssignmentStrategy to match incidents to technicians.
 *
 * OOP: Aggregation — TechnicianSkill exists as part of a Technician aggregate.
 */
@Entity
@Table(name = "technician_skills")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id", nullable = false)
    private Technician technician;

    @Column(name = "skill_name", nullable = false, length = 100)
    private String skillName;
}
