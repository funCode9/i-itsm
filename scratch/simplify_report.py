import os, re

md_path = r"c:\dev\i-itsm\docs\project-report\I_ITSM_Project_Report.md"

simplified_report = """# INTELLIGENT IT SERVICE MANAGEMENT & INCIDENT RESOLUTION SYSTEM (I-ITSM)

## An Object-Oriented Platform for Incident Lifecycle Automation, Multi-Strategy Dispatching, SLA Compliance, and Heuristic Diagnostics

---

### ACADEMIC PROJECT REPORT

**Course:** CS F213 / MAC F212 — Object Oriented Programming  
**Semester:** Semester I, 2026–2027  
**Degree:** Bachelor of Engineering (Computer Science / Information Systems)  
**Institution:** Department of Computer Science & Information Systems, BITS Pilani  

---

**Submitted By: Group No. [X]**

| Student Name | Student ID | Designated Responsibilities |
| :--- | :--- | :--- |
| **[Student 1 Name]** | **2024A7PS0001P** | UI/UX Architecture, Frontend Client Integration, Role-Based Interfaces |
| **[Student 2 Name]** | **2024A7PS0002P** | Backend Architecture, REST API Engineering, Spring Security & JWT |
| **[Student 3 Name]** | **2024A7PS0003P** | Domain Model Engineering, OOP Design Patterns, Lifecycle FSM & Priority Engine |
| **[Student 4 Name]** | **2024A7PS0004P** | Database Design, Persistence Layer, JPA/Hibernate ORM & Cloud DB Deployment |
| **[Student 5 Name]** | **2024A7PS0005P** | Intelligent Features, Automated Root-Cause Analysis, Testing & DevOps Verification |

**Faculty Evaluation In-Charge:** [Faculty Name / Instructor-in-Charge]  
**Submission Date:** November 21, 2026  

---

<div style="page-break-after: always;"></div>

## ABSTRACT

Modern organizations rely heavily on stable IT infrastructure to deliver business services. When infrastructure components fail—such as databases, payment gateways, or authentication providers—unstructured incident handling causes delayed responses, arbitrary prioritization, technician burnout, and SLA violations.

This project presents the design, implementation, and evaluation of the **Intelligent IT Service Management & Incident Resolution System (I-ITSM)**. Built using **Java 21**, **Spring Boot 4.1.2**, **PostgreSQL 18.7**, and **React 18 (Vite 6)** with **Material-UI**, I-ITSM manages the complete incident lifecycle from initial submission through automated triage, investigation, resolution, and closure.

The system demonstrates clean Object-Oriented Programming (OOP) principles and GoF design patterns:
1. **Strategy Pattern:** Interchangeable technician assignment algorithms (**Skill-Based** matching vs. **Least-Loaded** workload balancing), dynamically configurable at runtime.
2. **Observer Pattern:** Decoupled, asynchronous event publishing for in-app notifications, email audit logging, and immutable system audit trails.
3. **Finite State Machine (FSM):** Strict validation of 8 incident lifecycle states (`NEW` ➔ `CLOSED`) preventing illegal transitions.
4. **Deterministic Priority Engine:** Rule-based scoring ($\text{Impact} \times \text{Urgency} \times \text{Criticality}$) mapping tickets into standardized tiers (P1 to P4).
5. **Intelligent Assistance:** Five deterministic heuristics including category suggestion, Jaccard duplicate detection, SLA risk prediction, diagnostic root-cause analysis, and AI playbook assistance.

The application has been validated with **27 automated tests (100% pass rate)** and is deployed on cloud infrastructure with persistent PostgreSQL storage.

**Keywords:** Object-Oriented Programming, Strategy Pattern, Observer Pattern, Finite State Machine, Spring Boot, React, PostgreSQL, Incident Management, SLA Monitoring.

---

<div style="page-break-after: always;"></div>

## TABLE OF CONTENTS

- **Chapter 1:** Introduction
- **Chapter 2:** Software Requirements Specification
- **Chapter 3:** Technology Stack and Selection Justification
- **Chapter 4:** System Architecture and Design
- **Chapter 5:** Object-Oriented Analysis and Design (OOAD)
- **Chapter 6:** Database Design
- **Chapter 7:** Detailed Module Implementation
- **Chapter 8:** Security and Exception Handling
- **Chapter 9:** Testing and Validation
- **Chapter 10:** Results and Application Screenshots
- **Chapter 11:** Challenges, Limitations and Future Scope
- **Chapter 12:** Conclusion
- **References**
- **Appendices**

---

<div style="page-break-after: always;"></div>

# CHAPTER 1 — INTRODUCTION

### 1.1 Background
In modern enterprises, business continuity depends directly on reliable Information Technology (IT) services. When hardware, software, or network services degrade, Incident Management serves as the frontline operational process to restore normal service operations rapidly and minimize business disruptions.

### 1.2 Problem Statement
Manual or informal incident management (such as spreadsheets, unindexed emails, or chat messages) suffers from major operational drawbacks:
1. **Delayed Triage:** Incidents sit unassigned without clear ownership.
2. **Subjective Prioritization:** Urgent issues are misclassified, delaying critical fixes.
3. **Imbalanced Workloads:** Tickets are routed without considering technician skill or active queue depth.
4. **Unmonitored SLAs:** Service Level Agreement deadlines are missed without warning.
5. **Duplicate Reports:** Major outages cause ticket floods from multiple users.
6. **Lack of Audit Trails:** No verifiable history of state changes, actions, or diagnostic steps.

### 1.3 Project Objectives
The I-ITSM platform was engineered to solve these problems by:
- Enforcing an 8-state **Finite State Machine** for incident lifecycle governance.
- Computing priority deterministically via an objective multi-factor scoring model.
- Implementing pluggable **Technician Assignment Strategies** (Skill-Based and Least-Loaded).
- Providing automated **SLA Tracking** with approaching-deadline warnings and breach escalations.
- Decoupling notifications and audit logging using an asynchronous **Observer Pattern**.
- Incorporating intelligent assistance: category suggestions, duplicate detection, and root-cause analysis.

### 1.4 Project Scope
The system delivers:
- **Backend:** A RESTful API built with Java 21, Spring Boot 4.1.2, Spring Security with stateless JWT, and Spring Data JPA.
- **Frontend:** A responsive Single Page Application built with React 18, Vite 6, Material-UI (MUI), and Recharts.
- **Database:** PostgreSQL 18.7 with 15 normalized relational tables.
- **Security:** Role-Based Access Control (RBAC) across Employee, Technician, and Administrator roles.
- **Testing & Deployment:** 27 automated JUnit 5 tests, containerized with Docker, deployed on Render with Neon Cloud PostgreSQL.

---

<div style="page-break-after: always;"></div>

# CHAPTER 2 — SOFTWARE REQUIREMENTS SPECIFICATION

### 2.1 Functional Requirements (FR)

| ID | Requirement | Description |
| :--- | :--- | :--- |
| **FR-01** | User Authentication | Secure user registration and login with stateless JWT authentication. |
| **FR-02** | Role-Based Access Control | Enforced access boundaries for Employee, Technician, and Administrator. |
| **FR-03** | Incident Creation | Submit tickets with title, description, category, service, impact, urgency, and criticality. |
| **FR-04** | Priority Engine | Deterministic priority calculation ($\text{Impact} \times \text{Urgency} \times \text{Criticality}$) mapping to P1–P4. |
| **FR-05** | Lifecycle State Machine | 8-state sequential FSM (`NEW` to `CLOSED`) rejecting invalid transitions. |
| **FR-06** | Strategy-Based Assignment | Automatic dispatching using Skill-Based or Least-Loaded strategy. |
| **FR-07** | SLA Policy Enforcement | Target response and resolution deadlines computed from priority policies. |
| **FR-08** | Automated SLA Monitoring | Background task scanning deadlines every 60s, triggering warnings and breach escalations. |
| **FR-09** | Notes & Audit Logging | Investigation notes appended to tickets; immutable audit logs captured on every mutation. |
| **FR-10** | Event Notifications | In-app alerts and simulated email logs published asynchronously on state changes. |
| **FR-11** | Multi-Criteria Search | Filtering across status, priority, category, service, technician, and text search. |
| **FR-12** | Analytics & Dashboards | Live metrics for ticket volume, resolution velocity, SLA compliance, and technician workload. |

### 2.2 Non-Functional Requirements (NFR)
- **Usability:** Clean Material-UI interface with responsive layouts, intuitive drawers, and dark/light mode.
- **Performance:** Sub-200ms API response time; asynchronous offloading of audit and notification tasks.
- **Reliability:** ACID transactional integrity with `@Transactional` guarantees.
- **Security:** BCrypt password hashing, stateless Bearer JWT tokens, and CORS origin controls.
- **Maintainability:** Adherence to SOLID design principles and GoF design patterns.

### 2.3 User Roles & Permissions Matrix

| System Capability | Employee | Technician | Administrator |
| :--- | :---: | :---: | :---: |
| Submit Incident | Yes | Yes | Yes |
| View Own Incidents | Yes | Yes (if reporter) | Yes (All) |
| View Assigned Queue | No | Yes (Assigned) | Yes (All) |
| Acknowledge / Investigate | No | Yes | Yes |
| Add Investigation Notes | Yes (Public) | Yes (Work/Public) | Yes (All) |
| Resolve Incident | No | Yes | Yes |
| Verify Fix / Reopen | Yes (Own) | No | Yes |
| Switch Assignment Strategy | No | No | Yes |
| Configure Categories / SLAs | No | No | Yes |
| View Full Audit Trail | No | No | Yes |

### 2.4 Incident Lifecycle State Machine

```text
NEW ➔ CLASSIFIED ➔ ASSIGNED ➔ ACKNOWLEDGED ➔ IN_PROGRESS ➔ RESOLVED ➔ VERIFIED ➔ CLOSED
                                                                 │
                                                                 └── (Reopened / Dispute) ➔ IN_PROGRESS
```

- Invalid state jumps (e.g., `NEW ➔ RESOLVED`) are rejected via `InvalidStateTransitionException`.
- Reopening is supported from `RESOLVED` back to `IN_PROGRESS` if verification fails.

---

<div style="page-break-after: always;"></div>

# CHAPTER 3 — TECHNOLOGY STACK AND SELECTION JUSTIFICATION

### 3.1 Technology Stack Summary

| Layer | Technology | Version | Purpose & Justification |
| :--- | :--- | :---: | :--- |
| **Language** | Java (LTS) | 21 | Strong static typing, modern temporal APIs (`java.time`), robust OOP design support. |
| **Backend** | Spring Boot | 4.1.2 | Inversion of Control (IoC), declarative transactions (`@Transactional`), event bus (`ApplicationEventPublisher`). |
| **Security** | Spring Security & JJWT | 6.x / 0.12.6 | Stateless JWT authentication, BCrypt password hashing, role-based authorization filters. |
| **ORM / Data** | Hibernate / Spring Data JPA | 7.4 | Strongly-typed repository abstractions, entity relationship mapping, ACID safety. |
| **Database** | PostgreSQL | 18.7 | Enterprise relational DBMS with foreign keys, indexing, and transactional integrity. |
| **Frontend** | React & Vite | 18.3 / 6.2 | Component-driven UI, fast development build, responsive Single Page Application. |
| **UI Library** | Material-UI (MUI) | 6.4 | Standardized enterprise components, accessible design system, and dark/light theming. |
| **Visualization**| Recharts | 2.15 | Responsive SVG charts for real-time operations and SLA performance monitoring. |
| **Cloud Host** | Render & Neon Cloud | Cloud | Containerized Docker service and serverless cloud PostgreSQL database. |

---

<div style="page-break-after: always;"></div>

# CHAPTER 4 — SYSTEM ARCHITECTURE AND DESIGN

### 4.1 Architectural Overview
I-ITSM follows a clean 4-tier enterprise architecture:
1. **Presentation Layer (React + MUI):** Client SPA communicating via Axios HTTP client with JWT interceptors.
2. **Security & Controller Layer (Spring Boot REST):** REST endpoints secured by `JwtAuthFilter` validating Bearer tokens.
3. **Business Logic Layer (Services & Strategies):** Core domain services, lifecycle state machine, priority scoring, and assignment strategies.
4. **Data Persistence Layer (JPA + PostgreSQL):** 15 JPA repository interfaces managing normalized relational tables.

Please inspect Figure 4.1 (`docs/project-report/diagrams/system_architecture.svg`) for the complete vector architectural blueprint showing component interconnects.

### 4.2 End-to-End Processing Sequence
Please refer to Figure 4.2 (`docs/project-report/diagrams/sequence_diagram.svg`), which illustrates the end-to-end processing sequence from incident submission, priority calculation, strategy assignment, observer notifications, technician acknowledgment, RCA investigation, resolution, and closure.

---

<div style="page-break-after: always;"></div>

# CHAPTER 5 — OBJECT-ORIENTED ANALYSIS AND DESIGN (OOAD)

### 5.1 Object-Oriented Principles Applied
- **Encapsulation:** Domain entities (`Incident`, `Technician`, `SlaPolicy`) maintain private fields accessible only through controlled accessors and domain methods.
- **Abstraction:** The `AssignmentStrategy` interface abstracts away complex dispatch algorithms behind a simple contract: `assignTechnician(Incident incident)`.
- **Polymorphism:** Runtime substitution of `SkillBasedAssignmentStrategy` and `LeastLoadedAssignmentStrategy` through `AssignmentStrategyContext`.
- **Inheritance:** Domain exceptions extend base runtime exceptions; entity models utilize JPA mapped superclass structures.

### 5.2 Implemented Design Patterns

#### 1. Strategy Pattern (Behavioral)
Technician assignment algorithms are decoupled behind the `AssignmentStrategy` interface:
```java
public interface AssignmentStrategy {
    Optional<Technician> assignTechnician(Incident incident);
    String getStrategyName();
}
```
`AssignmentStrategyContext` dynamically resolves the active strategy from system configuration at runtime without code modification.

#### 2. Observer Pattern (Behavioral)
Incident events are published via Spring's `ApplicationEventPublisher`:
- `IncidentCreatedEvent`, `IncidentStatusChangedEvent`, `IncidentAssignedEvent`.
- Listeners (`AuditEventListener`, `NotificationEventListener`) consume events asynchronously (`@Async`), decoupling transaction processing from alert delivery.

#### 3. State Pattern / Finite State Machine
Incident progression is validated using an explicit state transition mapping in `IncidentService`. Any illegal transition throws `InvalidStateTransitionException`.

#### 4. Repository Pattern (Structural)
15 Spring Data JPA interfaces (`IncidentRepository`, `TechnicianRepository`, etc.) abstract all database operations behind clean object-oriented APIs.

#### 5. Builder Pattern (Creational)
Lombok's `@Builder` annotation is used across entities and DTOs to enforce safe, readable, and immutable object construction.

### 5.3 UML Diagrams
- <li><strong>Figure 5.1:</strong> Use Case Diagram (`docs/project-report/diagrams/use_case_diagram.svg`)</li>
- <li><strong>Figure 5.2:</strong> Comprehensive Class Diagram (`docs/project-report/diagrams/class_diagram.svg`)</li>

---

<div style="page-break-after: always;"></div>

# CHAPTER 6 — DATABASE DESIGN

### 6.1 Database Schema Overview
The persistent schema is implemented in PostgreSQL 18.7 with **15 relational tables**:

| Table Name | Primary Key | Description |
| :--- | :--- | :--- |
| `users` | `id` (BIGINT) | User credentials, roles, emails, and profile status. |
| `technicians` | `id` (BIGINT) | Technician records linked to `users`, holding workload limits and active counts. |
| `technician_skills`| Composite | Many-to-many relationship mapping technicians to domain skill tags. |
| `categories` | `id` (BIGINT) | IT categories (Hardware, Software, Network, Database, Security, etc.). |
| `it_services` | `id` (BIGINT) | Catalog of IT services mapped to categories. |
| `incidents` | `id` (BIGINT) | Core incident tickets, priority, status, reporter, and assigned technician. |
| `incident_notes` | `id` (BIGINT) | Chronological work notes and public discussion comments. |
| `incident_sla_records`| `id` (BIGINT) | SLA target deadlines, response times, and compliance status. |
| `assignment_history`| `id` (BIGINT) | Historical records of technician assignments and strategy used. |
| `sla_policies` | `id` (BIGINT) | Policy definitions configuring response and resolution deadlines per priority. |
| `feedback` | `id` (BIGINT) | Post-resolution user feedback ratings and comments. |
| `audit_logs` | `id` (BIGINT) | Immutable audit trail capturing actors, actions, and state transitions. |
| `email_logs` | `id` (BIGINT) | Simulated outbound email delivery audit log. |
| `notifications` | `id` (BIGINT) | Persistent in-app user notifications. |
| `system_config` | `id` (BIGINT) | Global configuration storing active assignment strategy. |

Please inspect Figure 6.1 (`docs/project-report/diagrams/er_diagram.svg`) for the complete Crow's Foot ER diagram depicting entities, attributes, primary keys, foreign keys, and cardinalities.

---

<div style="page-break-after: always;"></div>

# CHAPTER 7 — DETAILED MODULE IMPLEMENTATION

### 7.1 Priority Engine
Priority is calculated deterministically using three standard dimensions rated from 1 to 3:

$$\text{Priority Score} = \text{Impact} \times \text{Urgency} \times \text{Business Criticality}$$

| Score Range | Priority Tier | SLA Response | SLA Resolution |
| :---: | :---: | :---: | :---: |
| **18 – 27** | **P1 — Critical** | 5 minutes | 30 minutes |
| **12 – 17** | **P2 — High** | 15 minutes | 2 hours |
| **6 – 11** | **P3 — Medium** | 1 hour | 8 hours |
| **1 – 5** | **P4 — Low** | 4 hours | 24 hours |

**Worked Example:** An outage in the corporate Payment Gateway with High Impact (3), High Urgency (3), and High Criticality (2) yields:
$$\text{Score} = 3 \times 3 \times 2 = 18 \implies \mathbf{P1\text{ — }Critical}$$

### 7.2 Technician Assignment Strategies
1. **Skill-Based Assignment (`SkillBasedAssignmentStrategy`):**
   - Extracts keywords from incident category, service, and title.
   - Computes matching skill score for each technician.
   - Selects the technician with the highest match score, breaking ties by lowest active workload.
2. **Least-Loaded Assignment (`LeastLoadedAssignmentStrategy`):**
   - Queries active unresolved tickets (`ASSIGNED`, `ACKNOWLEDGED`, `IN_PROGRESS`) across all available technicians.
   - Assigns the ticket to the technician with the smallest queue depth.

### 7.3 SLA Monitoring & Automated Escalation
- **Scheduler:** An `@Scheduled(fixedDelay = 60000)` background task runs every 60 seconds.
- **Warning Threshold:** When $\le 20\%$ of the allowed resolution window remains, status changes to `APPROACHING` and a warning notification is sent.
- **Breach Escalation:** When the deadline passes without resolution, status updates to `BREACHED` and `IncidentEscalationService` elevates priority ($P4 \to P3 \to P2 \to P1$) and reassigns to a higher-tier technician.

### 7.4 Intelligent Assistance Features
1. **Category Suggestions (`CategorySuggestionService`):** Lexicon-based keyword scanning suggesting categories from incident titles and descriptions.
2. **Duplicate Incident Detection (`DuplicateDetectionService`):** Computes tokenized Jaccard similarity across active incidents in the last 48 hours to alert users of existing issues.
3. **Predictive SLA Risk Scoring (`SlaPredictionService`):** Estimates breach probability $(0.0 - 1.0)$ using elapsed time, priority weight, and stage inertia.
4. **Root-Cause Analysis (`RootCauseAnalysisService`):** Matches incident logs against diagnostic error taxonomies (Network, Database, Security, Hardware, Software).
5. **Gemini AI Playbook & Chatbot (`GeminiResolutionService`, `GeminiChatbotService`):** Generates structured troubleshooting steps for technicians and conversational assistance for users, with deterministic fallbacks when offline.

---

<div style="page-break-after: always;"></div>

# CHAPTER 8 — SECURITY AND EXCEPTION HANDLING

### 8.1 Security & Authentication
- **Password Security:** BCrypt hashing (`strength = 10`) for all stored user passwords.
- **JWT Authorization:** Stateless Bearer tokens containing user ID, username, and role, verified on every request by `JwtAuthFilter`.
- **CORS Defense:** Dynamic origin pattern matching supporting secure cross-origin communication between the Vite frontend and Spring backend.

### 8.2 Exception Handling
A centralized `@RestControllerAdvice` (`GlobalExceptionHandler`) intercepts domain exceptions and returns structured, user-friendly JSON error payloads:

| Exception Class | HTTP Status | Trigger Condition |
| :--- | :---: | :--- |
| `InvalidStateTransitionException` | 400 Bad Request | Attempting an illegal FSM transition. |
| `ResourceNotFoundException` | 404 Not Found | Incident, user, or category ID does not exist. |
| `DuplicateIncidentException` | 409 Conflict | Suspected duplicate incident detected upon creation. |
| `UnauthorizedException` | 403 Forbidden | User attempts action outside their assigned role. |
| `MissingSlaConfigurationException` | 422 Unprocessable | No SLA policy exists matching priority level. |

---

<div style="page-break-after: always;"></div>

# CHAPTER 9 — TESTING AND VALIDATION

### 9.1 Test Suite Overview
The backend test suite contains **27 automated tests** executed via JUnit 5 and Mockito with a **100% pass rate (0 failures, 0 errors, 0 skipped)**.

| Test Class | Tests | Result | Verified Capability |
| :--- | :---: | :---: | :--- |
| `PriorityEngineTest` | 4 | **PASS** | Accurate mathematical scoring across all 4 tiers (P1 to P4). |
| `AssignmentStrategyTest` | 2 | **PASS** | Skill-based keyword matching & least-loaded queue balancing. |
| `IncidentLifecycleTest` | 2 | **PASS** | Valid sequential transitions & rejection of illegal state jumps. |
| `SlaManagementTest` | 2 | **PASS** | Deadline calculation & approaching/breached status detection. |
| `SlaPredictionTest` | 2 | **PASS** | Quantitative risk scoring for approaching deadline risks. |
| `DuplicateDetectionTest` | 2 | **PASS** | Jaccard token similarity scoring and duplicate ticket warnings. |
| `CategorySuggestionTest` | 2 | **PASS** | Automatic category detection from title and description keywords. |
| `RootCauseAnalysisTest` | 2 | **PASS** | Heuristic diagnostic analysis across failure domains. |
| `GeminiAiFeaturesTest` | 3 | **PASS** | AI playbook generation and conversational ticket drafting. |
| `IncidentEscalationTest` | 1 | **PASS** | Automated priority escalation and specialist reassignment. |
| `ItsmEndToEndWorkflowsTest` | 4 | **PASS** | Complete multi-role incident lifecycles end-to-end. |
| `ItsmBackendApplicationTests` | 1 | **PASS** | Spring WebApplicationContext bootstrap. |

---

<div style="page-break-after: always;"></div>

# CHAPTER 10 — RESULTS AND APPLICATION SCREENSHOTS

### 10.1 Application Screenshots

![Figure 10.1: Operations Health Console on Localhost Environment (36 Incidents, Trends)](screenshots/admin_operations_dashboard_localhost.jpg)
![Figure 10.2: Live Production Operations Console Deployed on Cloud Infrastructure](screenshots/admin_operations_dashboard_render.jpg)
![Figure 10.3: High-Resolution Brand Identity and Monotonic 3-Gear System Logo](screenshots/itsm_brand_logo.png)
![Figure 10.4: Stateless Spring Security JWT Authentication Endpoint Protection](screenshots/api_security_auth_endpoint.png)
![Figure 10.5: Incident Detail Drawer with Investigation Actions, RCA, and AI Playbook](screenshots/incident_drawer_actions.png)
![Figure 10.6: Real-time Incident Lifecycle Status and Technician Assignment Card](screenshots/incident_assignment_status_card.png)
![Figure 10.7: Render Blueprint Cloud Deployment and Infrastructure as Code Pipeline](screenshots/render_cloud_blueprint_deploy.png)

### 10.2 Three End-to-End Demonstration Workflows
The application supports three complete demonstration workflows:
1. **Workflow 1: Standard Employee Incident Creation & Self-Service Tracking:** Employee logs in, reports an incident, observes automatic priority and SLA assignment, adds comments, and monitors progress.
2. **Workflow 2: Technician Workload Queue, Investigation, & Resolution:** Technician logs in, accepts assigned incident (`ACKNOWLEDGED`), starts troubleshooting (`IN_PROGRESS`), inspects RCA/AI playbook, logs investigation notes, and submits resolution details (`RESOLVED`).
3. **Workflow 3: Administrative Strategy Switching, SLA Breach Escalation & Closure:** Administrator switches assignment strategy from Skill-Based to Least-Loaded, views SLA breach warnings, triggers escalation, reviews audit trail, and marks the incident as `CLOSED`.

---

<div style="page-break-after: always;"></div>

# CHAPTER 11 — CHALLENGES, LIMITATIONS AND FUTURE SCOPE

### 11.1 Challenges Encountered
- **Asynchronous Event Timing:** Ensuring event listeners do not fail if the parent database transaction rolls back (solved using proper transaction boundary design).
- **CORS in Multi-Cloud Hosting:** Managing cross-origin cookie and credential headers across separate frontend and backend domains on Render (solved via `setAllowedOriginPatterns`).

### 11.2 Limitations & Future Enhancements
- **Email Delivery:** Currently records simulated outbound emails in `email_logs`; future scope includes live SMTP/SendGrid integration.
- **Machine Learning Integration:** Priority and suggestions currently use deterministic rule engines; future work can train ML models on historical resolution datasets.

---

<div style="page-break-after: always;"></div>

# CHAPTER 12 — CONCLUSION

The Intelligent IT Service Management & Incident Resolution System (I-ITSM) successfully demonstrates the practical application of Object-Oriented Programming (OOP) and modern enterprise architecture to solve real-world IT service management challenges.

Through its modular design, the system showcases:
- **Clean OO Architecture:** Effective use of Encapsulation, Abstraction, Polymorphism, and Inheritance.
- **GoF Design Patterns:** Practical implementation of the Strategy, Observer, State (FSM), Repository, and Builder patterns.
- **Enterprise Features:** Strict lifecycle validation, deterministic priority scoring, multi-strategy technician routing, proactive SLA tracking, and intelligent diagnostic heuristics.
- **Production Readiness:** 27 automated tests passing, containerized Docker deployment, and live cloud hosting with persistent PostgreSQL storage.

---

<div style="page-break-after: always;"></div>

# REFERENCES

1. Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley.
2. Martin, R. C. (2002). *Agile Software Development, Principles, Patterns, and Practices*. Prentice Hall.
3. Walls, C. (2022). *Spring in Action* (6th ed.). Manning Publications.
4. ITIL Foundation: *ITIL 4 Edition* (2019). AXELOS Global Best Practice. TSO (The Stationery Office).
5. PostgreSQL Global Development Group. (2024). *PostgreSQL 16/17/18 Documentation*. https://www.postgresql.org/docs/
6. Meta Open Source. (2024). *React Documentation*. https://react.dev/

---

<div style="page-break-after: always;"></div>

# APPENDICES

### Appendix A: Live Deployment and Repository Links
- **GitHub Repository:** [https://github.com/funCode9/i-itsm.git](https://github.com/funCode9/i-itsm.git)
- **Live Frontend Application:** [https://i-itsm-frontend.onrender.com](https://i-itsm-frontend.onrender.com)
- **Live Backend API Health:** [https://i-itsm-backend.onrender.com/api/auth/health](https://i-itsm-backend.onrender.com/api/auth/health)

### Appendix B: Core REST API Endpoints

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user and issue JWT token. |
| `POST` | `/api/auth/register` | Public | Register new employee account. |
| `GET` | `/api/auth/health` | Public | Health probe returning service status. |
| `GET` | `/api/incidents` | Authenticated | Retrieve incidents filtered by user role and criteria. |
| `POST` | `/api/incidents` | Authenticated | Create a new incident ticket. |
| `GET` | `/api/incidents/{id}` | Authenticated | Retrieve detailed incident information. |
| `PATCH` | `/api/incidents/{id}/status` | Tech / Admin | Transition incident lifecycle state. |
| `POST` | `/api/incidents/{id}/notes` | Authenticated | Append work note or public comment. |
| `POST` | `/api/incidents/{id}/reassign` | Admin | Manually reassign incident to a technician. |
| `POST` | `/api/admin/strategy/switch` | Admin | Dynamically switch technician assignment strategy. |
| `GET` | `/api/admin/audit-logs` | Admin | Retrieve immutable system audit history. |
"""

with open(md_path, "w", encoding="utf-8") as f:
    f.write(simplified_report)

print(f"Successfully wrote simplified report to {md_path}")
