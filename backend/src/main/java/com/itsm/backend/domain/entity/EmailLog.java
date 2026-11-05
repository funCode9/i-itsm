package com.itsm.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Simulated email notification log (Mechanism 2 for notifications).
 * Email is not actually sent — it is logged here for demonstration/audit.
 *
 * OOP: Observer Pattern — EmailLog entries are created by EmailNotificationListener.
 */
@Entity
@Table(name = "email_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String recipientEmail;

    @Column(nullable = false, length = 200)
    private String recipientName;

    @Column(nullable = false, length = 300)
    private String subject;

    @Column(nullable = false, length = 5000)
    private String body;

    private Long relatedIncidentId;

    private String relatedIncidentNumber;

    @CreationTimestamp
    private LocalDateTime sentAt;
}
