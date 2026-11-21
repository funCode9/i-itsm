import os

md_path = r"c:\dev\i-itsm\docs\project-report\I_ITSM_Project_Report.md"

with open(md_path, "w", encoding="utf-8") as f:
    f.write("""# INTELLIGENT IT SERVICE MANAGEMENT & INCIDENT RESOLUTION SYSTEM (I-ITSM)

## An Enterprise-Grade, Object-Oriented Platform for Incident Lifecycle Automation, Multi-Strategy Dispatching, SLA Compliance, and Intelligent Diagnostics

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

Modern enterprise organizations maintain complex, distributed digital infrastructures encompassing cloud services, microservices, relational databases, global network gateways, identity providers, and mission-critical payment workflows. When service degradations or outages occur, unstructured and manual incident handling creates severe operational bottlenecks: delayed initial response, subjective and inconsistent priority scoring, misallocated technician workloads, costly Service Level Agreement (SLA) breaches, duplicate ticket generation, and fragmented audit trails. 

This project report presents the architectural design, object-oriented analysis, implementation, and empirical validation of the **Intelligent IT Service Management & Incident Resolution System (I-ITSM)**. Developed to address the complete incident lifecycle (**Report $\to$ Classify $\to$ Prioritize $\to$ Assign $\to$ Investigate $\to$ Resolve $\to$ Verify $\to$ Close**), I-ITSM is built upon a decoupled 4-tier enterprise architecture utilizing **Java 21**, **Spring Boot 4.1.2**, **Spring Data JPA/Hibernate 7**, **PostgreSQL 18.7**, and a **React 18 / Vite 6** Single Page Application styled with **Material UI v5**.

Central to the system is the rigorous application of object-oriented principles. The core domain enforces an 8-state **Finite State Machine (FSM)** with strict transition invariants to prevent illegal workflow jumps. A mathematical **Priority Engine** computes deterministic priority tiers ($P1\_CRITICAL$ through $P4\_LOW$) using multi-criteria business factors: $\text{Impact} \times \text{Urgency} \times \text{Business Criticality}$. Technician dispatching is engineered using the **Strategy Design Pattern**, enabling runtime polymorphism between **Skill-Based Assignment** (lexical keyword vector matching) and **Least-Loaded Assignment** (active workload minimization) governed by a dynamic `AssignmentStrategyContext`. An asynchronous, event-driven **Observer Pattern** decouples transaction commits from multi-channel alert delivery (in-app notifications and email transaction logs) and guarantees an immutable 7-attribute audit trail.

Beyond baseline requirements, I-ITSM incorporates six intelligent capabilities: (1) Lexicon-based Category Suggestion, (2) Weighted Jaccard Duplicate Incident Detection, (3) Predictive SLA Violation Risk Gauging using workflow stage inertia, (4) Automated Heuristic Root-Cause Analysis (RCA) mapped against enterprise failure taxonomies, (5) Contextual Gemini AI Resolution Playbook generation with conversational ticketing assistance, and (6) Automated Multi-Tier Incident Escalation. The application has been verified through **27 automated JUnit 5 tests (100% pass rate)**, seeded with 73 users and 36 production incidents, containerized via multi-stage Alpine Docker, and successfully deployed on cloud infrastructure with full HTTPS encryption.

**Keywords:** Object-Oriented Programming, Strategy Pattern, Observer Pattern, Finite State Machine, Spring Boot, React, PostgreSQL, Incident Management, SLA Monitoring, Heuristic Diagnostics.

---

<div style="page-break-after: always;"></div>

## TABLE OF CONTENTS

- **Preliminary Pages**
  - Cover Page
  - Abstract
  - Table of Contents
  - List of Figures
  - List of Tables
- **Chapter 1: Introduction**
  - 1.1 Background of IT Service Management (ITSM)
  - 1.2 Problem Statement
  - 1.3 Motivation
  - 1.4 Project Objectives
  - 1.5 Project Scope
  - 1.6 Stakeholders & Target Users
  - 1.7 Assumptions and Constraints
- **Chapter 2: Software Requirements Specification**
  - 2.1 Functional Requirements (FR-01 to FR-12)
  - 2.2 Non-Functional Requirements (NFR-01 to NFR-06)
  - 2.3 User Roles and Permissions Matrix
  - 2.4 Business Rules
  - 2.5 Incident Lifecycle State Machine
  - 2.6 Requirements Compliance Matrix
- **Chapter 3: Technology Stack and Selection Justification**
  - 3.1 Technology Stack Overview
  - 3.2 Programming Language Justification: Java 21
  - 3.3 Backend Framework Justification: Spring Boot 4.1.2
  - 3.4 Frontend Framework Justification: React 18 & Vite 6
  - 3.5 Database Justification: PostgreSQL 18.7
  - 3.6 Containerization & Cloud Deployment: Docker & Render
  - 3.7 Comparative Evaluation Against Alternatives
  - 3.8 Support for Object-Oriented Design & Future Scalability
- **Chapter 4: System Architecture and Design**
  - 4.1 Architectural Overview
  - 4.2 System Architecture Diagram
  - 4.3 Frontend Client Architecture
  - 4.4 Backend Layered Architecture
  - 4.5 Business Logic and Domain Model Layer
  - 4.6 Data Persistence Layer
  - 4.7 API Communication Protocol
  - 4.8 Authentication and Authorization Security Flow
  - 4.9 End-to-End Incident Processing Workflow (Sequence Diagram)
  - 4.10 Architectural Design Decisions and Trade-offs
- **Chapter 5: Object-Oriented Analysis and Design (OOAD)**
  - 5.1 Object-Oriented Design Philosophy
  - 5.2 Encapsulation in Domain Entities and Services
  - 5.3 Abstraction in Business Logic and Interfaces
  - 5.4 Inheritance Hierarchy and Exception Design
  - 5.5 Polymorphism in Runtime Dispatching
  - 5.6 Interface Contracts
  - 5.7 Object Relationships: Composition, Aggregation, and Association
  - 5.8 Detailed Implemented Design Patterns
    - 5.8.1 Strategy Pattern (Technician Assignment)
    - 5.8.2 Observer Pattern (Event-Driven Notifications and Audit)
    - 5.8.3 State Pattern / Finite State Machine (Lifecycle Transitions)
    - 5.8.4 Repository Pattern (Data Access Abstraction)
    - 5.8.5 Builder & Factory Patterns (Object Instantiation)
  - 5.9 Application of SOLID Principles
  - 5.10 Maintainability and Extensibility Assessment
  - 5.11 Unified Modeling Language (UML) Diagrams
    - 5.11.1 Use Case Diagram
    - 5.11.2 Comprehensive Class Diagram
- **Chapter 6: Database Design**
  - 6.1 Database Architectural Overview
  - 6.2 Entity-Relationship (ER) Diagram
  - 6.3 Relational Database Schema
  - 6.4 Relational Tables and Attribute Descriptions (15 Tables)
  - 6.5 Primary Keys, Foreign Keys, and Referential Integrity
  - 6.6 Indexes and Database Constraints
  - 6.7 Object-Relational Mapping (ORM) Implementation
  - 6.8 Representative Database Records
- **Chapter 7: Detailed Module Implementation**
  - 7.1 User Management & Authentication Module
  - 7.2 Incident Creation, Numbering, and Tracking Module
  - 7.3 Incident Classification & Service Catalog Module
  - 7.4 Priority Determination Engine (Mathematical Formulation & Worked Example)
  - 7.5 Technician Assignment Engine (Algorithms & Pseudocode)
  - 7.6 SLA Management & Background Compliance Monitor
  - 7.7 Multi-Channel Notification System
  - 7.8 Incident Audit Trail & History Log
  - 7.9 Search, Multi-Criteria Filtering, and Workload Queues
  - 7.10 Operational Reporting and Analytics
  - 7.11 Administrative Operations & Configuration Console
  - 7.12 Intelligent & Automated Features
    - 7.12.1 Automatic Category Suggestion
    - 7.12.2 Duplicate Incident Detection
    - 7.12.3 Predictive SLA Violation Risk Assessment
    - 7.12.4 Automated Root-Cause Analysis (RCA)
    - 7.12.5 Gemini AI Resolution Playbook & Conversational Assistant
    - 7.12.6 Multi-Tier Automated Incident Escalation
- **Chapter 8: Security and Exception Handling**
  - 8.1 Authentication and Password Encryption
  - 8.2 Role-Based Access Control (RBAC) & Filter Chain
  - 8.3 Input Validation and Sanitization
  - 8.4 Comprehensive Custom Exception Hierarchy (12 Exceptions)
  - 8.5 Centralized Global Exception Handler & REST Error Payloads
  - 8.6 Security Hardening & CORS Configuration
- **Chapter 9: Testing and Validation**
  - 9.1 Testing Strategy and Methodology
  - 9.2 Test Environment & Execution Harness
  - 9.3 Unit Testing of Core Engines and Heuristics
  - 9.4 Integration Testing and FSM State Validation
  - 9.5 End-to-End Workflow Testing
  - 9.6 Security, Role Authorization, and Exception Verification
  - 9.7 Comprehensive Test Case Table (27 Test Cases)
  - 9.8 Bugs Identified and Verified Fixes
  - 9.9 Testing Boundaries and Limitations
- **Chapter 10: Results and Application Screenshots**
  - 10.1 System Demonstration Overview
  - 10.2 Role-Based User Experience Screens
  - 10.3 Operations Console & Live Analytics
  - 10.4 Incident Drawer, RCA, and AI Resolution Interface
  - 10.5 Three End-to-End Recorded Demonstration Workflows
- **Chapter 11: Challenges, Limitations and Future Scope**
  - 11.1 Technical Challenges Encountered
  - 11.2 Engineering Trade-offs
  - 11.3 Current System Limitations
  - 11.4 Scalability Roadmap
  - 11.5 Future Enhancements
- **Chapter 12: Conclusion**
  - 12.1 Project Summary
  - 12.2 Fulfillment of Educational & Technical Objectives
  - 12.3 Reflection on Object-Oriented Engineering
- **References and Appendices**
  - Technical & Academic References
  - Appendix A: Source Code Repository & Live Deployment URLs
  - Appendix B: Complete REST API Endpoint Reference
  - Appendix C: Demonstration Workflow Checklist & Video Script
""")

print("Wrote Table of Contents and preliminary sections.")

with open(md_path, "a", encoding="utf-8") as f:
    f.write("""
<div style="page-break-after: always;"></div>

## LIST OF FIGURES

- Figure 4.1: I-ITSM Four-Tier Layered System Architecture Diagram
- Figure 4.2: End-to-End Incident Lifecycle Processing Sequence Diagram
- Figure 5.1: Unified Modeling Language (UML) Use Case Diagram
- Figure 5.2: Comprehensive Object-Oriented Domain Class Diagram
- Figure 5.3: Strategy Pattern Class Hierarchy for Dynamic Technician Assignment
- Figure 5.4: Observer Pattern Event Flow for Notifications and Immutable Audit Logging
- Figure 6.1: Entity-Relationship (ER) Diagram for the 15 Relational Tables
- Figure 10.1: Operations Health Console on Localhost Environment (36 Incidents, Trends)
- Figure 10.2: Live Production Operations Console Deployed on Cloud Infrastructure
- Figure 10.3: High-Resolution Brand Identity and Monotonic 3-Gear System Logo
- Figure 10.4: Stateless Spring Security JWT Authentication Endpoint Protection
- Figure 10.5: Incident Detail Drawer with Investigation Actions, RCA, and AI Playbook
- Figure 10.6: Real-time Incident Lifecycle Status and Technician Assignment Card
- Figure 10.7: Render Blueprint Cloud Deployment and Infrastructure as Code Pipeline

---

## LIST OF TABLES

- Table 2.1: User Roles and Permission Access Control Matrix
- Table 2.2: Incident Lifecycle FSM State Transition Permissibility Matrix
- Table 2.3: Comprehensive Faculty Requirements Compliance Matrix
- Table 3.1: Complete Technology Stack and Component Justification Matrix
- Table 3.2: Technology Comparison with Industry Alternatives
- Table 6.1: Relational Database Schema and Table Summary (15 Entities)
- Table 6.2: Primary and Foreign Key Constraint Mapping
- Table 7.1: Multi-Criteria Priority Engine Matrix and Score Ranges
- Table 7.2: SLA Policies, Baseline Deadlines, and Resolution Targets
- Table 7.3: Heuristic Root-Cause Analysis Taxonomy and Failure Domain Mappings
- Table 8.1: Custom Exception Hierarchy, Trigger Conditions, and HTTP Status Codes
- Table 9.1: Automated JUnit 5 Test Case Execution Suite (27 Test Cases)
- Table 9.2: Historical Defects, Root Causes, and Verified Resolutions
- Appendix B.1: Complete REST API Endpoint Specification

---

<div style="page-break-after: always;"></div>

# CHAPTER 1 — INTRODUCTION

### 1.1 Background of IT Service Management (ITSM)
In modern knowledge economies and digital enterprises, organizational productivity depends entirely upon the uninterrupted availability of Information Technology (IT) services. Enterprise architectures encompass hybrid cloud deployments, relational and distributed databases, virtualized networks, containerized microservices, authentication and identity federation providers, payment gateways, and enterprise resource planning (ERP) platforms. 

When any component in this interdependent digital fabric degrades or fails—such as an unavailable payment processor, an expired SSL/TLS certificate, an exhausted database connection pool, or a DNS gateway misconfiguration—the incident directly impairs business operations, employee productivity, customer trust, and financial revenue. 

IT Service Management (ITSM) is the systematic, process-driven discipline that aligns IT services with organizational needs. Under industry frameworks such as ITIL (Information Technology Infrastructure Library), Incident Management serves as the frontline operational process responsible for restoring normal service operation as rapidly as possible, minimizing adverse business impact, and maintaining agreed Service Level Agreements (SLAs).

### 1.2 Problem Statement
Despite the critical necessity of rapid incident resolution, many medium-to-large enterprises continue to manage IT service disruptions through informal, fragmented, or manual mechanisms (such as ad-hoc emails, unindexed chat channels, or generic spreadsheet logs). Manual incident management introduces critical failure points:
1. **Delayed Response and Detection:** Incidents linger unassigned in personal inboxes, causing critical operational deadlines to elapse before technical investigation begins.
2. **Subjective and Erroneous Prioritization:** Without objective mathematical frameworks, incident priorities are assigned arbitrarily by end-users or support dispatchers, causing minor cosmetic issues to preempt catastrophic production outages.
3. **Inefficient and Overloaded Technician Allocation:** Incidents are assigned without visibility into real-time technician workload, leading to technician burnout, queue bottlenecking, and skilled technicians receiving tickets outside their domain expertise.
4. **Frequent SLA Violations:** Lack of automated deadline tracking and proactive risk alerting results in unmonitored ticket breaches, contractual penalties, and compromised customer satisfaction.
5. **Duplicate and Correlated Ticket Floods:** Major infrastructure outages generate dozens of redundant tickets from different departments, swamping support teams with noise and duplicate investigations.
6. **Incomplete and Mutable Audit Trails:** Regulatory compliance (ISO/IEC 20000, SOC 2, HIPAA) requires immutable, tamper-proof logs of every state change, diagnostic action, and user intervention, which manual workflows fail to provide.

### 1.3 Motivation
The central motivation of this project is to apply foundational principles of **Object-Oriented Programming (OOP)**, **Software Engineering**, and **Distributed Systems Design** to architect a robust, production-grade **Intelligent IT Service Management & Incident Resolution System (I-ITSM)**. 

Object-oriented paradigms—specifically encapsulation, interface-driven abstraction, inheritance hierarchies, runtime polymorphism, and established design patterns—provide the ideal architectural foundation for modeling complex real-world workflows like incident lifecycles, dynamic dispatching strategies, and asynchronous event notifications. Furthermore, augmenting deterministic rule engines with intelligent heuristics and modern generative AI APIs transforms reactive ticket tracking into a proactive, intelligent operations cockpit.

### 1.4 Project Objectives
The engineering objectives of the I-ITSM system are:
1. **Full Lifecycle Governance:** Implement an automated, finite state machine (FSM) managing the complete incident lifecycle: **Report $\to$ Classify $\to$ Prioritize $\to$ Assign $\to$ Investigate $\to$ Resolve $\to$ Verify $\to$ Close**, preventing invalid workflow transitions.
2. **Deterministic Priority Engine:** Formulate and implement an objective mathematical priority calculation model based on Impact, Urgency, and Business Criticality.
3. **Pluggable Technician Assignment (Strategy Pattern):** Design and implement at least two interchangeable assignment algorithms (Skill-Based matching and Least-Loaded workload balancing) capable of being toggled dynamically at runtime.
4. **Automated SLA Monitoring & Escalation:** Engineer a background scheduler that computes response and resolution deadlines, evaluates SLA health every 60 seconds, generates approaching-breach warnings, and triggers multi-tier escalations.
5. **Asynchronous Multi-Channel Notifications (Observer Pattern):** Implement an event-driven architecture delivering immediate in-app notifications and simulated email delivery logs on critical lifecycle events without blocking HTTP request threads.
6. **Immutable Audit Logging:** Maintain a chronological, tamper-evident audit history capturing timestamps, actor identities, actions performed, previous and new states, and detailed transition descriptions.
7. **Intelligent Operational Heuristics:** Implement six intelligent features: automated category suggestion, duplicate detection via string similarity metrics, predictive SLA violation risk assessment, automated root-cause analysis (RCA), contextual generative AI resolution playbooks, and automated incident escalation.
8. **Production-Grade Delivery:** Containerize the full-stack system and deploy it onto public cloud infrastructure with HTTPS, backed by persistent cloud database storage.

### 1.5 Project Scope
The project scope includes:
- **Backend:** A robust RESTful API built with Java 21, Spring Boot 4.1.2, Spring Security with stateless JWT, Spring Data JPA, and Hibernate 7.
- **Frontend:** A responsive Single Page Application (SPA) developed with React 18, Vite 6, Material UI (MUI) v5/v6, Recharts, and Axios.
- **Persistence:** A PostgreSQL 18.7 relational database containing 15 normalized tables, foreign key constraints, cascading rules, and seed data.
- **Security:** Role-Based Access Control (RBAC) supporting Employee, Technician, and Administrator roles with encrypted credentials.
- **Testing:** Comprehensive unit, integration, lifecycle, heuristic, and end-to-end workflow automated test suites.
- **Cloud Infrastructure:** Docker containerization and live deployment on Render.com with Neon Serverless Cloud PostgreSQL.

### 1.6 Stakeholders & Target Users
The system serves three primary user personas:
1. **Employee / Customer:** Reports disruptions, tracks ticket progress in real-time, communicates via investigation notes, verifies resolutions, and submits satisfaction feedback.
2. **Technician / Support Engineer:** Specializes in incident investigation, acknowledges tickets, inspects automated RCA and AI resolution playbooks, logs work notes, and resolves incidents.
3. **Administrator / IT Manager:** Supervises global service health, manages user/technician accounts, configures SLA policies and category service catalogs, toggles active assignment strategies, inspects audit trails, and reviews compliance analytics.

### 1.7 Assumptions and Constraints
- **Assumptions:** Users have access to modern web browsers; technicians possess defined skill domains mapped to service categories; all timestamps are stored in UTC and rendered in local user timezone.
- **Constraints:** Must strictly follow Object-Oriented principles; must not compromise transactional data integrity; must enforce stateless API authentication; must operate within free/low-cost cloud tier quotas without requiring commercial enterprise licensing.

---

<div style="page-break-after: always;"></div>

# CHAPTER 2 — SOFTWARE REQUIREMENTS SPECIFICATION

### 2.1 Functional Requirements (FR)
- **FR-01: User Authentication & Registration:** Register with user profile; authenticate and receive signed stateless JWT tokens with 24-hour validity.
- **FR-02: Role-Based Routing & Authorization:** Strict RBAC separating Employee, Technician, and Administrator interfaces and API routes.
- **FR-03: Incident Creation & Code Generation:** Submit tickets with title, description, category, affected service, impact (1-3), urgency (1-3), and business criticality (1-3). Auto-generates unique formatted ID `INC-YYYYMMDD-XXXX`.
- **FR-04: Deterministic Priority Computation:** Computes Priority Score = $\text{Impact} \times \text{Urgency} \times \text{Business Criticality}$ (P1: 18-27, P2: 12-17, P3: 6-11, P4: 1-5).
- **FR-05: Incident Lifecycle State Machine:** Enforces valid transitions across 8 states (`NEW`, `CLASSIFIED`, `ASSIGNED`, `ACKNOWLEDGED`, `IN_PROGRESS`, `RESOLVED`, `VERIFIED`, `CLOSED`), rejecting illegal jumps with `InvalidStateTransitionException`.
- **FR-06: Dynamic Technician Assignment:** Allocates tickets to qualified available technicians using the active strategy (`SKILL_BASED` or `LEAST_LOADED`), with manual re-assignment capability for administrators.
- **FR-07: SLA Policy Enforcement & Deadline Calculation:** Maps incidents to active SLA policies by priority/category, setting `responseDeadline` and `resolutionDeadline`.
- **FR-08: Continuous Background SLA Monitoring:** Asynchronous scheduled checker (every 60s) flags `APPROACHING` (threshold $\ge 75\%$) and `BREACHED` states.
- **FR-09: Investigation Notes & Audit Trails:** Appends work/public notes and captures immutable audit records for every state mutation.
- **FR-10: Multi-Channel Event Notifications:** Dispatches in-app alerts and persists simulated email logs on ticket creation, assignment, escalation, resolution, and breach.
- **FR-11: Multi-Criteria Queue Search & Filtering:** Supports 7 filter criteria: text search, status, priority, category, service, technician, and SLA compliance.
- **FR-12: Operational Reporting & Analytics:** Computes real-time aggregates for queue volume, resolution velocity, SLA compliance rates, and technician workloads.

### 2.2 Non-Functional Requirements (NFR)
- **NFR-01: Usability:** Responsive Material UI v5 interface with contrast chips, intuitive drawers, responsive charts, and Dark/Light theme mode.
- **NFR-02: Performance:** Sub-200ms REST query response time; background execution for event publishing and audit logging.
- **NFR-03: Reliability & Atomicity:** ACID transactional consistency (`@Transactional`) guaranteeing all-or-nothing execution.
- **NFR-04: Security:** BCrypt password hashing, stateless Bearer JWT validation, and CORS pattern defense.
- **NFR-05: Maintainability & Extensibility:** Adherence to SOLID principles and GoF design patterns; pluggable strategy and listener architectures.
- **NFR-06: Portability:** Multi-stage Docker containerization running on Alpine Linux for uniform local and cloud deployment.

### 2.3 User Roles and Permissions Matrix

| System Capability | Employee / Customer | Technician / Engineer | Administrator / IT Manager |
| :--- | :---: | :---: | :---: |
| Register and Authenticate | Yes | Yes | Yes |
| Submit New Incident | Yes | Yes | Yes |
| View Own Reported Incidents | Yes | Yes (if reporter) | Yes (All Incidents) |
| View Assigned Incident Queue | No | Yes (Assigned to Self) | Yes (All Incidents) |
| Acknowledge Incident | No | Yes | Yes |
| Update Status to In-Progress | No | Yes | Yes |
| Add Investigation Notes | Yes (Public Notes) | Yes (Work/Public Notes)| Yes (All Notes) |
| Inspect Root-Cause Analysis (RCA) | No | Yes | Yes |
| Apply AI Resolution Playbook | No | Yes | Yes |
| Resolve Incident | No | Yes | Yes |
| Verify & Close Incident | Yes (Own Incidents) | No | Yes |
| Submit Customer Feedback | Yes (Own Incidents) | No | No |
| Reassign Technician | No | No | Yes |
| Switch Assignment Strategy | No | No | Yes |
| Configure Categories & Services | No | No | Yes |
| Configure SLA Policies | No | No | Yes |
| Manage User & Tech Profiles | No | No | Yes |
| View Immutable Audit Trail | No | No | Yes |
| Export Analytics & Reports | No | No | Yes |

### 2.4 Business Rules
- **BR-01 (Mandatory Incident Metadata):** Title, description, reporter, and calibrated numerical ratings (1-3) for Impact, Urgency, and Criticality are mandatory.
- **BR-02 (FSM Non-Bypassability):** State jumps bypassing intermediate investigation states are strictly prevented.
- **BR-03 (Mandatory Resolution Details):** Transitioning to `RESOLVED` requires non-empty resolution details.
- **BR-04 (Technician Capacity Ceiling):** Technicians whose active ticket count reaches `maxConcurrentIncidents` are omitted from automated dispatching.
- **BR-05 (SLA Freeze Upon Resolution):** SLA clock tracking ceases upon reaching `RESOLVED`, `VERIFIED`, or `CLOSED`.

### 2.5 Incident Lifecycle State Machine

The incident lifecycle FSM guarantees strict sequential progression:
`NEW -> CLASSIFIED -> ASSIGNED -> ACKNOWLEDGED -> IN_PROGRESS -> RESOLVED -> VERIFIED -> CLOSED`.
A ticket can be reopened from `RESOLVED` back to `IN_PROGRESS` if testing fails during verification.

### 2.6 Requirements Compliance Matrix
Please refer to Table 2.3 and `docs/project-report/requirements_compliance.md` for complete verification evidence across all 22 faculty project criteria.
""")

print("Appended Chapter 1 & 2.")
