# Intelligent IT Service Management & Incident Resolution System (I-ITSM)

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg)](https://adoptium.net/)
[![Spring Boot 4.1.2](https://img.shields.io/badge/Spring%20Boot-4.1.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![PostgreSQL 18.7](https://img.shields.io/badge/PostgreSQL-18.7-blue.svg)](https://www.postgresql.org/)
[![Vite 6](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-27%20Passed-brightgreen.svg)](docs/project-report/report_verification.md)
[![Live Frontend](https://img.shields.io/badge/Live%20Demo-Render-success.svg)](https://i-itsm-frontend.onrender.com)

**I-ITSM** is a full-stack IT Service Management (ITSM) and incident-resolution application developed for the university course **CS F213 / MAC F212 (Object-Oriented Programming)**. It demonstrates enterprise software engineering concepts including role-based workflows, rule-based incident prioritization, configurable technician assignment strategies (Strategy pattern), a controlled incident lifecycle (Finite State Machine), SLA tracking, asynchronous event-driven notifications and auditing (Observer pattern), and intelligent assistance features.

> **Academic Context:** An academic implementation demonstrating clean Object-Oriented Analysis and Design (OOAD), Gang of Four (GoF) design patterns, and full-stack integration across modern React and Spring Boot architectures.

---

## 🌐 Live Cloud Deployment

The application is deployed and accessible on the cloud:

| Component | Platform / Host | Live URL |
| :--- | :--- | :--- |
| **Frontend Web App** | Render (Static Site) | [https://i-itsm-frontend.onrender.com](https://i-itsm-frontend.onrender.com) |
| **Backend REST API** | Render (Docker Service) | [https://i-itsm-backend.onrender.com](https://i-itsm-backend.onrender.com) |
| **Cloud Database** | Neon Serverless PostgreSQL | AWS Singapore (`ap-southeast-1`) — 15 relational tables |

---

## 🚀 Key Features

### 1. Role-Based Access Control (RBAC)

The application enforces role-based authorization using stateless JSON Web Tokens (JJWT 0.12.6) and Spring Security:

| Role | Main Capabilities |
| :--- | :--- |
| **Employee / Customer** | Report and track incidents, add comments, view SLA information, rate resolution feedback, and verify or dispute resolved tickets. |
| **Technician / Support Engineer** | View assigned incident queue, update status lifecycle, add investigation/resolution notes, consult AI assistance, and monitor workload. |
| **Administrator / IT Manager** | Manage user accounts and technician rosters, configure IT services, categories, and SLA policies, dynamically switch assignment strategies, inspect audit logs, and view real-time operations dashboards. |

### 2. Rule-Based Priority Engine

Incident priority is computed deterministically using three standard ITSM dimensions, each rated from **1 to 3**:

$$\text{Priority Score} = \text{Impact} \times \text{Urgency} \times \text{Business Criticality}$$

| Score Range | Priority Tier | Operational Severity |
| :---: | :---: | :--- |
| **18 – 27** | **P1 — Critical** | Catastrophic business outage; requires immediate dispatch and executive escalation. |
| **12 – 17** | **P2 — High** | Major department disruption without workarounds. |
| **6 – 11** | **P3 — Medium** | Moderate non-critical operational impairment. |
| **1 – 5** | **P4 — Low** | Minor request, inquiry, or cosmetic defect. |

*Note: The scoring engine is deterministic and rule-based; it does not rely on an opaque machine learning model.*

### 3. Technician Assignment — Strategy Pattern

The assignment engine implements the **GoF Strategy Pattern** via a common `AssignmentStrategy` interface, managed by `AssignmentStrategyContext`:

- **Skill-Based Assignment (`SkillBasedAssignmentStrategy`):** Matches incident categories, services, and title keywords against technician skill sets, tie-breaking by lowest active workload.
- **Least-Loaded Assignment (`LeastLoadedAssignmentStrategy`):** Computes active unresolved tickets (`ASSIGNED`, `ACKNOWLEDGED`, `IN_PROGRESS`) across all technicians and routes tickets to balance workloads.

Administrators can switch the active assignment strategy at runtime through the Operations Console without restarting the backend.

### 4. Incident Lifecycle — Finite State Machine

Incident progression is governed by an explicit Finite State Machine with strict transition validation in `IncidentService` (illegal transitions throw `InvalidStateTransitionException`):

```text
NEW ➔ CLASSIFIED ➔ ASSIGNED ➔ ACKNOWLEDGED ➔ IN_PROGRESS ➔ RESOLVED ➔ VERIFIED ➔ CLOSED
                                                                 │
                                                                 └── (Reopened / Dispute) ➔ IN_PROGRESS
```

| Current State | Permitted Next States | Trigger Action |
| :--- | :--- | :--- |
| `NEW` | `CLASSIFIED` | Categorization and priority assignment |
| `CLASSIFIED` | `ASSIGNED` | Automatic strategy dispatch or manual technician assignment |
| `ASSIGNED` | `ACKNOWLEDGED` | Technician accepts ticket |
| `ACKNOWLEDGED` | `IN_PROGRESS` | Technician initiates investigation and troubleshooting |
| `IN_PROGRESS` | `RESOLVED` | Technician submits resolution notes and root-cause analysis |
| `RESOLVED` | `VERIFIED` | Employee validates the fix |
| `RESOLVED` | `IN_PROGRESS` | Employee disputes resolution / reopens ticket |
| `RESOLVED` | `CLOSED` | Direct administrative sign-off |
| `VERIFIED` | `CLOSED` | Final closure |
| `CLOSED` | *(None — Terminal)* | Terminal archival state |

### 5. Service Level Agreement (SLA) Tracking

Default SLA policies configured in the system:

| Priority | Response Target | Resolution Target | Escalation Grace Period |
| :---: | :---: | :---: | :---: |
| **P1 — Critical** | 5 minutes | 30 minutes | +15 minutes |
| **P2 — High** | 15 minutes | 2 hours | +30 minutes |
| **P3 — Medium** | 1 hour | 8 hours | +2 hours |
| **P4 — Low** | 4 hours | 24 hours | +4 hours |

- **Automated Background Scanner:** An `@Scheduled(fixedDelay = 60000)` background service evaluates deadlines every 60 seconds.
- **Warning Threshold:** Triggers an `APPROACHING` warning when **$\le 20\%$ of the allowed time window remains** (i.e. $> 80\%$ elapsed).
- **Automated Escalation:** Breached tickets are automatically escalated (`P4 ➔ P3 ➔ P2 ➔ P1`) and reassigned to higher-tier specialists via `IncidentEscalationService`.

### 6. Domain Events, Auditing & Notifications — Observer Pattern

The backend leverages Spring's `ApplicationEventPublisher` to publish domain events:
- `IncidentCreatedEvent`
- `IncidentStatusChangedEvent`
- `IncidentAssignedEvent`

Events are handled by asynchronous event listeners (`@Async` enabled via `AsyncConfig.java`):
- **`AuditEventListener`:** Writes immutable audit entries recording actor, action, previous state, new state, and timestamp.
- **`NotificationEventListener`:** Dispatches in-app notifications and records simulated email audit records in `email_logs`.

### 7. Intelligent Assistance Features

1. **Automatic Category Suggestions (`CategorySuggestionService`):** Scans title and description text against categorized keyword lexicons to suggest appropriate categories.
2. **Duplicate Incident Detection (`DuplicateDetectionService`):** Uses weighted Jaccard token similarity over active incidents in the last 48 hours to alert users of existing tickets before submission.
3. **Predictive SLA Risk Scoring (`SlaPredictionService`):** Calculates quantitative risk scores $(0.0 - 1.0)$ evaluating elapsed duration, priority weight, and stage inertia.
4. **Automated Root-Cause Analysis (`RootCauseAnalysisService`):** Matches incident logs against diagnostic error taxonomies (Network, Database, Security, Hardware, Software).
5. **Gemini AI Playbook & Chatbot (`GeminiResolutionService`, `GeminiChatbotService`):** Generates structured troubleshooting steps for technicians and assists employees in ticket drafting, with deterministic fallback when API keys are absent.

---

## 🏛️ OOP Concepts Demonstrated

| Concept | Implementation in I-ITSM |
| :--- | :--- |
| **Encapsulation** | Strict private fields with Lombok getters/setters; business logic encapsulated within domain services (`IncidentService`, `PriorityEngine`). |
| **Abstraction** | Strategy interface (`AssignmentStrategy`) hides complex assignment algorithms behind a clean `assignTechnician(Incident)` contract. |
| **Polymorphism** | Runtime polymorphic substitution of assignment algorithms (`SkillBasedAssignmentStrategy` vs `LeastLoadedAssignmentStrategy`) via `AssignmentStrategyContext`. |
| **Inheritance & Hierarchy** | Base security exceptions extending runtime exceptions; standard JPA entity mappings. |
| **Strategy Pattern** | Pluggable technician routing strategies switchable dynamically by administrators. |
| **Observer Pattern** | Asynchronous decoupled event bus (`IncidentCreatedEvent`, `AuditEventListener`, `NotificationEventListener`). |
| **Finite State Machine** | Strict state transition table guarding against illegal incident lifecycle jumps. |
| **Repository Pattern** | 15 Spring Data JPA interfaces encapsulating persistent queries. |
| **Builder Pattern** | Lombok `@Builder` applied across domain entities and DTOs for safe, immutable object instantiation. |
| **Exception Handling** | Global exception advice (`GlobalExceptionHandler`) handling domain exceptions (`InvalidStateTransitionException`, `DuplicateIncidentException`, `ResourceNotFoundException`). |

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18.3, Vite 6.2, Material-UI (MUI) v6.4, Axios, React Router v7, Recharts |
| **Backend** | Java 21 LTS, Spring Boot 4.1.2, Spring Data JPA, Spring Security 6.x, Hibernate ORM 7.4, JJWT 0.12.6, Lombok |
| **Database** | PostgreSQL 18.7 (Local `itsm_db` / Cloud Neon Serverless Postgres) |
| **Container & CI/CD** | Multi-stage Docker (`eclipse-temurin:21-jre-alpine`), Render Blueprint (`render.yaml`) |
| **Build Tools** | Apache Maven 3.10.0 (via `mvnw`), npm 11 |

---

## 📦 Getting Started (Local Setup)

### Prerequisites
- **JDK 21** installed and added to `PATH`
- **PostgreSQL 18.x** running locally (default port `5432`)
- **Node.js 20+** and **npm 10+**

### 1. Database Setup
Create a PostgreSQL database and user:
```sql
CREATE USER itsm_user WITH PASSWORD 'your_password';
CREATE DATABASE itsm_db OWNER itsm_user;
```

### 2. Configure Backend Environment
Set the database password in your terminal:
```powershell
$env:DB_PASSWORD = "your_password"
```

### 3. Launch Backend
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
The backend initializes database tables via Hibernate, seeds initial users, categories, services, and SLA policies automatically, and starts on **http://localhost:8080**.

### 4. Launch Frontend
In a separate terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 👥 Demo Accounts (Local & Cloud)

| Username | Password | Role | Description / Specialization |
| :--- | :--- | :--- | :--- |
| `admin` | `Admin@123` | **ADMINISTRATOR** | System Administrator / IT Manager |
| `tech.network` | `Tech@123` | **TECHNICIAN** | Network & Infrastructure Specialist |
| `tech.hardware` | `Tech@123` | **TECHNICIAN** | Hardware & Systems Specialist |
| `tech.software` | `Tech@123` | **TECHNICIAN** | Software Applications Specialist |
| `tech.security` | `Tech@123` | **TECHNICIAN** | Cybersecurity Specialist |
| *Self-Registration* | *User-defined* | **EMPLOYEE** | Regular Employee / Incident Reporter |

---

## 🧪 Testing and Verification

Run the full automated test suite:
```powershell
cd backend
.\mvnw.cmd test
```

### Verified Test Suite Breakdown (27 Tests — 100% Pass):
| Test Class | Tests | Result | Verified Behaviors |
| :--- | :---: | :---: | :--- |
| `PriorityEngineTest` | 4 | **PASS** | Mathematical scoring across all tiers (P1, P2, P3, P4). |
| `AssignmentStrategyTest` | 2 | **PASS** | Skill-based matching & least-loaded workload routing. |
| `IncidentLifecycleTest` | 2 | **PASS** | All valid FSM transitions & rejection of illegal jumps. |
| `SlaManagementTest` | 2 | **PASS** | Deadline calculation & warning/breach detection. |
| `SlaPredictionTest` | 2 | **PASS** | Risk index scoring for approaching deadline risks. |
| `DuplicateDetectionTest` | 2 | **PASS** | Jaccard token similarity scoring and duplicate flagging. |
| `CategorySuggestionTest` | 2 | **PASS** | Keyword-based automatic categorization. |
| `RootCauseAnalysisTest` | 2 | **PASS** | Heuristic diagnostic analysis across failure domains. |
| `GeminiAiFeaturesTest` | 3 | **PASS** | AI playbook generation and conversational ticket drafting. |
| `IncidentEscalationTest` | 1 | **PASS** | Automated priority escalation and specialist reassignment. |
| `ItsmEndToEndWorkflowsTest` | 4 | **PASS** | Complete multi-role incident lifecycles end-to-end. |
| `ItsmBackendApplicationTests` | 1 | **PASS** | Spring WebApplicationContext bootstrap. |

---

## 📑 Academic Documentation & Evaluation Artifacts

Comprehensive documentation suitable for university evaluation has been generated in [`docs/project-report/`](docs/project-report/):

- **[Final Academic Project Report (PDF)](docs/project-report/I_ITSM_Project_Report.pdf)** — 30-page formal academic report with cover page, abstract, 12 core chapters, vector architecture diagrams, and application screenshots.
- **[Full Markdown Report Source](docs/project-report/I_ITSM_Project_Report.md)** — Complete editable project report source.
- **[Requirements Compliance Matrix](docs/project-report/requirements_compliance.md)** — Mapping of all 22 faculty requirements (Criteria A1–M) against actual classes and methods.
- **[Report Verification & Evidence Audit](docs/project-report/report_verification.md)** — Audit trail of test execution, database verification (15 tables), and cloud health checks.
- **[Demonstration Workflows Script](docs/project-report/demo_workflows.md)** — Step-by-step 15–20 minute presentation script detailing three end-to-end demonstration workflows with speaker cues.
- **Architecture Diagrams:**
  - [System Architecture Diagram (SVG)](docs/project-report/diagrams/system_architecture.svg)
  - [Use Case Diagram (SVG)](docs/project-report/diagrams/use_case_diagram.svg)
  - [Core Domain Class Diagram (SVG)](docs/project-report/diagrams/class_diagram.svg)
  - [Relational Database ER Diagram (SVG)](docs/project-report/diagrams/er_diagram.svg)
  - [Incident Lifecycle Sequence Diagram (SVG)](docs/project-report/diagrams/sequence_diagram.svg)

Additional technical references:
- [Project Architecture & OOP Design](PROJECT_ARCHITECTURE.md)
- [System Requirements Specification](REQUIREMENTS.md)
- [Technology Selection Justification](TECHNOLOGY_SELECTION.md)
- [Relational Database Design & Schema](DATABASE_DESIGN.md)
- [Production Deployment Guide](DEPLOYMENT.md)
