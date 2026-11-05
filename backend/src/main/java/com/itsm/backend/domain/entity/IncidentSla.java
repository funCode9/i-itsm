package com.itsm.backend.domain.entity;

import com.itsm.backend.domain.enums.SlaStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * SLA tracking record for a specific incident.
 * Created when an incident is assigned; deadlines computed from SlaPolicy.
 * Updated by SlaMonitoringService via @Scheduled job.
 *
 * OOP: Composition — IncidentSla cannot exist without an Incident.
 */
@Entity
@Table(name = "incident_sla_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentSla {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id", unique = true, nullable = false)
    private Incident incident;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "policy_id", nullable = false)
    private SlaPolicy policy;

    @Column(nullable = false)
    private LocalDateTime responseDeadline;

    @Column(nullable = false)
    private LocalDateTime resolutionDeadline;

    private LocalDateTime respondedAt;

    private LocalDateTime resolvedAt;

    @Builder.Default
    private boolean responseBreached = false;

    @Builder.Default
    private boolean resolutionBreached = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SlaStatus status = SlaStatus.ON_TIME;
}
