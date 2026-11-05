package com.itsm.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Immutable audit log entry. Every important incident event is recorded here.
 * Populated by AuditEventListener (Observer pattern).
 *
 * OOP: Observer Pattern — this entity stores events published by the IncidentEventPublisher.
 */
@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "actor_id")
    private User actor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id")
    private Incident incident;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(length = 50)
    private String previousState;

    @Column(length = 50)
    private String newState;

    @Column(length = 2000)
    private String description;
}
