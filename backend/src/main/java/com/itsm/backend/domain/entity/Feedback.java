package com.itsm.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Employee feedback on a resolved incident.
 * One feedback per incident (OneToOne).
 */
@Entity
@Table(name = "feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id", unique = true, nullable = false)
    private Incident incident;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "submitted_by_id", nullable = false)
    private User submittedBy;

    /** Rating from 1 (very poor) to 5 (excellent) */
    @Column(nullable = false)
    private int rating;

    @Column(length = 2000)
    private String comment;

    @CreationTimestamp
    private LocalDateTime submittedAt;
}
