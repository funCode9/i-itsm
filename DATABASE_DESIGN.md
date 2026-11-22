# Database Design & Schema Specification

**Course:** CS F213 / MAC F212 — Object Oriented Programming  
**Department:** Department of Computer Science & Information Systems, BITS Pilani  
**Project:** Intelligent IT Service Management & Incident Resolution System (I-ITSM)  
**Group Number:** 36  
**Faculty:** Prof. Subhrakanta Panda  
**Submission Date:** 22/11/2026  

---

The I-ITSM persistent storage is implemented using **PostgreSQL 18.x** in the `itsm_db` database. The relational schema is mapped via JPA / Hibernate entities with strict foreign keys, indexing, and cascade rules.

---

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o| TECHNICIANS : "has profile (1:1)"
    USERS ||--o{ INCIDENTS : "reports (1:N)"
    USERS ||--o{ NOTIFICATIONS : "receives (1:N)"
    USERS ||--o{ AUDIT_LOGS : "acts (1:N)"
    USERS ||--o{ FEEDBACK : "submits (1:N)"

    TECHNICIANS ||--o{ TECHNICIAN_SKILLS : "possesses (1:N)"
    TECHNICIANS ||--o{ INCIDENTS : "assigned to (1:N)"
    TECHNICIANS ||--o{ ASSIGNMENT_HISTORY : "logged in (1:N)"

    CATEGORIES ||--o{ IT_SERVICES : "categorizes (1:N)"
    CATEGORIES ||--o{ INCIDENTS : "classifies (1:N)"
    IT_SERVICES ||--o{ INCIDENTS : "affected by (1:N)"

    INCIDENTS ||--o{ INCIDENT_NOTES : "contains (1:N)"
    INCIDENTS ||--o| INCIDENT_SLA_RECORDS : "tracked by (1:1)"
    INCIDENTS ||--o| FEEDBACK : "evaluated by (1:1)"
    INCIDENTS ||--o{ ASSIGNMENT_HISTORY : "tracks (1:N)"
    INCIDENTS ||--o{ AUDIT_LOGS : "logs events (1:N)"

    SLA_POLICIES ||--o{ INCIDENT_SLA_RECORDS : "defines rules (1:N)"

    USERS {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password_hash
        varchar role
        varchar full_name
        varchar department
        varchar phone
        boolean enabled
        timestamp created_at
        timestamp updated_at
    }

    TECHNICIANS {
        bigint id PK
        bigint user_id FK,UK
        varchar specialization
        boolean available
    }

    TECHNICIAN_SKILLS {
        bigint id PK
        bigint technician_id FK
        varchar skill_name
    }

    CATEGORIES {
        bigint id PK
        varchar name UK
        varchar description
        text keywords
        boolean active
    }

    IT_SERVICES {
        bigint id PK
        varchar name UK
        varchar description
        bigint category_id FK
        boolean active
    }

    INCIDENTS {
        bigint id PK
        varchar incident_number UK
        varchar title
        text description
        bigint reporter_id FK
        bigint category_id FK
        bigint service_id FK
        bigint assigned_technician_id FK
        int impact
        int urgency
        int business_criticality
        int priority_score
        varchar priority
        varchar status
        timestamp created_at
        timestamp updated_at
        timestamp responded_at
        timestamp resolved_at
        timestamp closed_at
        text resolution_details
        text closure_notes
    }

    INCIDENT_NOTES {
        bigint id PK
        bigint incident_id FK
        bigint author_id FK
        text content
        varchar note_type
        boolean visible_to_employee
        timestamp created_at
    }

    ASSIGNMENT_HISTORY {
        bigint id PK
        bigint incident_id FK
        bigint technician_id FK
        bigint assigned_by_id FK
        timestamp assigned_at
        varchar strategy
        boolean manual
        varchar reason
    }

    SLA_POLICIES {
        bigint id PK
        varchar priority UK
        int response_minutes
        int resolution_minutes
        boolean active
    }

    INCIDENT_SLA_RECORDS {
        bigint id PK
        bigint incident_id FK,UK
        bigint policy_id FK
        timestamp response_deadline
        timestamp resolution_deadline
        timestamp responded_at
        timestamp resolved_at
        boolean response_breached
        boolean resolution_breached
        varchar status
    }

    AUDIT_LOGS {
        bigint id PK
        timestamp timestamp
        bigint actor_id FK
        bigint incident_id FK
        varchar action
        varchar previous_state
        varchar new_state
        text description
    }

    NOTIFICATIONS {
        bigint id PK
        bigint recipient_id FK
        varchar title
        text message
        varchar notification_type
        boolean read
        bigint related_incident_id
        varchar related_incident_number
        timestamp created_at
    }

    FEEDBACK {
        bigint id PK
        bigint incident_id FK,UK
        bigint submitted_by_id FK
        int rating
        text comment
        timestamp submitted_at
    }

    SYSTEM_CONFIG {
        bigint id PK
        varchar config_key UK
        varchar config_value
        varchar description
    }

    EMAIL_LOGS {
        bigint id PK
        varchar recipient_email
        varchar recipient_name
        varchar subject
        text body
        bigint related_incident_id
        varchar related_incident_number
        timestamp sent_at
    }
```

---

## 2. Table Specifications & Relationships

1. **`users`**: Central authentication table. Roles stored as string enums (`EMPLOYEE`, `TECHNICIAN`, `ADMINISTRATOR`).
2. **`technicians`**: Profile details linked 1:1 to `users`. Manages availability state.
3. **`technician_skills`**: Composite skill tags linked via foreign key to `technicians` with `cascade = CascadeType.ALL, orphanRemoval = true`.
4. **`categories`**: Classification buckets with a `keywords` text column used by the intelligent suggestion engine.
5. **`it_services`**: Available catalog services linked to a parent category.
6. **`incidents`**: Central entity capturing the 16+ core fields, priority score, priority enum, lifecycle status enum, foreign keys to reporter, technician, category, and service.
7. **`incident_notes`**: Comments, investigation logs, and resolution details attached to incidents.
8. **`assignment_history`**: Audit trail of technician assignments and strategy attribution.
9. **`sla_policies`**: Priority-indexed policies specifying response and resolution minute windows.
10. **`incident_sla_records`**: Tracking entity computing deadlines and recording breach states.
11. **`audit_logs`**: Immutable, append-only ledger for compliance tracking.
12. **`notifications`**: User-facing in-app alerts.
13. **`feedback`**: Post-resolution employee satisfaction rating (1–5) and commentary.
14. **`system_config`**: Key-value table storing dynamic runtime parameters (such as `ASSIGNMENT_STRATEGY`).
15. **`email_logs`**: Simulated outbound email inbox for demonstration and audit review.
