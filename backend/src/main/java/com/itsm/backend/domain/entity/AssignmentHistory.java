package com.itsm.backend.domain.entity;

import com.itsm.backend.domain.enums.AssignmentStrategyType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Records each time a technician was assigned to an incident.
 * Maintains a full audit trail of assignment changes.
 *
 * OOP: Association — relates Incident, Technician, and User (assigned-by).
 */
@Entity
@Table(name = "assignment_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id", nullable = false)
    private Incident incident;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "technician_id", nullable = false)
    private Technician technician;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_by_id")
    private User assignedBy;

    @Column(nullable = false)
    private LocalDateTime assignedAt;

    /** Strategy that chose this technician, or MANUAL if admin assigned directly */
    @Enumerated(EnumType.STRING)
    private AssignmentStrategyType strategy;

    private boolean manual;

    @Column(length = 500)
    private String reason;
}
