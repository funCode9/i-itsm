import os

diag_dir = r"c:\dev\i-itsm\docs\project-report\diagrams"
os.makedirs(diag_dir, exist_ok=True)

# 1. System Architecture Diagram (MMD & SVG)
arch_mmd = """graph TD
    subgraph Client_Layer ["Client & Presentation Layer (React 18 + Vite 6 + MUI v5)"]
        UI_Emp["Employee Portal<br/>(ReportIncident, MyIncidents)"]
        UI_Tech["Technician Workspace<br/>(AssignedIncidents, Notes, RCA)"]
        UI_Admin["Admin Operations Console<br/>(Console, Users, SLAs, Audit)"]
        Axios["Axios API Client<br/>(JWT Interceptor, BaseURL Router)"]
        UI_Emp --> Axios
        UI_Tech --> Axios
        UI_Admin --> Axios
    end

    subgraph Security_Gate ["API Gateway & Security Filter Chain"]
        CORS["CORS Filter<br/>(AllowedOriginPatterns)"]
        JwtFilter["JwtAuthFilter<br/>(Bearer Token Extraction)"]
        SecConfig["SecurityFilterChain<br/>(RBAC: EMPLOYEE, TECHNICIAN, ADMINISTRATOR)"]
        CORS --> JwtFilter --> SecConfig
    end
    Axios -->|"HTTPS / REST JSON"| CORS

    subgraph Controller_Layer ["REST API Controllers (Spring Boot 4.1.2 / Java 21)"]
        C_Auth["AuthController (/api/auth)"]
        C_Inc["IncidentController (/api/incidents)"]
        C_Tech["TechnicianController (/api/technician)"]
        C_Admin["AdminController (/api/admin)"]
        C_Cat["CategoryController (/api/categories)"]
        C_Svc["ServiceController (/api/services)"]
        C_Sla["SlaPolicyController (/api/sla-policies)"]
        C_Notif["NotificationController (/api/notifications)"]
        C_Audit["AuditController (/api/audit)"]
        C_Feed["FeedbackController (/api/feedback)"]
        C_Ai["AiController (/api/ai)"]
    end
    SecConfig --> Controller_Layer

    subgraph Service_Domain_Layer ["Core Business Logic & Domain Services"]
        S_Auth["AuthService<br/>(BCrypt, JWT Generation)"]
        S_Inc["IncidentService<br/>(Lifecycle FSM, Workflow Management)"]
        S_Sla["SlaMonitoringService<br/>(@Scheduled Background SLA Evaluator)"]
        S_Esc["IncidentEscalationService<br/>(Priority Bump & Auto-Reassign)"]
        P_Eng["PriorityEngine<br/>(Score = Impact * Urgency * Criticality)"]
        
        subgraph Strategy_Module ["Technician Assignment (Strategy Pattern)"]
            Ctx["AssignmentStrategyContext"]
            Strat_Skill["SkillBasedAssignmentStrategy"]
            Strat_Load["LeastLoadedAssignmentStrategy"]
            Ctx --> Strat_Skill
            Ctx --> Strat_Load
        end

        subgraph Intelligent_Module ["Intelligent & AI Heuristics"]
            S_CatSug["CategorySuggestionService (Keyword Lexicon)"]
            S_Dup["DuplicateDetectionService (Jaccard Overlap)"]
            S_SlaPred["SlaPredictionService (Inertia Risk Model)"]
            S_Rca["RootCauseAnalysisService (Failure Taxonomy)"]
            S_Gemini["GeminiResolutionService & GeminiClient"]
        end

        subgraph Observer_Module ["Event-Driven Bus (Observer Pattern)"]
            Publisher["ApplicationEventPublisher"]
            E_Notif["NotificationEventListener (@Async In-App & EmailLog)"]
            E_Audit["AuditEventListener (@Async Immutable AuditLog)"]
            Publisher --> E_Notif
            Publisher --> E_Audit
        end

        S_Inc --> P_Eng
        S_Inc --> Ctx
        S_Inc --> Publisher
        S_Inc --> S_Esc
    end
    C_Inc --> S_Inc
    C_Auth --> S_Auth
    C_Inc --> Intelligent_Module
    C_Ai --> Intelligent_Module

    subgraph Persistence_Layer ["Data Persistence & Repositories (Spring Data JPA / Hibernate 7)"]
        R_Inc["IncidentRepository"]
        R_User["UserRepository"]
        R_Tech["TechnicianRepository"]
        R_Sla["IncidentSlaRepository & SlaPolicyRepository"]
        R_Audit["AuditLogRepository & EmailLogRepository"]
        R_Notif["NotificationRepository"]
        R_Cat["CategoryRepository & ItServiceRepository"]
    end
    Service_Domain_Layer --> Persistence_Layer

    subgraph Database_Layer ["Relational Storage (PostgreSQL 18.7)"]
        NeonDB[("Neon Cloud PostgreSQL / Local itsm_db<br/>15 Tables: incidents, users, technicians, sla_policies,<br/>audit_logs, notifications, email_logs, feedback...")]
    end
    Persistence_Layer -->|"JDBC (HikariCP Connection Pool)"| NeonDB
"""

with open(os.path.join(diag_dir, "system_architecture.mmd"), "w", encoding="utf-8") as f:
    f.write(arch_mmd)

# 2. Use Case Diagram
use_case_mmd = """graph LR
    subgraph Actors
        Emp((Employee / Customer))
        Tech((Technician / Support Engineer))
        Admin((Administrator / IT Manager))
        System((System / Background Scheduler))
    end

    subgraph UC_Emp ["Employee Use Cases"]
        UC1["Register & Authenticate"]
        UC2["Report Incident with Category & Impact"]
        UC3["View & Track My Incidents"]
        UC4["Chat with AI Support Assistant"]
        UC5["Provide Resolution Feedback"]
        UC6["Verify & Close Incident"]
    end

    subgraph UC_Tech ["Technician Use Cases"]
        UC7["View Assigned Workload Queue"]
        UC8["Acknowledge Assigned Incident"]
        UC9["Add Investigation Notes"]
        UC10["Inspect Root-Cause Analysis (RCA)"]
        UC11["Apply AI Resolution Playbook"]
        UC12["Resolve Incident with Resolution Details"]
        UC13["Update Availability & Skills"]
    end

    subgraph UC_Admin ["Administrator Use Cases"]
        UC14["Monitor Operations Health Console"]
        UC15["Manage User & Technician Accounts"]
        UC16["Configure Service Catalog & Categories"]
        UC17["Configure SLA Policies & Thresholds"]
        UC18["Switch Active Assignment Strategy"]
        UC19["Inspect Immutable Audit Trail & Logs"]
        UC20["Export Incident & SLA Compliance Reports"]
    end

    subgraph UC_Sys ["System / Automated Use Cases"]
        UC21["Calculate Priority Score (1-27 -> P1..P4)"]
        UC22["Auto-Assign Technician (Skill / Least-Loaded)"]
        UC23["Dispatch In-App Notifications & Email Logs"]
        UC24["Monitor SLA Deadlines & Flag Breaches"]
        UC25["Auto-Escalate Critical Unacknowledged Tickets"]
    end

    Emp --> UC1
    Emp --> UC2
    Emp --> UC3
    Emp --> UC4
    Emp --> UC5
    Emp --> UC6

    Tech --> UC1
    Tech --> UC7
    Tech --> UC8
    Tech --> UC9
    Tech --> UC10
    Tech --> UC11
    Tech --> UC12
    Tech --> UC13

    Admin --> UC1
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16
    Admin --> UC17
    Admin --> UC18
    Admin --> UC19
    Admin --> UC20

    System --> UC21
    System --> UC22
    System --> UC23
    System --> UC24
    System --> UC25
"""

with open(os.path.join(diag_dir, "use_case_diagram.mmd"), "w", encoding="utf-8") as f:
    f.write(use_case_mmd)

# 3. Class Diagram (MMD)
class_mmd = """classDiagram
    class User {
        -Long id
        -String username
        -String email
        -String password
        -String fullName
        -String department
        -String phone
        -Role role
        -boolean enabled
        -LocalDateTime createdAt
    }

    class Technician {
        -Long id
        -User user
        -boolean available
        -int maxConcurrentIncidents
        -Set~TechnicianSkill~ skills
        +boolean isAvailable()
    }

    class Incident {
        -Long id
        -String incidentNumber
        -String title
        -String description
        -User reporter
        -Technician assignedTechnician
        -Category category
        -ItService affectedService
        -Priority priority
        -IncidentStatus status
        -int impact
        -int urgency
        -int businessCriticality
        -String resolutionDetails
        -String closureNotes
        -LocalDateTime createdAt
        -LocalDateTime resolvedAt
        -LocalDateTime closedAt
        +transitionTo(IncidentStatus next)
    }

    class AssignmentStrategy {
        <<interface>>
        +assignTechnician(Incident incident) Optional~Technician~
        +getStrategyName() String
    }

    class SkillBasedAssignmentStrategy {
        -TechnicianRepository technicianRepository
        +assignTechnician(Incident incident) Optional~Technician~
        +getStrategyName() String
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
    }

    class PriorityEngine {
        <<utility>>
        +computeScore(int impact, int urgency, int criticality)$ int
        +determinePriority(int impact, int urgency, int criticality)$ Priority
        +fromScore(int score)$ Priority
    }

    class SlaPolicy {
        -Long id
        -Priority priority
        -int responseTimeMinutes
        -int resolutionTimeMinutes
        -Category category
    }

    class IncidentSla {
        -Long id
        -Incident incident
        -SlaPolicy slaPolicy
        -LocalDateTime responseDeadline
        -LocalDateTime resolutionDeadline
        -LocalDateTime actualResponseTime
        -LocalDateTime actualResolutionTime
        -SlaStatus status
        -boolean responseBreached
        -boolean resolutionBreached
    }

    class NotificationEventListener {
        -NotificationRepository notificationRepository
        -EmailLogRepository emailLogRepository
        +onIncidentCreated(IncidentCreatedEvent event)
        +onStatusChanged(IncidentStatusChangedEvent event)
        +onIncidentAssigned(IncidentAssignedEvent event)
    }

    class AuditEventListener {
        -AuditLogRepository auditLogRepository
        +onIncidentCreated(IncidentCreatedEvent event)
        +onStatusChanged(IncidentStatusChangedEvent event)
        +onIncidentAssigned(IncidentAssignedEvent event)
    }

    AssignmentStrategy <|.. SkillBasedAssignmentStrategy : implements
    AssignmentStrategy <|.. LeastLoadedAssignmentStrategy : implements
    AssignmentStrategyContext o-- AssignmentStrategy : delegates to
    IncidentService --> AssignmentStrategyContext : uses
    IncidentService --> PriorityEngine : uses
    Incident "1" *-- "1" IncidentSla : tracks SLA
    Incident "1" o-- "1" User : reported by
    Incident "1" o-- "0..1" Technician : assigned to
    Technician "1" *-- "1" User : wraps user account
    Technician "1" o-- "*" TechnicianSkill : specializes in
    IncidentSla "1" o-- "1" SlaPolicy : governed by
    IncidentService ..> NotificationEventListener : emits events to
    IncidentService ..> AuditEventListener : emits events to
"""

with open(os.path.join(diag_dir, "class_diagram.mmd"), "w", encoding="utf-8") as f:
    f.write(class_mmd)

# 4. ER Diagram (MMD)
er_mmd = """erDiagram
    users ||--o{ incidents : "reports"
    users ||--o| technicians : "serves as"
    users ||--o{ audit_logs : "acts in"
    users ||--o{ notifications : "receives"
    users ||--o{ email_logs : "addressed to"
    users ||--o{ feedback : "submits"
    users ||--o{ incident_notes : "authors"

    technicians ||--o{ incidents : "assigned to"
    technicians ||--o{ technician_skills : "possesses"
    technicians ||--o{ assignment_history : "logged in"

    categories ||--o{ incidents : "categorizes"
    categories ||--o{ it_services : "groups"
    categories ||--o{ sla_policies : "sets baseline for"

    it_services ||--o{ incidents : "impacted in"

    incidents ||--|| incident_sla_records : "monitored by"
    incidents ||--o{ incident_notes : "contains"
    incidents ||--o{ assignment_history : "tracks changes"
    incidents ||--o{ feedback : "evaluated by"
    incidents ||--o{ audit_logs : "records history"

    sla_policies ||--o{ incident_sla_records : "defines limits"

    users {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password
        varchar full_name
        varchar role
        varchar department
        varchar phone
        boolean enabled
        timestamp created_at
    }

    technicians {
        bigint id PK
        bigint user_id FK,UK
        boolean available
        integer max_concurrent_incidents
    }

    technician_skills {
        bigint id PK
        bigint technician_id FK
        varchar skill_name
    }

    categories {
        bigint id PK
        varchar name UK
        varchar description
        varchar keywords
        boolean active
    }

    it_services {
        bigint id PK
        varchar name UK
        varchar description
        bigint category_id FK
        varchar business_criticality
        boolean active
    }

    sla_policies {
        bigint id PK
        varchar priority
        integer response_time_minutes
        integer resolution_time_minutes
        bigint category_id FK
    }

    incidents {
        bigint id PK
        varchar incident_number UK
        varchar title
        text description
        bigint reporter_id FK
        bigint technician_id FK
        bigint category_id FK
        bigint service_id FK
        varchar priority
        varchar status
        integer impact
        integer urgency
        integer business_criticality
        text resolution_details
        text closure_notes
        timestamp created_at
        timestamp resolved_at
        timestamp closed_at
    }

    incident_sla_records {
        bigint id PK
        bigint incident_id FK,UK
        bigint sla_policy_id FK
        timestamp response_deadline
        timestamp resolution_deadline
        timestamp actual_response_time
        timestamp actual_resolution_time
        varchar status
        boolean response_breached
        boolean resolution_breached
    }

    incident_notes {
        bigint id PK
        bigint incident_id FK
        bigint author_id FK
        text content
        varchar note_type
        timestamp created_at
    }

    assignment_history {
        bigint id PK
        bigint incident_id FK
        bigint technician_id FK
        bigint assigned_by_id FK
        varchar strategy_used
        timestamp assigned_at
    }

    audit_logs {
        bigint id PK
        timestamp timestamp
        bigint actor_id FK
        bigint incident_id FK
        varchar action
        varchar previous_state
        varchar new_state
        varchar description
    }

    email_logs {
        bigint id PK
        timestamp timestamp
        bigint recipient_id FK
        varchar subject
        text body
        bigint incident_id FK
        varchar status
    }

    notifications {
        bigint id PK
        bigint user_id FK
        varchar title
        varchar message
        varchar type
        bigint incident_id FK
        boolean read
        timestamp created_at
    }

    feedback {
        bigint id PK
        bigint incident_id FK,UK
        bigint user_id FK
        integer rating
        text comments
        timestamp created_at
    }

    system_config {
        bigint id PK
        varchar config_key UK
        varchar config_value
        varchar description
    }
"""

with open(os.path.join(diag_dir, "er_diagram.mmd"), "w", encoding="utf-8") as f:
    f.write(er_mmd)

# 5. Sequence Diagram
seq_mmd = """sequenceDiagram
    autonumber
    actor Employee as Employee / Reporter
    participant FE as React Frontend
    participant IC as IncidentController
    participant IS as IncidentService
    participant PE as PriorityEngine
    participant SC as AssignmentStrategyContext
    participant EP as ApplicationEventPublisher
    participant NL as NotificationEventListener
    participant AL as AuditEventListener
    actor Tech as Assigned Technician
    actor Admin as IT Administrator

    Employee->>FE: Fills Incident Form (Title, Service, Impact=3, Urgency=3, Crit=3)
    FE->>IC: POST /api/incidents
    IC->>IS: createIncident(...)
    IS->>PE: computeScore(3, 3, 3) -> 27
    PE-->>IS: Priority.P1_CRITICAL
    IS->>IS: Status = NEW
    IS->>EP: publishEvent(IncidentCreatedEvent)
    par Async Notification & Audit Observers
        EP-)NL: onIncidentCreated() -> In-App Notification & EmailLog created
        EP-)AL: onIncidentCreated() -> AuditLog recorded (State: NEW)
    end
    IS->>SC: assignTechnician(incident)
    SC->>SC: getActiveStrategy() -> SkillBasedAssignmentStrategy
    SC-->>IS: Technician (Alex Network)
    IS->>IS: Status = ASSIGNED, Assignee = Alex
    IS->>EP: publishEvent(IncidentAssignedEvent)
    par Async Assignment Notifications
        EP-)NL: onIncidentAssigned() -> Alerts Technician Alex & Reporter
        EP-)AL: onIncidentAssigned() -> AuditLog recorded (State: ASSIGNED)
    end
    IS-->>IC: Incident DTO (INC-20261121-0001)
    IC-->>FE: 201 Created (Incident JSON)
    FE-->>Employee: Displays Ticket Number & Real-time Live Status

    Note over Tech, FE: Investigation & SLA Tracking
    Tech->>FE: Opens Assigned Incidents Queue
    Tech->>IC: PATCH /api/incidents/{id}/status (ACKNOWLEDGED)
    IC->>IS: updateStatus(ACKNOWLEDGED)
    IS->>EP: publishEvent(IncidentStatusChangedEvent)
    Tech->>IC: PATCH /api/incidents/{id}/status (IN_PROGRESS)
    Tech->>IC: POST /api/incidents/{id}/notes (Adds Troubleshooting Note)
    Tech->>IC: GET /api/incidents/{id}/root-cause (Inspects Heuristic RCA)
    Tech->>IC: PATCH /api/incidents/{id}/status (RESOLVED, Resolution Details)
    IS->>IS: Status = RESOLVED, resolvedAt = now()
    IS->>EP: publishEvent(IncidentStatusChangedEvent)
    EP-)NL: Alerts Employee that incident is Resolved

    Note over Employee, Admin: Verification & Closure
    Employee->>FE: Reviews resolution details & confirms service restored
    Employee->>IC: PATCH /api/incidents/{id}/status (VERIFIED)
    Employee->>IC: PATCH /api/incidents/{id}/status (CLOSED, Closure Notes)
    Employee->>FE: Submits 5-Star Feedback Rating
    Admin->>FE: Views Updated Dashboard Metrics & SLA Compliance (0 Breaches)
"""

with open(os.path.join(diag_dir, "sequence_diagram.mmd"), "w", encoding="utf-8") as f:
    f.write(seq_mmd)

print("Created all 5 MMD diagram files successfully.")
