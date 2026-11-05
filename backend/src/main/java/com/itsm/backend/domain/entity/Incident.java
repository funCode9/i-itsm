package com.itsm.backend.domain.entity;

import com.itsm.backend.domain.enums.IncidentStatus;
import com.itsm.backend.domain.enums.Priority;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Core entity representing an IT incident.
 *
 * Priority Score = impact × urgency × businessCriticality (each 1–3).
 * The lifecycle is managed by IncidentService via a finite state machine.
 *
 * OOP: Encapsulation — all business-critical fields are private.
 * OOP: Association — relates to User, Category, ItService, Technician.
 * OOP: Aggregation — incident is an aggregate root with notes and SLA records.
 */
@Entity
@Table(name = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String incidentNumber;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 5000)
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "service_id")
    private ItService service;

    /** Impact: 1 (Low), 2 (Medium), 3 (High) */
    @Min(1) @Max(3)
    @Column(nullable = false)
    @Builder.Default
    private int impact = 1;

    /** Urgency: 1 (Low), 2 (Medium), 3 (High) */
    @Min(1) @Max(3)
    @Column(nullable = false)
    @Builder.Default
    private int urgency = 1;

    /** Business Criticality: 1 (Low), 2 (Medium), 3 (High) */
    @Min(1) @Max(3)
    @Column(nullable = false)
    @Builder.Default
    private int businessCriticality = 1;

    /** Computed = impact × urgency × businessCriticality */
    private int priorityScore;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_technician_id")
    private Technician assignedTechnician;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private IncidentStatus status = IncidentStatus.NEW;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime resolvedAt;

    private LocalDateTime closedAt;

    /** First time a technician acknowledged/responded to the incident */
    private LocalDateTime respondedAt;

    @Column(length = 5000)
    private String resolutionDetails;

    @Column(length = 2000)
    private String closureNotes;

    /** If this incident is detected as a potential duplicate of another */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "duplicate_of_id")
    private Incident duplicateOf;

    @Builder.Default
    private boolean potentialDuplicate = false;
}
