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

## 2. Object-Oriented Programming (OOP) Principles Implementation

### 1. Encapsulation
- All domain entity attributes (`Incident`, `User`, `Technician`, `SlaPolicy`, etc.) are declared with `private` access modifiers.
- Mutable state modifications occur through validated domain methods and service orchestrators.
- Internal algorithms such as priority score calculation, token verification, and similarity matching are hidden from consumers behind well-defined public APIs.

### 2. Abstraction
- **Interfaces for Algorithms:** Callers interact with the `AssignmentStrategy` interface rather than concrete algorithmic implementations.
- **Service Layer Abstraction:** Controllers do not execute direct SQL or entity manipulations; they interact with coarse-grained business services (`IncidentService`, `UserService`, `TechnicianService`).

### 3. Inheritance
- Spring Security integration uses inheritance by extending `OncePerRequestFilter` inside `JwtAuthFilter`.
- `IncidentStatusChangedEvent`, `IncidentCreatedEvent`, and `IncidentAssignedEvent` inherit from Spring's `ApplicationEvent`.

### 4. Polymorphism
- The `AssignmentStrategy` interface exposes:
  ```java
  public interface AssignmentStrategy {
      Optional<Technician> assignTechnician(Incident incident);
      String getStrategyName();
  }
  ```
  Both `SkillBasedAssignmentStrategy` and `LeastLoadedAssignmentStrategy` implement this interface polymorphically. The `AssignmentStrategyContext` executes `strategy.assignTechnician(incident)` without knowing or coupling to the concrete class.
- The `GlobalExceptionHandler` polymorphic method overloading dynamically dispatches errors based on specific runtime exception signatures (`InvalidStateTransitionException`, `DuplicateResourceException`, etc.).

### 5. Composition and Aggregation
- **Composition:** `Technician` has an `@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)` relationship with `TechnicianSkill`. A `TechnicianSkill` has no independent lifecycle outside of its parent `Technician`.
- **Composition:** `Incident` owns `IncidentNote` and `IncidentSla`.
- **Aggregation:** `Incident` aggregates references to `User` (Reporter), `Technician` (Assignee), `Category`, and `ItService`. These independent entities exist prior to and beyond the incident.

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
- Adheres to Open-Closed Principle (OCP): new assignment algorithms (e.g., Round-Robin, Shift-Based) can be added without altering existing incident handling code.
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
    IS->>DB: save(updatedIncident)
    IS->>EP: publishEvent(IncidentStatusChangedEvent)
    par Async Audit Logging
        EP->>AL: onStatusChanged(event)
        AL->>DB: save(AuditLog)
    and Async Notifications & Email Log
        EP->>NL: onStatusChanged(event)
        NL->>DB: save(Notification)
        NL->>DB: save(EmailLog)
    end
```
**Benefits:**
- Decouples core incident workflow from side effects (audit logging, email simulation, user alerting).
- Non-blocking execution: Event listeners run asynchronously (`@Async`), keeping REST responses fast.

---

## 4. Finite State Machine (Incident Lifecycle)

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
Any attempt to skip states (e.g. `NEW` ➔ `RESOLVED` or `NEW` ➔ `CLOSED`) throws an `InvalidStateTransitionException` and returns HTTP 400.
