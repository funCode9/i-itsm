package com.itsm.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * IT service managed by the organization (e.g., Email, VPN, HR System).
 * Named ItService to avoid conflict with the SQL reserved word 'service'.
 *
 * OOP: Association — ItService is associated with a Category.
 */
@Entity
@Table(name = "it_services")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
