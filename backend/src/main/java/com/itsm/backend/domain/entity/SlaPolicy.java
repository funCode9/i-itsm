package com.itsm.backend.domain.entity;

import com.itsm.backend.domain.enums.Priority;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * SLA policy definition per priority level.
 * Default policies are seeded at startup by DataLoader.
 *
 * P1: Response 5 min, Resolution 30 min
 * P2: Response 15 min, Resolution 120 min
 * P3: Response 60 min, Resolution 480 min
 * P4: Response 240 min, Resolution 1440 min
 */
@Entity
@Table(name = "sla_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlaPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private Priority priority;

    /** Maximum minutes allowed before first response */
    @Column(nullable = false)
    private int responseMinutes;

    /** Maximum minutes allowed before full resolution */
    @Column(nullable = false)
    private int resolutionMinutes;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
