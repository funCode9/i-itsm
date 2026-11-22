# I-ITSM Project Architecture & Object-Oriented Design

**Course:** CS F213 / MAC F212 — Object Oriented Programming  
**Department:** Department of Computer Science & Information Systems, BITS Pilani  
**Project:** Intelligent IT Service Management & Incident Resolution System (I-ITSM)  
**Group Number:** 36  
**Faculty:** Prof. Subhrakanta Panda  
**Submission Date:** 22/11/2026  

---

## 1. System Overview

I-ITSM follows an enterprise layered architecture with separation of concerns across presentation, business logic, persistence, and external communication boundaries.

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

## 2. Object-Oriented Principles Demonstration

| OOP Design Requirement | How I-ITSM Demonstrates It |
|---|---|
| **Encapsulation** | `Incident`, `User`, `Technician`, and `SlaPolicy` keep fields `private` with controlled accessors. Services manage state modifications. |
| **Abstraction** | `AssignmentStrategy.assignTechnician(Incident)` hides technician-selection logic. `IncidentService` exposes business operations. |
| **Inheritance** | `JwtAuthFilter` extends Spring Security's `OncePerRequestFilter`. Custom exceptions specialize Java runtime exception types. |
| **Polymorphism** | `AssignmentStrategyContext` calls `assignTechnician()` polymorphically on either `SkillBasedAssignmentStrategy` or `LeastLoadedAssignmentStrategy`. |
| **Interfaces** | `AssignmentStrategy` declares common contract. Spring Data JPA repository interfaces define standard data access operations. |
| **Composition** | `Technician` owns `TechnicianSkill` records with cascade and orphan removal. `Incident` owns notes and SLA records. |
| **Association** | `Incident` associates independent `User` (reporter) and `Technician` (assignee) entities. |
| **Aggregation** | `Incident` references shared catalog entities (`Category`, `ItService`) that survive incident deletion. |
| **Exception Handling** | `InvalidStateTransitionException` rejects illegal lifecycle changes. `GlobalExceptionHandler` converts exceptions to HTTP responses. |
| **Data Structures** | `Set<String>` for unique keyword tokens; `Map<IncidentStatus, Set<IncidentStatus>>` for FSM transition tables; `Optional<Technician>` for null-safe returns. |

---

## 3. GoF Design Patterns

### Design Pattern 1: Strategy Pattern (Technician Assignment)
```mermaid
classDiagram
    class AssignmentStrategy {
        <<interface>>
        +assignTechnician(Incident incident) Optional~Technician~
        +getStrategyName() String
    }
    class SkillBasedAssignmentStrategy {
        -TechnicianRepository technicianRepository
        +assignTechnician(Incident incident) Optional~Technician~
        +getStrategyName() String
        -buildKeywords(Incident incident) Set~String~
        -computeSkillScore(Technician tech, Set~String~ keywords) int
    }
    class LeastLoadedAssignmentStrategy {
        -TechnicianRepository technicianRepository
        +assignTechnician(Incident incident) Optional~Technician~
        +getStrategyName() String
    }
    class AssignmentStrategyContext {
        -SkillBasedAssignmentStrategy skillBasedStrategy
        -LeastLoadedAssignmentStrategy leastLoadedStrategy
        -SystemConfigRepository systemConfigRepository
        +assignTechnician(Incident incident) Optional~Technician~
        +getActiveStrategy() AssignmentStrategy
        +getActiveStrategyType() AssignmentStrategyType
    }
    AssignmentStrategy <|.. SkillBasedAssignmentStrategy
    AssignmentStrategy <|.. LeastLoadedAssignmentStrategy
    AssignmentStrategyContext --> AssignmentStrategy : invokes
```
**Benefits:**
- Adheres to Open-Closed Principle (OCP): new assignment algorithms can be added without altering existing incident handling code.
- Runtime dynamic reconfigurability: Administrators change the active strategy without restarting the application.

### Design Pattern 2: Observer Pattern (Incident Events, Audit & Notifications)
```mermaid
sequenceDiagram
    autonumber
    actor Tech as Technician / Actor
    participant IS as IncidentService
    participant EP as ApplicationEventPublisher
    participant AL as AuditEventListener (Observer 1)
    participant NL as NotificationEventListener (Observer 2)
    participant DB as PostgreSQL Database

    Tech->>IS: transitionStatus(incidentId, IN_PROGRESS)
    IS->>IS: validateTransition(ACKNOWLEDGED, IN_PROGRESS)
    IS->>DB: save(incident)
    IS->>EP: publishEvent(IncidentStatusChangedEvent)
    par Asynchronous Notification Observer
        EP-->>NL: onIncidentStatusChanged(event)
        NL->>DB: save(Notification)
        NL->>DB: save(EmailLog)
    and Asynchronous Audit Observer
        EP-->>AL: onIncidentStatusChanged(event)
        AL->>DB: save(AuditLog)
    end
```
**Benefits:**
- Loose coupling: `IncidentService` does not need direct references to notification or audit services.
- Extensibility: Adding a new listener (e.g., WebhookEventListener, SlackAlertListener) requires zero modifications to `IncidentService`.

---

## 4. Finite State Machine (Incident Lifecycle)

```mermaid
stateDiagram-v2
    [*] --> NEW : Employee Reports
    NEW --> CLASSIFIED : Priority & Category Assessed
    CLASSIFIED --> ASSIGNED : Technician Allocated via Strategy
    ASSIGNED --> ACKNOWLEDGED : Technician Accepts Ticket
    ACKNOWLEDGED --> IN_PROGRESS : Investigation Initiated
    IN_PROGRESS --> RESOLVED : Solution Applied & Notes Recorded
    RESOLVED --> VERIFIED : Employee Validates Fix
    RESOLVED --> IN_PROGRESS : Verification Fails / Reopened
    RESOLVED --> CLOSED : Admin Final Sign-off
    VERIFIED --> CLOSED : Formal Closure & Feedback Logged
    CLOSED --> [*]
```
