# I-ITSM UML Diagrams Reference

This document gathers all visual architectural, behavior, and design pattern diagrams for I-ITSM.

---

## 1. System Architecture Diagram

```mermaid
flowchart TD
    subgraph Client ["Frontend Layer (React 18 + Vite + MUI)"]
        UI_EMP["Employee Views\n(Dashboard, Report, My Incidents)"]
        UI_TECH["Technician Views\n(Workload, Investigation, Resolution)"]
        UI_ADMIN["Admin Views\n(Users, SLA, Strategy, Analytics)"]
        AxiosClient["Axios HTTP Client with JWT Interceptors"]
    end

    subgraph Security ["Security Layer (Spring Security 7 + JWT)"]
        JwtFilter["JwtAuthFilter (Token Verification)"]
        AuthManager["AuthenticationManager & PasswordEncoder"]
    end

    subgraph Controllers ["Presentation Layer (REST Controllers)"]
        AuthController["AuthController"]
        IncidentController["IncidentController"]
        AdminController["AdminController"]
        TechController["TechnicianController"]
        CatController["CategoryController / ServiceController"]
    end

    subgraph Business ["Service Layer (OOP Business Logic & Patterns)"]
        IncidentService["IncidentService (Lifecycle FSM)"]
        PriorityEngine["PriorityEngine (Rule-Based Score)"]
        StrategyContext["AssignmentStrategyContext (Strategy Pattern)"]
        SkillStrategy["SkillBasedAssignmentStrategy"]
        LoadStrategy["LeastLoadedAssignmentStrategy"]
        EventPub["ApplicationEventPublisher (Observer Pattern)"]
        AuditObs["AuditEventListener"]
        NotifObs["NotificationEventListener"]
        SlaMonitor["SlaMonitoringService (@Scheduled Worker)"]
        IntelDuplicate["DuplicateDetectionService"]
        IntelCategory["CategorySuggestionService"]
    end

    subgraph Data ["Data Access Layer (Spring Data JPA / Hibernate 7)"]
        Repositories["15 JPA Repositories (Incident, User, SLA, Audit, etc.)"]
    end

    subgraph DB ["Persistence Layer (PostgreSQL 18.6)"]
        PostgresDB[("PostgreSQL Database: itsm_db")]
    end

    Client -->|REST JSON / Bearer JWT| JwtFilter
    JwtFilter --> Controllers
    Controllers --> Business
    StrategyContext -->|Delegates to| SkillStrategy
    StrategyContext -->|Delegates to| LoadStrategy
    IncidentService --> StrategyContext
    IncidentService --> PriorityEngine
    IncidentService --> EventPub
    EventPub -.->|Asynchronous Event| AuditObs
    EventPub -.->|Asynchronous Event| NotifObs
    Business --> Repositories
    Repositories --> PostgresDB
```

---

## 2. Use Case Diagram

```mermaid
flowchart LR
    Employee((Employee))
    Technician((Technician))
    Admin((Administrator))

    subgraph UC_Incidents ["Incident Management"]
        UC1["Report Incident"]
        UC2["View My Incidents"]
        UC3["Verify Resolution"]
        UC4["Submit Feedback"]
        UC5["Acknowledge Incident"]
        UC6["Investigate & Add Notes"]
        UC7["Resolve Incident"]
    end

    subgraph UC_Admin ["Administration & Intelligence"]
        UC8["Manage Users & Technicians"]
        UC9["Configure SLA Policies"]
        UC10["Switch Assignment Strategy"]
        UC11["View Reports & Workload"]
        UC12["Inspect Audit Logs & SLA Breaches"]
    end

    Employee --> UC1
    Employee --> UC2
    Employee --> UC3
    Employee --> UC4

    Technician --> UC5
    Technician --> UC6
    Technician --> UC7

    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
```

---

## 3. Class Diagram (Core Domain Model & GoF Patterns)

```mermaid
classDiagram
    class User {
        -Long id
        -String username
        -String email
        -String passwordHash
        -Role role
        -String fullName
        -boolean enabled
    }

    class Technician {
        -Long id
        -User user
        -String specialization
        -boolean available
        -List~TechnicianSkill~ skills
        +getFullName() String
    }

    class TechnicianSkill {
        -Long id
        -Technician technician
        -String skillName
    }

    class Incident {
        -Long id
        -String incidentNumber
        -String title
        -String description
        -User reporter
        -Category category
        -ItService service
        -int impact
        -int urgency
        -int businessCriticality
        -int priorityScore
        -Priority priority
        -Technician assignedTechnician
        -IncidentStatus status
        -LocalDateTime createdAt
        -LocalDateTime respondedAt
        -LocalDateTime resolvedAt
        -LocalDateTime closedAt
        -String resolutionDetails
    }

    class AssignmentStrategy {
        <<interface>>
        +assignTechnician(Incident incident) Optional~Technician~
        +getStrategyName() String
    }

    class SkillBasedAssignmentStrategy {
        +assignTechnician(Incident incident) Optional~Technician~
    }

    class LeastLoadedAssignmentStrategy {
        +assignTechnician(Incident incident) Optional~Technician~
    }

    class AssignmentStrategyContext {
        +assignTechnician(Incident incident) Optional~Technician~
        +getActiveStrategy() AssignmentStrategy
    }

    class IncidentStatusChangedEvent {
        -Incident incident
        -IncidentStatus previousStatus
        -IncidentStatus newStatus
        -User actor
    }

    class AuditEventListener {
        +onStatusChanged(IncidentStatusChangedEvent event)
        +onIncidentCreated(IncidentCreatedEvent event)
    }

    class NotificationEventListener {
        +onStatusChanged(IncidentStatusChangedEvent event)
        +onIncidentAssigned(IncidentAssignedEvent event)
    }

    Technician "1" *-- "0..*" TechnicianSkill : Composed of
    Technician "1" --> "1" User : Associates
    Incident "0..*" --> "1" User : Reporter
    Incident "0..*" --> "0..1" Technician : Assignee
    AssignmentStrategy <|.. SkillBasedAssignmentStrategy : Implements
    AssignmentStrategy <|.. LeastLoadedAssignmentStrategy : Implements
    AssignmentStrategyContext --> AssignmentStrategy : Delegates to
    AuditEventListener ..> IncidentStatusChangedEvent : Observes
    NotificationEventListener ..> IncidentStatusChangedEvent : Observes
```

---

## 4. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o| TECHNICIANS : "has profile"
    USERS ||--o{ INCIDENTS : "reports"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ AUDIT_LOGS : "acts"
    USERS ||--o{ FEEDBACK : "submits"

    TECHNICIANS ||--o{ TECHNICIAN_SKILLS : "possesses"
    TECHNICIANS ||--o{ INCIDENTS : "assigned to"
    TECHNICIANS ||--o{ ASSIGNMENT_HISTORY : "logged in"

    CATEGORIES ||--o{ IT_SERVICES : "categorizes"
    CATEGORIES ||--o{ INCIDENTS : "classifies"
    IT_SERVICES ||--o{ INCIDENTS : "affected by"

    INCIDENTS ||--o{ INCIDENT_NOTES : "contains"
    INCIDENTS ||--o| INCIDENT_SLA_RECORDS : "tracked by"
    INCIDENTS ||--o| FEEDBACK : "evaluated by"
    INCIDENTS ||--o{ ASSIGNMENT_HISTORY : "tracks"
    INCIDENTS ||--o{ AUDIT_LOGS : "logs events"

    SLA_POLICIES ||--o{ INCIDENT_SLA_RECORDS : "defines rules"
```

---

## 5. Incident Lifecycle State Transition Diagram

```mermaid
stateDiagram-v2
    [*] --> NEW : Incident Created
    NEW --> CLASSIFIED : Classified & Assessed
    CLASSIFIED --> ASSIGNED : Technician Assigned
    ASSIGNED --> ACKNOWLEDGED : Technician Acknowledged (RespondedAt recorded)
    ACKNOWLEDGED --> IN_PROGRESS : Investigation & Work Active
    IN_PROGRESS --> RESOLVED : Solution Submitted (ResolvedAt recorded)
    RESOLVED --> VERIFIED : Employee / Admin Verifies Resolution
    RESOLVED --> IN_PROGRESS : Reopened if Issue Persists
    VERIFIED --> CLOSED : Ticket Archived with Closure Notes
    CLOSED --> [*]
```
