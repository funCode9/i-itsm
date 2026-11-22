# Technology Selection Justification

**Course:** CS F213 / MAC F212 — Object Oriented Programming  
**Department:** Department of Computer Science & Information Systems, BITS Pilani  
**Project:** Intelligent IT Service Management & Incident Resolution System (I-ITSM)  
**Group Number:** 36  
**Faculty:** Prof. Subhrakanta Panda  
**Submission Date:** 22/11/2026  

---

This document outlines the architectural decisions and technology stack selections for the **Intelligent IT Service Management & Incident Resolution System (I-ITSM)**.

---

## 1. Architectural Style: Layered Full-Stack Application

### Decision
A layered full-stack architecture comprising a React Single Page Application (SPA) frontend, a Spring Boot REST API backend, and a PostgreSQL relational database.

### Justification
- **Cohesion and Separation of Concerns:** Decouples user presentation from core domain business rules and persistence mechanics.
- **Maintainability:** Standard MVC/Service/Repository patterns facilitate easy testing, debugging, and academic code defense.
- **Avoidance of Distributed Complexity:** A single deployable Spring Boot backend avoids unnecessary microservices overhead (distributed transactions, discovery services, network latency) while remaining cleanly modularized.

---

## 2. Backend Stack

### Java 21 LTS
- **Long-Term Support:** Modern Java LTS version with enhanced performance, modern switch pattern matching, and record classes.
- **Strong Typing & OOP Foundations:** Ideal for demonstrating core OOP pillars: encapsulation, inheritance, polymorphism, interfaces, and design patterns.

### Spring Boot 4.1.2 & Spring Framework
- **Spring Data JPA & Hibernate 7:** Simplifies data access, object-relational mapping, and database schema migrations (`ddl-auto=update`).
- **Spring Security 7 & JJWT:** Provides industry-standard authentication filters, stateless session management, role-based method authorization (`@PreAuthorize`), and BCrypt password encryption.
- **Spring ApplicationEventPublisher:** Provides a production-grade implementation of the GoF Observer pattern without third-party message brokers.
- **Spring Task Scheduling (`@Scheduled`):** Enables native, pooled periodic execution for the SLA violation monitoring daemon.

---

## 3. Database: PostgreSQL 18.6

### Justification
- **Enterprise Relational Integrity:** Strong ACID compliance, robust foreign key enforcement, uniqueness constraints, and transactional consistency required for an ITSM platform.
- **Complex Querying Capabilities:** Supports aggregate queries, sub-queries, and workload counts efficiently.
- **Compatibility:** Fully supported by Hibernate 7 and standard JDBC drivers.

---

## 4. Frontend Stack

### React 18 & Vite 6
- **Component-Driven UI:** Enables reusable UI building blocks (layout, sidebar, status chips, tables, modals).
- **Fast Development Experience:** Vite provides instantaneous Hot Module Replacement (HMR) and optimized Rollup production bundling.

### Material UI (MUI v6)
- **Enterprise Design System:** Clean, accessible, and polished interface meeting professional enterprise standards out of the box.
- **Pre-Built Interactive Controls:** Sliders for priority factor selection, dialogs, drawers, badges, and responsive grids.

### Axios with Interceptors
- Centralized HTTP client automatically injecting JWT Bearer tokens in request headers and handling global HTTP 401 redirection.

### Recharts
- Composable charting library built on React components and SVG, powering the administrator analytical reports (status breakdown, priority distribution, technician workload).

---

## 5. Version Control: Git
- Preserves working checkpoints at stable milestones.
- Excludes sensitive credentials, build artifacts, and node modules via `.gitignore`.
