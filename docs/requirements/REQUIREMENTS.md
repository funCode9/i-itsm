# I-ITSM System Requirements Specification

**Course:** CS F213 / MAC F212 — Object Oriented Programming  
**Department:** Department of Computer Science & Information Systems, BITS Pilani  
**Project:** Intelligent IT Service Management & Incident Resolution System (I-ITSM)  
**Group Number:** 36  
**Submission Date:** 22/11/2026  

---

## 1. Stakeholders

| Stakeholder | What They Need |
|:---|:---|
| **Employee / Reporter** | A simple, accessible way to report IT issues, check resolution progress, comment on tickets, and verify solutions. |
| **Technician / Support Engineer** | Clear ownership of assigned tickets, rich problem details, investigation work notes, SLA deadlines, and diagnostic assistance. |
| **Administrator / IT Manager** | Centralized control over users, technician rosters, service policies, assignment rules, audit logs, and compliance analytics. |
| **Organization / Service Owner** | Faster turnaround, reduced service downtime, reliable audit history, and complete SLA compliance visibility. |

---

## 2. User Roles & Permissions

| Role | Main Responsibilities |
|:---|:---|
| **Employee** | Create incident tickets, track own reported issues, add comments, verify resolved solutions, and give 1–5 star satisfaction feedback. |
| **Technician** | View assigned incident queue, acknowledge tickets, investigate root causes, add diagnostic notes, and resolve incidents. |
| **Administrator** | Manage users, categories, services, and SLA policies; switch active assignment strategy at runtime; review audit logs and operations dashboards. |

---

## 3. Functional Requirements (FR-01 to FR-11)

| ID | Functional Requirement | Description / Acceptance Criteria |
|:---:|:---|:---|
| **FR-01** | Register & Authenticate | Register user accounts and authenticate with username/password, issuing stateless JWT tokens for valid sessions. |
| **FR-02** | Role-Based Access Control | Enforce strict permissions across Employee, Technician, and Administrator roles with HTTP 403 Forbidden on unauthorized access. |
| **FR-03** | Incident Ticket Management | Allow ticket creation capturing title, description, category, affected IT service, priority factors, reporter, and initial status `NEW`. |
| **FR-04** | Priority Computation Engine | Calculate priority deterministically: $\text{Priority Score} = \text{Impact} \times \text{Urgency} \times \text{Criticality}$ ($1–27$) and map to tiers P1–P4. |
| **FR-05** | Lifecycle FSM Enforcement | Validate all state changes using the 8-stage Finite State Machine. Reject illegal status jumps with `InvalidStateTransitionException`. |
| **FR-06** | Strategy-Based Assignment | Assign tickets to technicians polymorphically using the active GoF Strategy (`SkillBasedAssignmentStrategy` or `LeastLoadedAssignmentStrategy`). |
| **FR-07** | SLA Deadline & Breach Tracking | Apply priority-based response and resolution deadlines; run background monitoring every 60s; record warning alerts and violation breaches. |
| **FR-08** | Work Notes & Resolution Feedback | Enable internal diagnostic notes and employee comments; capture resolution details and customer satisfaction ratings upon verification. |
| **FR-09** | Notifications & Audit Trail | Publish decoupled domain events via Observer pattern to record in-app notifications, simulated email logs, and immutable audit entries. |
| **FR-10** | Administration & Reporting | Provide administrative configuration of categories, services, SLA policies, and assignment strategies, plus operations analytics. |
| **FR-11** | Intelligent Assistance | Offer rule-based category suggestions and soft-token Jaccard duplicate incident warnings to prevent ticket queue noise. |

---

## 4. Non-Functional Requirements (NFR)

| Quality Dimension | Requirement / Acceptance Focus |
|:---|:---|
| **Security** | BCrypt password hashing, stateless JJWT token verification, role-based endpoint authorization (`@PreAuthorize`), and CORS restrictions. |
| **Reliability** | Persistent storage in PostgreSQL with ACID transactional rollback on failures; robust global error handling returning meaningful HTTP error envelopes. |
| **Usability** | Polished, accessible React interface styled with Material UI (MUI v6); clear role-tailored navigation, visual status chips, and real-time form validation. |
| **Maintainability** | Clean four-tier layered architecture separating React components, REST controllers, Java domain services, and JPA repositories. |
| **Performance** | Asynchronous event listeners for notifications and audit logging; optimized JPA entity queries with indexed lookups; background SLA scanning in dedicated thread pools. |

---

## 5. Business Rules (BR-01 to BR-07)

| Rule | Definition |
|:---:|:---|
| **BR-01** | Priority score = $\text{Impact} \times \text{Urgency} \times \text{Business Criticality}$; each factor is calibrated from 1 (Low) to 3 (High). |
| **BR-02** | Priority mapping: Score 18–27 maps to **P1 Critical**; 12–17 to **P2 High**; 6–11 to **P3 Medium**; 1–5 to **P4 Low**. |
| **BR-03** | Status transitions must follow the strict lifecycle: `NEW` ➔ `CLASSIFIED` ➔ `ASSIGNED` ➔ `ACKNOWLEDGED` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `VERIFIED` ➔ `CLOSED`. Illegal jumps raise an exception. |
| **BR-04** | A configured assignment strategy selects among available technicians. Administrators can switch between Skill-Based and Least-Loaded at runtime. |
| **BR-05** | SLA targets depend on priority (P1: 5m/30m, P2: 15m/2h, P3: 1h/8h, P4: 4h/24h) and are monitored continuously against deadlines. Warnings trigger at $\le 20\%$ time remaining. |
| **BR-06** | Employees can view and interact only with their own tickets; administrator-only functions strictly require the `ADMINISTRATOR` role. |
| **BR-07** | A `RESOLVED` incident may be reopened to `IN_PROGRESS` if verification reveals the issue persists, or closed after customer confirmation. |
