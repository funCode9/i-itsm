package com.itsm.backend.domain.entity;

import com.itsm.backend.domain.enums.NoteType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * A note or comment attached to an incident.
 * Supports investigation notes, resolution details, and information requests.
 *
 * OOP: Composition — IncidentNote has no meaningful existence without an Incident.
 */
@Entity
@Table(name = "incident_notes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id", nullable = false)
    private Incident incident;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 5000)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private NoteType noteType = NoteType.COMMENT;

    @Column(nullable = false)
    @Builder.Default
    private boolean visibleToEmployee = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
