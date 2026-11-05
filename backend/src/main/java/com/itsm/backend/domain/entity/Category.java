package com.itsm.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * IT incident category (e.g., Network, Hardware, Software, Security).
 * The 'keywords' field is used by CategorySuggestionService for intelligent category suggestion.
 *
 * OOP: Encapsulation — business data is encapsulated within this entity.
 */
@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    /**
     * Comma-separated keywords used for automatic category suggestion.
     * Example: "network,internet,wifi,vpn,connectivity,router,switch"
     */
    @Column(length = 2000)
    private String keywords;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
