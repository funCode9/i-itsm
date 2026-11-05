# Intelligent IT Service Management & Incident Resolution System (I-ITSM)

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg)](https://adoptium.net/)
[![Spring Boot 4.1.2](https://img.shields.io/badge/Spring%20Boot-4.1.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![PostgreSQL 18.6](https://img.shields.io/badge/PostgreSQL-18.6-blue.svg)](https://www.postgresql.org/)
[![Vite 6](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)

**I-ITSM** is an enterprise-grade, full-stack IT Service Management & Incident Resolution platform developed for a College Object-Oriented Programming (OOP) project. It demonstrates clean object-oriented architecture, GoF design patterns (**Strategy Pattern** and **Observer Pattern**), rule-based intelligence, strict finite state machine (FSM) lifecycle transitions, SLA deadline monitoring, and role-based security.

---

## 🚀 Key Features

1. **Role-Based Access Control (RBAC):**
   - **Employee:** Incident reporting, tracking, interactive commenting, SLA visibility, and feedback rating.
   - **Technician:** Incident queue, status lifecycle updates, investigation/resolution notes, and workload visibility.
   - **Administrator:** User & technician roster management, IT service & category configuration, dynamic SLA policies, runtime strategy switching, audit logs, and analytical dashboards.

2. **Priority Engine (Rule-Based):**
   - Formula: $\text{Priority Score} = \text{Impact} \times \text{Urgency} \times \text{Business Criticality}$ (each 1–3).
   - Dynamic threshold mapping:
     - **18–27**: P1 Critical
     - **12–17**: P2 High
     - **6–11**: P3 Medium
     - **1–5**: P4 Low

3. **Technician Assignment (GoF Strategy Pattern):**
   - **Strategy A (Skill-Based):** Analyzes category, service, and title keywords to find the best technician match.
   - **Strategy B (Least-Loaded):** Computes active unresolved incident workload and balances assignments across available technicians.
   - Administrators can dynamically switch the active assignment strategy in real-time.

4. **Incident Lifecycle (Finite State Machine):**
   - Strict sequential flow: `NEW` ➔ `CLASSIFIED` ➔ `ASSIGNED` ➔ `ACKNOWLEDGED` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `VERIFIED` ➔ `CLOSED`.
   - Rejects illegal state jumps (enforced by `InvalidStateTransitionException`).

5. **SLA Management & Background Monitoring:**
   - Default policies:
     - **P1**: Response 5 min, Resolution 30 min
     - **P2**: Response 15 min, Resolution 2 hours
     - **P3**: Response 1 hour, Resolution 8 hours
     - **P4**: Response 4 hours, Resolution 24 hours
   - Automated `@Scheduled` background worker continuously scans deadlines, warning at 20% threshold and recording breaches.

6. **GoF Observer Pattern & Notifications:**
   - Centralized `ApplicationEventPublisher` publishes domain events (`IncidentCreatedEvent`, `IncidentStatusChangedEvent`, `IncidentAssignedEvent`).
   - Listeners asynchronously record immutable system **Audit Logs**, send persistent **In-App Notifications**, and simulate **Email Logs**.

7. **Rule-Based Intelligent Features:**
   - **Automatic Category Suggestion:** Analyzes title & description keywords against category dictionaries.
   - **Duplicate Incident Detection:** Multi-factor similarity scoring (Jaccard token comparison across title, description, category, and service) to warn reporters before duplicate ticket submission.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, JavaScript (ES Modules), Material UI v6, Axios, React Router v7, Recharts |
| **Backend** | Java 21, Spring Boot 4.1.2, Spring Data JPA, Spring Security 7, Hibernate ORM 7, JJWT 0.12.6, Lombok |
| **Database** | PostgreSQL 18.6 (`itsm_db`) |
| **Build Tools** | Apache Maven 3.10.0, npm 11 |

---

## 📦 Getting Started

### Prerequisites
- Java 21 (JDK)
- PostgreSQL 18.x running on port `5432` with database `itsm_db` and user `itsm_user`
- Node.js 20+ and npm

### 1. Configure Database Password
Set the `DB_PASSWORD` environment variable in your terminal session:
```powershell
$env:DB_PASSWORD = "your_actual_password"
```

### 2. Run Backend
```powershell
cd C:\dev\i-itsm\backend
.\mvnw spring-boot:run
```
The backend initializes database tables via Hibernate and seeds default users, categories, services, and SLA policies automatically. It runs on `http://localhost:8080`.

### 3. Run Frontend
```powershell
cd C:\dev\i-itsm\frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 👥 Default Credentials

| Username | Password | Role | Description |
|---|---|---|---|
| `admin` | `Admin@123` | ADMINISTRATOR | System Administrator |
| `tech.network` | `Tech@123` | TECHNICIAN | Network Specialist |
| `tech.hardware` | `Tech@123` | TECHNICIAN | Hardware Specialist |
| `tech.software` | `Tech@123` | TECHNICIAN | Software Application Specialist |
| `tech.security` | `Tech@123` | TECHNICIAN | Cybersecurity Specialist |
| Self-register | Any password | EMPLOYEE | Standard Employee role |

---

## 🧪 Testing

Run all 19 automated unit and integration tests:
```powershell
cd C:\dev\i-itsm\backend
.\mvnw test
```
All 19 test cases pass with 0 failures and 0 skipped tests.

---

## 📑 Detailed Documentation

- [Project Architecture & OOP Design](PROJECT_ARCHITECTURE.md)
- [System Requirements Specification](REQUIREMENTS.md)
- [Technology Selection Justification](TECHNOLOGY_SELECTION.md)
- [Relational Database Design & Schema](DATABASE_DESIGN.md)
- [Comprehensive Testing Report](TESTING_REPORT.md)
