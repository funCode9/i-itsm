import os

md_path = r"c:\dev\i-itsm\docs\project-report\I_ITSM_Project_Report.md"

with open(md_path, "a", encoding="utf-8") as f:
    f.write("""
<div style="page-break-after: always;"></div>

# CHAPTER 3 — TECHNOLOGY STACK AND SELECTION JUSTIFICATION

### 3.1 Technology Stack Overview
The I-ITSM application leverages a modern, decoupled web architecture comprising:
- **Backend:** Java 21 LTS, Spring Boot 4.1.2, Spring Security with JWT, Spring Data JPA, Hibernate 7.4.
- **Frontend:** React 18.3, Vite 6.2, Material UI (MUI) v6.4, Recharts 2.15, Axios 1.8.
- **Database:** PostgreSQL 18.7 (Object-Relational DBMS) with HikariCP connection pooling.
- **DevOps & Cloud:** Multi-stage Docker containerization (Alpine Linux), Render.com Cloud Platform, Neon Serverless PostgreSQL.
- **Build & Quality Assurance:** Apache Maven 3.9, Node.js 20, JUnit 5, Mockito, ESLint.

### 3.2 Programming Language Justification: Java 21 LTS
Java was selected as the backend programming language due to its unmatched strengths in enterprise object-oriented engineering:
- **Strong Static Typing & Compile-Time Safety:** Prevents large categories of runtime type errors inherent in dynamically typed languages (such as JavaScript or Python).
- **Modern Language Enhancements:** Java 21 introduces enhanced switch expressions, pattern matching for records and type patterns, virtual threads capability, and clean collection factory methods (`Map.of`, `List.of`, `Set.of`).
- **Comprehensive Standard Library:** Robust `java.time` temporal APIs (`LocalDateTime`, `Duration`, `ChronoUnit`) provide millisecond-accurate SLA deadline and breach arithmetic.
- **Industry Standard for OOP Pedagogy:** Perfectly embodies OOP principles—strict class structures, interface contracts, abstract base classes, and standard design pattern implementations.

### 3.3 Backend Framework Justification: Spring Boot 4.1.2
Spring Boot 4 was chosen as the enterprise application framework for several compelling reasons:
- **Dependency Injection (IoC):** Inversion of Control facilitates loose coupling between controllers, services, and repositories, making components easily testable with mock objects.
- **Declarative Transaction Management:** `@Transactional` guarantees atomicity across multi-step domain workflows without manual JDBC transaction management.
- **Application Event Subsystem:** Spring's `ApplicationEventPublisher` and `@EventListener` annotations provide an elegant, decoupled implementation of the **Observer Pattern**.
- **Asynchronous Execution:** `@Async` combined with thread pool configuration (`AsyncConfig.java`) enables notification dispatch and audit persistence to execute without blocking client HTTP responses.
- **Spring Security Integration:** Filter-based stateless JWT architecture provides defense-in-depth protection across all API routes.

### 3.4 Frontend Framework Justification: React 18 & Vite 6
The user interface was built as a Single Page Application (SPA) using React 18:
- **Component-Driven Ergonomics:** Decomposes complex user interfaces into reusable, encapsulated components (`IncidentDrawer`, `IncidentQueueTable`, `MetricCard`, `TicketVolumeTrendChart`).
- **State Management & Reactive UI:** React's virtual DOM efficiently reconciles UI state changes in real time when tickets transition across lifecycle states or new alerts arrive.
- **Vite 6 Fast Build Engine:** Next-generation frontend tooling providing lightning-fast Hot Module Replacement (HMR) during development and highly optimized Rollup production chunking.
- **Material UI (MUI) v5/v6:** Delivers enterprise-grade, accessible UI primitives aligned with Google Material Design principles.

### 3.5 Database Justification: PostgreSQL 18.7
PostgreSQL was selected over NoSQL alternatives for the persistence tier:
- **ACID Transaction Guarantees:** Critical for IT service management where incident status transitions, technician workload increments, and SLA timers must never exist in partial or inconsistent states.
- **Strict Referential Integrity:** Foreign key constraints with `ON DELETE CASCADE` or `RESTRICT` guarantee that orphaned notes, SLA records, or audit logs cannot corrupt the database.
- **Rich Data Types & Indexes:** Native support for timestamp with timezone, text search vectors, and B-tree indexes ensures sub-millisecond query execution even with tens of thousands of incidents.

### 3.6 Containerization & Cloud Deployment: Docker & Render
- **Multi-Stage Docker Build:** A two-stage `Dockerfile` uses `maven:3.9.9-eclipse-temurin-21-alpine` to compile and package the fat JAR, then transfers only the artifact into a minimal `eclipse-temurin:21-jre-alpine` runtime image, reducing attack surface and container size.
- **Security Hardening:** The container executes as an unprivileged, non-root system user (`itsm:itsm`).
- **Render.com Cloud Hosting:** Provides zero-downtime container hosting, automated HTTPS termination, and Infrastructure as Code (`render.yaml`) blueprints.
- **Neon Serverless PostgreSQL:** Provides autoscaling cloud database compute with instant branching and secure SSL connectivity.

### 3.7 Comparative Evaluation Against Alternatives

| Dimension | Selected Stack (Spring Boot + React + Postgres) | Alternative A (Node.js / Express + MongoDB) | Alternative B (Python / Django + SQLite) |
| :--- | :--- | :--- | :--- |
| **Type Safety & OOP Rigor** | **High:** Static typing, strict interfaces, polymorphism | Low: JavaScript dynamic typing; weak interfaces | Moderate: Python dynamic typing; duck typing |
| **Transactional Integrity** | **High:** ACID relational transactions with foreign keys | Low: Document store; eventual consistency | Moderate: SQLite lacks robust concurrent writes |
| **Design Pattern Support** | **Native:** Seamless GoF Strategy, Observer, Repository | Manual closures; prototype-based OOP | Functional/metaclass patterns |
| **Enterprise Scalability** | **Proven:** Multi-threaded JVM, HikariCP, connection pools | Single-threaded event loop; CPU bottlenecks | Synchronous WSGI; higher concurrency latency |
| **Ecosystem Maturity** | **Extensive:** Spring Security, Hibernate ORM | NPM fragmentation; frequent breaking changes | Monolithic; opinionated ORM conventions |

### 3.8 Support for Object-Oriented Design & Future Scalability
The selected stack directly reinforces OOP design:
1. **Interface Segregation:** Spring Data repositories and Strategy interfaces decouple logic from underlying storage or execution details.
2. **Encapsulation:** Java entity classes encapsulate mutable domain state behind getters, setters, and guarded state-mutation methods (`transitionTo`).
3. **Horizontal Scalability:** The stateless JWT architecture permits multiple backend container replicas to sit behind a load balancer without shared session state.

---

<div style="page-break-after: always;"></div>

# CHAPTER 4 — SYSTEM ARCHITECTURE AND DESIGN

### 4.1 Architectural Overview
The I-ITSM system implements a **Four-Tier Decoupled Layered Architecture**:
1. **Presentation / Client Tier:** React 18 SPA executing in the client browser, communicating asynchronously via HTTPS/REST.
2. **API & Security Gateway Tier:** Spring Security filter chain handling CORS, parsing Bearer JWT tokens, authenticating user principals, and authorizing role-based endpoint access.
3. **Business Logic & Domain Tier:** Domain entities, Finite State Machine, Priority Engine, dynamic Strategy assignment context, intelligent heuristic services, and application event observers.
4. **Data Persistence Tier:** Spring Data JPA repositories interfacing via Hibernate 7 ORM over HikariCP connection pools to PostgreSQL 18.7.

### 4.2 System Architecture Diagram
Please inspect Figure 4.1 (`docs/project-report/diagrams/system_architecture.svg`) for the complete vector architectural blueprint showing component interconnects.

### 4.3 Frontend Architecture
The frontend follows a feature-oriented modular design:
- `api/axiosConfig.js`: Centralizes Axios configuration, resolves dynamic `VITE_API_BASE_URL`, injects JWT tokens, and handles 401 response redirects.
- `context/AuthContext.jsx`: Manages global user authentication state, token storage, and session clearance.
- `components/`: Encapsulates reusable UI elements including `IncidentQueueTable` (sorting, filtering, pagination), `MetricCard`, `IncidentDrawer`, `StatusChip`, and `AiChatbotWidget`.
- `pages/`: Groups role-tailored views into `employee/`, `technician/`, `admin/`, and `shared/`.

### 4.4 Backend Layered Architecture
- **Controller Layer (`controller/`):** Accepts HTTP requests, parses/validates DTOs (`@Valid`), delegates to services, and returns `ResponseEntity<?>`.
- **Service Layer (`service/`):** Houses business logic, FSM validation, transactional boundaries, and algorithmic processing.
- **Data Access Layer (`repository/`):** Extends `JpaRepository<T, ID>`, providing typed JPQL queries.
- **Domain Layer (`domain/entity/`, `domain/enums/`):** JPA annotated entity models defining state attributes, relationships, and lifecycle state enumerations.

### 4.5 Business Logic and Domain Layer
Domain objects interact through clearly defined object associations:
- An `Incident` entity maintains a direct association with its `User` reporter, its assigned `Technician`, its `Category`, its `ItService`, and its child `IncidentSla` tracking record.
- Business rules are not scattered across SQL queries or UI controllers; they are centralized inside domain services (`IncidentService`, `PriorityEngine`, `SlaMonitoringService`).

### 4.6 Data Persistence Layer
Data persistence utilizes the **Repository Pattern** through Spring Data JPA:
- Custom queries leverage typed JPQL queries (e.g., `countActiveIncidents`, `findByActiveTrue`, `findApproachingSlas`) to ensure database independence and optimized SQL generation.
- Hibernate handles entity state transitions, lazy loading of collection relationships, and automatic schema validation.

### 4.7 API Communication
- All communication between client and server occurs over secure HTTPS using RESTful conventions.
- Standard HTTP verbs are strictly observed: `POST` for creation, `GET` for safe retrieval, `PATCH` for partial state mutation (e.g. status transition), and `DELETE` for removal.
- API payloads are serialized as JSON with ISO-8601 formatted timestamps.

### 4.8 Authentication and Authorization Flow
1. Client sends `POST /api/auth/login` with username and password.
2. `AuthController` delegates to `AuthService`, which invokes Spring Security's `AuthenticationManager`.
3. `DaoAuthenticationProvider` verifies credentials using `UserDetailsServiceImpl` and `BCryptPasswordEncoder`.
4. Upon authentication, `JwtUtil` constructs a signed JWT containing username, role, and expiration timestamp.
5. Client stores token and attaches it to subsequent requests in the `Authorization: Bearer <token>` header.
6. `JwtAuthFilter` intercepts incoming requests, parses the token, populates the `SecurityContextHolder`, and permits authorized execution.

### 4.9 End-to-End Incident Processing Workflow (Sequence Diagram)
Please refer to Figure 4.2 (`docs/project-report/diagrams/sequence_diagram.svg`), which illustrates the end-to-end processing sequence from incident submission, priority calculation, strategy assignment, observer notifications, technician acknowledgment, RCA investigation, resolution, and closure.

### 4.10 Design Decisions and Trade-offs
1. **Stateless JWT vs. Stateful HTTP Sessions:** Chose stateless JWTs to enable horizontal cloud scaling without requiring distributed session stores (e.g. Redis).
2. **Strategy Pattern Context vs. Hardcoded Switch Statements:** Chose Strategy Pattern to allow new allocation algorithms to be plugged in cleanly without modifying core ticket creation logic.
3. **Application Events vs. External Message Broker:** Chose Spring Application Events for the Observer Pattern to avoid external infrastructure overhead while satisfying project scope.

---

<div style="page-break-after: always;"></div>

# CHAPTER 5 — OBJECT-ORIENTED ANALYSIS AND DESIGN (OOAD)

### 5.1 Object-Oriented Design Philosophy
The I-ITSM system models every domain entity, business workflow, and diagnostic mechanism as an interacting object with defined responsibilities, encapsulated data, and strict contracts.

### 5.2 Encapsulation
Encapsulation guarantees that an object's internal representation is hidden from the outside world, and that state modifications occur exclusively through controlled public methods that validate business invariants.
In `Incident.java`, all thirty persistent fields (`status`, `priority`, `resolutionDetails`, `assignedTechnician`, etc.) are declared with `private` access, accessed via getters/setters, and mutated through guarded service methods (`updateStatus`).

### 5.3 Abstraction
Abstraction focuses on presenting essential features while hiding underlying implementation complexity behind simplified interfaces.
`PriorityEngine` abstracts multi-variable arithmetic, normalization of user inputs, and score threshold mapping behind `PriorityEngine.determinePriority(impact, urgency, businessCriticality)`.

### 5.4 Inheritance
Inheritance models an "is-a" relationship, enabling subclasses to inherit attributes and behaviors from a generalized parent class.
The project implements a hierarchical custom exception architecture rooted in `java.lang.RuntimeException`:
`BaseCustomException` $\to$ `ResourceNotFoundException`, `InvalidStateTransitionException`, `TechnicianWorkloadExceededException`, `MissingSlaConfigurationException`.

### 5.5 Polymorphism
Polymorphism allows objects of different concrete classes to be treated through a shared interface, with the specific method implementation selected dynamically at runtime.
The system defines interface `AssignmentStrategy` implemented by `SkillBasedAssignmentStrategy` and `LeastLoadedAssignmentStrategy`. The `AssignmentStrategyContext` invokes `assignTechnician()` polymorphically.

### 5.6 Interfaces
Interfaces establish formal contracts that decouple class specifications from class implementations (`AssignmentStrategy`, `JpaRepository`).

### 5.7 Object Relationships: Composition, Aggregation, and Association
1. **Composition:** `Incident` owns its child `IncidentSla` record and `IncidentNote` entries (`CascadeType.ALL`, `orphanRemoval = true`).
2. **Aggregation:** `Technician` aggregates a set of `TechnicianSkill` entities.
3. **Association:** `Incident` is associated with `User` (reporter) and `Technician` (assignee).

### 5.8 Detailed Implemented Design Patterns
1. **Strategy Pattern:** Implemented in `AssignmentStrategyContext` delegating to `SkillBasedAssignmentStrategy` or `LeastLoadedAssignmentStrategy`.
2. **Observer Pattern:** Implemented using Spring Application Events: `IncidentCreatedEvent`, `IncidentStatusChangedEvent`, `IncidentAssignedEvent` published to `@Async` listeners `NotificationEventListener` and `AuditEventListener`.
3. **State Pattern / Finite State Machine:** Implemented via `VALID_TRANSITIONS` in `IncidentService` guarding state changes.
4. **Repository Pattern:** 15 Spring Data JPA repositories abstracting database access.
5. **Builder & Factory Patterns:** Lombok `@Builder` patterns on domain models and DTOs.

### 5.9 Application of SOLID Principles
All five SOLID principles (SRP, OCP, LSP, ISP, DIP) are rigorously observed throughout the architecture.

### 5.10 Maintainability and Extensibility Assessment
New assignment strategies, notification channels, or SLA evaluators can be added by implementing existing interfaces without altering core domain services.

### 5.11 Unified Modeling Language (UML) Diagrams
- **Figure 5.1:** Use Case Diagram (`docs/project-report/diagrams/use_case_diagram.svg`)
- **Figure 5.2:** Comprehensive Class Diagram (`docs/project-report/diagrams/class_diagram.svg`)

---

<div style="page-break-after: always;"></div>

# CHAPTER 6 — DATABASE DESIGN

### 6.1 Database Architectural Overview
The I-ITSM database is implemented on **PostgreSQL 18.7**, featuring a fully normalized, relational schema comprising **15 distinct tables**. The schema enforces referential integrity through foreign key constraints, cascading deletions where appropriate, unique indexing for natural keys, and optimized B-tree indexes.

### 6.2 Entity-Relationship (ER) Diagram
Please inspect Figure 6.1 (`docs/project-report/diagrams/er_diagram.svg`) for the complete Crow's Foot ER diagram depicting entities, attributes, primary keys, foreign keys, and cardinalities.

### 6.3 Relational Database Schema & Table Descriptions
The database comprises 15 normalized tables:
1. `users` (73 seeded records)
2. `technicians` (4 seeded records)
3. `technician_skills` (28 skill mappings)
4. `categories` (8 categories: Hardware, Software, Network, Database, Cloud, Security, Auth, Storage)
5. `it_services` (12 services: Payment Gateway, VPN, ERP, Identity Provider, etc.)
6. `incidents` (36 records)
7. `incident_notes` (14 records)
8. `incident_sla_records` (8 records)
9. `assignment_history` (16 records)
10. `sla_policies` (4 policies: P1 through P4)
11. `feedback` (4 ratings)
12. `audit_logs` (208 immutable log entries)
13. `email_logs` (66 simulated outbound emails)
14. `notifications` (314 in-app alerts)
15. `system_config` (Active assignment strategy setting)

### 6.4 Referential Integrity & Constraints
Relational integrity is enforced using foreign keys. Critical primary entity tables (`incidents`) protect dependent history through controlled foreign key constraints.
""")

print("Appended Chapters 3 to 6.")
