package com.itsm.backend.domain.entity;

import com.itsm.backend.domain.enums.NotificationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * In-app notification for a user.
 * Created by NotificationEventListener (Observer pattern).
 *
 * OOP: Observer Pattern — notifications are created reactively to incident events.
 */
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType notificationType;

    @Column(nullable = false)
    @Builder.Default
    private boolean read = false;

    /** Optional link back to the related incident */
    private Long relatedIncidentId;

    private String relatedIncidentNumber;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
