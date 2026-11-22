# Intelligent IT Service Management & Incident Resolution System (I-ITSM)

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18.x-blue.svg)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-19%20Passed-brightgreen.svg)](TESTING_REPORT.md)
[![Live Frontend](https://img.shields.io/badge/Live%20Demo-Render-success.svg)](https://i-itsm-frontend.onrender.com)

**I-ITSM** is an enterprise-grade IT Service Management and incident-resolution web application developed for **CS F213 / MAC F212 (Object-Oriented Programming)** at **BITS Pilani**. It provides a structured, ticket-based platform for employees to report IT problems, technicians to investigate and resolve issues, and administrators to configure services, assignments, and policies.

The system demonstrates practical object-oriented design principles—including abstraction, encapsulation, inheritance, polymorphism, the **Strategy Pattern**, the **Observer Pattern**, and a controlled **Finite State Machine (FSM)** incident lifecycle.

---

## 👥 Academic Project Team

* **Course:** CS F213 / MAC F212 — Object Oriented Programming
* **Department:** Department of Computer Science & Information Systems, BITS Pilani
* **Group Number:** 36
* **Faculty:** Prof. Subhrakanta Panda
* **Submission Date:** 22/11/2026

| Team Member | Student ID | Email |
|:---|:---:|:---|
| **Abhishek Gupta** | 2025A7PS0030H | f20250030@hyderabad.bits-pilani.ac.in |
| **Naman Ladha** | 2025A7PS0036H | f20250036@hyderabad.bits-pilani.ac.in |
| **Aaditya Pratap Singh** | 2025ADPS0223H | f20250223@hyderabad.bits-pilani.ac.in |
| **Siddhant Agarwal** | 2025ADPS0123H | f20250123@hyderabad.bits-pilani.ac.in |

* **Repository:** [https://github.com/funCode9/i-itsm](https://github.com/funCode9/i-itsm)
* **Frontend Application:** [https://i-itsm-frontend.onrender.com/login](https://i-itsm-frontend.onrender.com/login)
* **Backend Health Check:** [https://i-itsm-backend.onrender.com/api/auth/health](https://i-itsm-backend.onrender.com/api/auth/health)

---

## 🌐 Live Cloud Deployment

| Component | Platform / Host | Live URL |
|:---|:---|:---|
| **Frontend Web App** | Render (Static Site) | [https://i-itsm-frontend.onrender.com](https://i-itsm-frontend.onrender.com) |
| **Backend REST API** | Render (Docker Web Service) | [https://i-itsm-backend.onrender.com](https://i-itsm-backend.onrender.com) |
| **Cloud Database** | Neon Serverless PostgreSQL | AWS Singapore (`ap-southeast-1`) — 15 relational tables |

---

## 🏛️ System Architecture

The application is structured into a four-tier layered architecture enforcing clear separation of concerns:

```text
+---------------------------------------------------------------+
|         PRESENTATION LAYER | React 18 + Vite + MUI            |
|       Employee  *  Technician  *  Administrator screens       |
+---------------------------------------------------------------+
                               |  HTTPS / JSON + JWT Bearer
+---------------------------------------------------------------+
|     SECURITY & REST API LAYER | Spring Boot Controllers       |
|          JwtAuthFilter / Role-Based Authorization             |
+---------------------------------------------------------------+
                               |  Validated Requests
+---------------------------------------------------------------+
|     BUSINESS LOGIC LAYER | Modular Java Service Classes       |
|    Incident Lifecycle FSM  *  PriorityEngine  *  SLA Monitor   |
|   AssignmentStrategyContext (Strategy) * EventPublisher (Obs) |
+---------------------------------------------------------------+
                               |  SQL / Spring Data JPA
+---------------------------------------------------------------+
|      PERSISTENCE LAYER | 15 Relational Tables on PostgreSQL   |
|     Users * Incidents * Technicians * SLA * Audit * Notes     |
+---------------------------------------------------------------+
```

---

## 👥 Stakeholders & Role Responsibilities

| Role | Main Responsibilities |
|:---|:---|
| **Employee / Reporter** | Create tickets, track own issues, add comments, verify solutions, and submit resolution feedback. |
| **Technician / Support Engineer** | View assigned work queue, acknowledge tickets, investigate root causes, add notes, and mark incidents resolved. |
| **Administrator / IT Manager** | Manage users, categories, services, and SLA policies; switch assignment strategies at runtime; view operational audit logs and analytics. |

---

## 📋 Functional Requirements & Business Rules

### Functional Requirements Matrix
| ID | Functional Requirement |
|:---:|:---|
| **FR-01** | Register/login and issue a valid JWT for authenticated users. |
| **FR-02** | Enforce Employee, Technician, and Administrator permissions. |
| **FR-03** | Create an incident and track its reporter, service, category, and status. |
| **FR-04** | Compute $\text{Impact} \times \text{Urgency} \times \text{Criticality}$ and map score to P1–P4 tiers. |
| **FR-05** | Validate status changes using strict Finite State Machine incident lifecycle rules. |
| **FR-06** | Assign a technician using the configured runtime `AssignmentStrategy` implementation. |
| **FR-07** | Apply response/resolution SLA deadlines and record violation breaches. |
| **FR-08** | Allow work notes, user comments, and customer satisfaction feedback ratings. |
| **FR-09** | Generate in-app notifications and record immutable incident audit trail history. |
| **FR-10** | Support administrator settings, operational reports, and multi-criteria incident filtering. |
| **FR-11** | Offer rule-based category suggestions and duplicate warnings. |

### Business Rules (BR)
| Rule | Definition |
|:---:|:---|
| **BR-01** | Priority score = $\text{Impact} \times \text{Urgency} \times \text{Criticality}$; each factor is calibrated between 1 and 3. |
| **BR-02** | Score 18–27: `P1_CRITICAL`; 12–17: `P2_HIGH`; 6–11: `P3_MEDIUM`; 1–5: `P4_LOW`. |
| **BR-03** | Status changes follow the strict FSM; invalid status jumps throw `InvalidStateTransitionException`. |
| **BR-04** | A configured assignment strategy (`SkillBasedAssignmentStrategy` or `LeastLoadedAssignmentStrategy`) selects among available technicians. |
| **BR-05** | SLA targets depend on priority and are monitored against deadlines every 60 seconds. Warnings trigger at $\le 20\%$ time remaining. |
| **BR-06** | Employees access only their own tickets; administrative endpoints require the `ADMINISTRATOR` role. |
| **BR-07** | A `RESOLVED` incident may be reopened to `IN_PROGRESS` if verification fails, or closed after customer sign-off. |

---

## 🧩 Object-Oriented Design & Design Patterns

| OOP Requirement | Implementation in I-ITSM |
|:---|:---|
| **Encapsulation** | `Incident`, `User`, `Technician`, and `SlaPolicy` keep fields private with controlled accessors. Services manage state modifications. |
| **Abstraction** | `AssignmentStrategy` interface hides technician-selection logic. `IncidentService` exposes high-level business operations. |
| **Inheritance** | `JwtAuthFilter` extends Spring Security's `OncePerRequestFilter`. Custom exceptions specialize Java `RuntimeException`. |
| **Polymorphism** | `AssignmentStrategyContext` calls `assignTechnician()` polymorphically on either `SkillBasedAssignmentStrategy` or `LeastLoadedAssignmentStrategy`. |
| **Interfaces** | `AssignmentStrategy` declares common contract. Spring Data JPA repository interfaces define standard data access operations. |
| **Composition** | `Technician` owns `TechnicianSkill` records with cascade and orphan removal. `Incident` owns notes and SLA records. |
| **Association** | `Incident` associates independent `User` (reporter) and `Technician` (assignee) entities. |
| **Aggregation** | `Incident` references shared catalog entities (`Category`, `ItService`) that survive incident deletion. |
| **Exception Handling** | `InvalidStateTransitionException` rejects illegal lifecycle changes. `GlobalExceptionHandler` converts exceptions to HTTP responses. |
| **Data Structures** | `Set<String>` for unique keyword tokens; `Map<IncidentStatus, Set<IncidentStatus>>` for FSM transition tables; `Optional<Technician>` for null-safe returns. |

### GoF Design Patterns
1. **Strategy Pattern (`AssignmentStrategy`):** Decouples technician allocation algorithms (`SkillBasedAssignmentStrategy` vs `LeastLoadedAssignmentStrategy`). Can be switched dynamically at runtime by administrators without restarting the application.
2. **Observer Pattern (`ApplicationEventPublisher`):** Publishes decoupled domain events (`IncidentCreatedEvent`, `IncidentAssignedEvent`, `IncidentStatusChangedEvent`). Listeners (`NotificationEventListener`, `AuditEventListener`) record in-app alerts, email logs, and immutable audit logs independently.

---

## 🗄️ Relational Database Design (15 Tables)

The database schema is organized into 6 logical functional groups:

| Group | Tables | Purpose |
|:---|:---|:---|
| **Users and Staff** | `users`, `technicians`, `technician_skills` | Identity, authentication, role boundaries, and technical skills. |
| **Service Catalog** | `categories`, `it_services` | Service classification and affected catalog infrastructure. |
| **Incident Workflow** | `incidents`, `incident_notes`, `assignment_history` | Ticket content, lifecycle state, notes, and assignment trail. |
| **SLA Management** | `sla_policies`, `incident_sla_records` | Response/resolution targets, deadlines, and breach compliance. |
| **Tracking & Comms** | `audit_logs`, `notifications`, `email_logs` | Immutable audit trail, in-app dispatch alerts, and simulated email logs. |
| **Other** | `feedback`, `system_config` | Customer satisfaction ratings (1–5 stars) and active runtime strategy. |

---

## 🧪 Testing (19 Documented Cases — 100% Pass)

### Test Execution Summary
* **Test Framework:** JUnit 5 (Jupiter), Spring Boot Test, Spring Security Test, Mockito
* **Documented Result:** **19 / 19 PASS, 0 failures, 0 skipped (100% Success Rate)**
* **Execution Command:** `cd backend && .\mvnw.cmd test`

### Documented Test-Case Matrix (TC-01 through TC-19)

| ID | Type | Input / Scenario | Expected Result | Status |
|:---:|:---:|:---|:---|:---:|
| **TC-01** | Boundary / rule | Priority: $3 \times 3 \times 3 = 27$ or $3 \times 2 \times 3 = 18$ | `P1_CRITICAL` | **PASS** |
| **TC-02** | Business rule | Priority score 12 and 16 | `P2_HIGH` | **PASS** |
| **TC-03** | Business rule | Priority scores 6, 8 and 11 | `P3_MEDIUM` | **PASS** |
| **TC-04** | Boundary / rule | Priority score 1 and 5 | `P4_LOW` | **PASS** |
| **TC-05** | Normal | VPN / Wi-Fi keywords in incident title | Suggest `Network` category | **PASS** |
| **TC-06** | Invalid / edge | Cafeteria text with no IT keywords | No false category suggestion (`Optional.empty()`) | **PASS** |
| **TC-07** | Business rule | New Wi-Fi outage similar to open Wi-Fi ticket | Return possible duplicate warning | **PASS** |
| **TC-08** | Negative | Laptop battery issue vs network outage | No duplicate suggested (empty list) | **PASS** |
| **TC-09** | Normal / OOP | Network incident; network-skilled and hardware techs | Skill-based strategy selects matching tech | **PASS** |
| **TC-10** | Normal / OOP | Available tech workloads 8 vs 1 tickets | Least-loaded strategy selects workload 1 | **PASS** |
| **TC-11** | Normal | `NEW` → `CLASSIFIED` → ... → `CLOSED` | Valid sequential lifecycle progression succeeds | **PASS** |
| **TC-12** | Exception | `NEW` → `RESOLVED`, `NEW` → `CLOSED` | `InvalidStateTransitionException` rejected | **PASS** |
| **TC-13** | Boundary / SLA | P1 created 10:00; SLA response 5m, resolve 30m | Deadlines calculated as 10:05 and 10:30 | **PASS** |
| **TC-14** | SLA / rule | Response at 10:20; deadline 10:15 | SLA breach recorded (`responseBreached = true`) | **PASS** |
| **TC-15** | Auth / invalid | Login; employee accesses admin; wrong password | Valid JWT; admin rejected (403); wrong password (401) | **PASS** |
| **TC-16** | Integration | Employee creates ticket; events published | Ticket number generated; audit log & notification logged | **PASS** |
| **TC-17** | Integration | Technician acknowledges, notes, then resolves | Valid state progression, notes stored | **PASS** |
| **TC-18** | Integration / roles | Employee verifies; admin/system closes | Verified / closed and history updated | **PASS** |
| **TC-19** | Integration | Spring application context starts | Core components, repositories, and filters initialize | **PASS** |

*For complete test execution details, consult the dedicated [TESTING_REPORT.md](TESTING_REPORT.md).*

---

## 🎬 Demonstration Workflows

The application supports three end-to-end presentation demonstration workflows:

1. **Demo 1 — Employee Workflow:**
   * Log in as an Employee (`user1` / `User@123`).
   * Submit an incident report with Impact, Urgency, and Business Criticality inputs.
   * Verify priority calculation, SLA deadlines, ticket assignment, and email/in-app notifications.
2. **Demo 2 — Technician Workflow:**
   * Log in as a Technician (`tech.network` / `Tech@123`).
   * Inspect assigned queue, acknowledge ticket (recording response SLA timestamp), add investigation work notes, apply root-cause recommendations, and transition ticket to `RESOLVED`.
3. **Demo 3 — Administrator Workflow:**
   * Log in as an Administrator (`admin` / `Admin@123`).
   * Open the Operations Console (`/admin`), dynamically switch the active assignment strategy between `Skill-Based` and `Least-Loaded`, review SLA monitoring warnings, inspect the immutable audit trail, and export reports.

---

## 📦 Getting Started (Local Execution)

### Prerequisites
* **Java 21 (JDK)**
* **PostgreSQL 18.x** running on default port `5432`
* **Node.js 20+** and **npm 10+**

### Quick Start with Convenience Script
Run the automated launcher script from the repository root:
```cmd
.\start_app.bat
```
This automatically sets the database credentials, starts the Spring Boot backend on `http://localhost:8080`, launches the Vite frontend on `http://localhost:5173`, and opens the login console in your browser.

### Manual Setup
1. **Backend:**
   ```powershell
   cd backend
   $env:DB_PASSWORD = "your_postgres_password"
   .\mvnw.cmd spring-boot:run
   ```
2. **Frontend:**
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

### Default Seeded Accounts
| Role | Username | Password |
|:---|:---|:---|
| **Administrator** | `admin` | `Admin@123` |
| **Technician (Network)** | `tech.network` | `Tech@123` |
| **Technician (Hardware)** | `tech.hardware` | `Tech@123` |
| **Technician (Software)** | `tech.software` | `Tech@123` |
| **Technician (Security)** | `tech.security` | `Tech@123` |
| **Employee** | `employee` | `Emp$123` |

---

## 📑 Project Documentation Index

| Supporting Document | Information Contributed |
|:---|:---|
| **[README.md](README.md)** | Project overview, roles, feature list, setup instructions, and stack. |
| **[REQUIREMENTS.md](REQUIREMENTS.md)** | Functional requirements (FR-01 to FR-11), role boundaries, and business rules. |
| **[PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md)** | Layering, design patterns (Strategy, Observer), event flow, and conceptual classes. |
| **[DATABASE_DESIGN.md](DATABASE_DESIGN.md)** | JPA entities, 15 relational tables schema, and ER relationships. |
| **[TECHNOLOGY_SELECTION.md](TECHNOLOGY_SELECTION.md)** | Technology choice justification, alternatives analysis, and scalability discussions. |
| **[TESTING_REPORT.md](TESTING_REPORT.md)** | Documented 19-case test matrix and automated execution evidence. |
