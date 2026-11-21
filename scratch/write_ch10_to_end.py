import os

md_path = r"c:\dev\i-itsm\docs\project-report\I_ITSM_Project_Report.md"

with open(md_path, "a", encoding="utf-8") as f:
    f.write("""
<div style="page-break-after: always;"></div>

# CHAPTER 10 — RESULTS AND APPLICATION SCREENSHOTS

### 10.1 System Demonstration Overview
The I-ITSM application has been demonstrated across local development environments and verified in live public cloud deployment (`https://i-itsm-frontend.onrender.com`). The system demonstrates complete functional alignment with faculty requirements, delivering role-tailored dashboards, real-time analytics, automated technician dispatching, heuristic diagnostics, and end-to-end incident resolution.

### 10.2 Role-Based User Experience Screens

#### 10.2.1 Administrator Operations Console
The Operations Console serves as the operational command center for IT Managers. It aggregates live ticket volume across status queues, displays priority breakdowns, highlights SLA breaches, tracks incoming ticket generation velocity curves, and allows administrators to switch the active assignment strategy dynamically in real time.

![Figure 10.1: Operations Health Console on Localhost Environment](screenshots/admin_operations_dashboard_localhost.jpg)
*Figure 10.1: Operations Health Console on Localhost Environment displaying 36 Total Incidents, 13 Active Queue items, 5 P1 Critical tickets, 23 Resolved tickets, 4 SLA Breaches, and real-time generation velocity curves.*

![Figure 10.2: Live Production Operations Console Deployed on Cloud Infrastructure](screenshots/admin_operations_dashboard_render.jpg)
*Figure 10.2: Live Production Operations Console deployed on Render.com connected to Neon Cloud PostgreSQL, reflecting real-time synchronized production metrics.*

#### 10.2.2 Brand Identity & Security Endpoints
The platform incorporates custom branding with a high-contrast monotonic 3-gear logo, and enforces perimeter Spring Security protections.

![Figure 10.3: High-Resolution Brand Identity Logo](screenshots/itsm_brand_logo.png)
*Figure 10.3: Official I-ITSM monotonic 3-gear brand identity logo used across login, navigation drawer, and favicon.*

![Figure 10.4: Stateless Spring Security JWT Authentication Endpoint Protection](screenshots/api_security_auth_endpoint.png)
*Figure 10.4: Browser verification of Spring Security's HTTP 401 Unauthorized protection on the backend API root (`https://i-itsm-backend.onrender.com`), confirming defense-in-depth perimeter security.*

#### 10.2.3 Incident Detail, Investigation Actions, RCA & AI Playbooks
The incident detail drawer provides technicians with full investigation capabilities, including automated root-cause analysis, Gemini AI resolution playbooks, internal work notes, and lifecycle state transition triggers.

![Figure 10.5: Incident Detail Drawer with Investigation Actions](screenshots/incident_drawer_actions.png)
*Figure 10.5: Incident Drawer interface featuring Root-Cause Analysis (RCA), AI Resolution Playbook generation, investigation note authoring, and lifecycle action buttons.*

![Figure 10.6: Real-time Incident Lifecycle Status and Technician Assignment Card](screenshots/incident_assignment_status_card.png)
*Figure 10.6: Real-time incident assignment status card showing assignee allocation and current FSM lifecycle state.*

![Figure 10.7: Render Blueprint Cloud Deployment Pipeline](screenshots/render_cloud_blueprint_deploy.png)
*Figure 10.7: Render Blueprint Infrastructure-as-Code pipeline deploying containerized Spring Boot backend and React static site.*

### 10.3 Three End-to-End Recorded Demonstration Workflows
The application natively supports and demonstrates the three complete end-to-end workflows required for the university evaluation video presentation:
1. **Workflow 1: Incident Reporting, Automated Prioritization, Strategy Assignment & Notification:**
   - Employee logs in $\to$ submits payment gateway outage $\to$ Priority Engine calculates $3 \times 3 \times 3 = 27 \implies P1\_CRITICAL$ $\to$ Strategy context executes Skill-Based assignment $\to$ Allocates ticket to Alex Network $\to$ In-app alert and email log generated.
2. **Workflow 2: Technician Workspace, SLA Monitoring, Heuristic RCA & Resolution:**
   - Technician logs in $\to$ opens P1 ticket $\to$ reviews SLA countdown timer $\to$ acknowledges ticket (status `ACKNOWLEDGED`) $\to$ inspects automated Root-Cause Analysis (identifies Database connection pool exhaustion) $\to$ applies Gemini AI playbook $\to$ adds work notes $\to$ marks ticket `RESOLVED` with resolution notes.
3. **Workflow 3: Duplicate Incident Handling, SLA Escalation, Verification, Feedback & Analytics:**
   - Employee submits duplicate ticket (flagged by Duplicate Detection Service) $\to$ Technician escalates approaching ticket ($P3 \to P2$, specialist reassignment) $\to$ Original employee reviews resolution $\to$ verifies and closes ticket (`CLOSED`) $\to$ submits 5-star feedback rating $\to$ Administrator reviews updated analytics in Operations Console.

---

<div style="page-break-after: always;"></div>

# CHAPTER 11 — CHALLENGES, LIMITATIONS AND FUTURE SCOPE

### 11.1 Technical Challenges Encountered
1. **Circular Object Serialization in JPA:** Bidirectional JPA relationships between `Incident`, `IncidentSla`, and `User` initially produced recursive JSON serialization loops. *Solution:* Applied Jackson `@JsonIgnoreProperties` and `@JsonProperty` annotations to break infinite serialization recursion.
2. **CORS with Credentials on Cloud Platforms:** Browser security policies reject wildcard `*` headers when requests include authentication credentials (`allowCredentials=true`). *Solution:* Implemented `setAllowedOriginPatterns` in Spring Security to support dynamic regex origins (`https://*.onrender.com`, `https://*.vercel.app`).
3. **Database Port Conflicts & Cloud Seeding:** Transitioning from local developer machines to cloud deployment required migrating 15 relational tables with strict foreign key dependencies. *Solution:* Utilized standard `pg_dump` with deferred constraint generation (`ALTER TABLE ... ADD CONSTRAINT`) to import full relational schemas and seed data into Neon Cloud PostgreSQL.

### 11.2 Engineering Trade-offs
- **In-Memory Heuristics vs. Distributed ML Pipelines:** Implemented token lexicon and Jaccard-based algorithms rather than hosting dedicated PyTorch/TensorFlow microservices to keep the project self-contained, high-performing, and free of heavyweight external dependencies.
- **In-Process Spring Events vs. Kafka/RabbitMQ:** Utilized Spring Application Events to maintain zero external messaging infrastructure while fulfilling the Observer Pattern contract.

### 11.3 Current System Limitations
- External email delivery is simulated and logged to the database rather than transmitting live SMTP emails through a third-party relay (e.g. SendGrid or Amazon SES).
- Voice and SMS telephony integrations are not connected to physical telecom gateways.

### 11.4 Scalability Considerations
- **Stateless Application Tier:** The backend maintains zero session state, permitting horizontal auto-scaling across multiple container instances behind a reverse proxy.
- **Connection Pooling:** HikariCP connection pooling maintains optimal database socket utilization under high concurrent load.
- **Database Indexing:** High-frequency query columns (`incident_number`, `status`, `priority`, `created_at`) are indexed using B-trees.

### 11.5 Future Enhancements
- Integration of live WebSockets (STOMP) for push-driven UI updates without polling.
- Advanced machine learning classification using fine-tuned transformer models for multi-lingual ticket categorization.
- Mobile native application development using Flutter / React Native.

---

<div style="page-break-after: always;"></div>

# CHAPTER 12 — CONCLUSION

### 12.1 Project Summary
The Intelligent IT Service Management & Incident Resolution System (I-ITSM) has been successfully designed, implemented, and deployed as a complete enterprise-grade software solution. By bridging rigorous Object-Oriented Programming principles with modern cloud technologies, the platform manages the complete incident lifecycle from initial submission to final verification and closure.

### 12.2 Fulfillment of Educational & Technical Objectives
- **Object-Oriented Design Mastery:** Demonstrated genuine, defensible implementations of Encapsulation, Abstraction, Inheritance, Polymorphism, and multiple GoF design patterns (Strategy, Observer, State, Repository, Builder).
- **Architecture & Full-Stack Rigor:** Engineered a 4-tier layered architecture combining Java 21, Spring Boot 4, React 18, PostgreSQL 18, and Docker containerization.
- **Intelligent Engineering:** Implemented six automated and heuristic features that transform reactive IT ticket dispatching into an intelligent operational system.
- **Comprehensive Quality Assurance:** Validated through 27 automated JUnit 5 tests (100% pass rate) and successful live deployment on public cloud infrastructure.

### 12.3 Reflection on Object-Oriented Engineering
This project reinforces that Object-Oriented Programming is not merely a syntactic style, but a powerful paradigm for managing real-world software complexity. Designing around clear interface contracts, polymorphic algorithms, and decoupled observers produces software that is inherently maintainable, extensible, and resilient to change.

---

<div style="page-break-after: always;"></div>

# REFERENCES

1. Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley.
2. Martin, R. C. (2002). *Agile Software Development, Principles, Patterns, and Practices*. Prentice Hall.
3. Bloch, J. (2018). *Effective Java* (3rd ed.). Addison-Wesley Professional.
4. Walls, C. (2022). *Spring in Action* (6th ed.). Manning Publications.
5. Information Technology Infrastructure Library (ITIL 4). (2019). *ITIL Foundation: ITIL 4 Edition*. AXELOS Global Best Practice.
6. PostgreSQL Global Development Group. (2024). *PostgreSQL 18 Documentation*. https://www.postgresql.org/docs/
7. React Documentation. (2024). *React: The Library for Web and Native User Interfaces*. https://react.dev/
8. Spring Framework Documentation. (2024). *Spring Boot Reference Guide v4.1.2*. https://docs.spring.io/spring-boot/

---

<div style="page-break-after: always;"></div>

# APPENDICES

### Appendix A: Project URLs & Source Code Repository
- **Source Code Repository:** `https://github.com/funCode9/i-itsm.git` (Branch: `main`)
- **Live Deployed Frontend Application:** `https://i-itsm-frontend.onrender.com`
- **Live Deployed Backend API:** `https://i-itsm-backend.onrender.com`
- **Cloud Database:** Neon Serverless PostgreSQL (`ep-green-bread-aoohsox1.c-2.ap-southeast-1.aws.neon.tech/i-itsm-db`)
- **Default Cloud Administrator Credentials:** `admin` / `Admin@123`

### Appendix B: Complete REST API Endpoint Specification

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user and issue JWT bearer token |
| `GET` | `/api/auth/health` | Public | Health probe returning service UP status |
| `POST` | `/api/incidents` | All Authenticated | Submit new incident with auto-priority and strategy assignment |
| `GET` | `/api/incidents` | All Authenticated | Query all incidents with multi-criteria filtering |
| `GET` | `/api/incidents/my` | Employee | Query incidents reported by the authenticated user |
| `GET` | `/api/incidents/{id}` | All Authenticated | Retrieve complete incident details, SLA, and notes |
| `PATCH`| `/api/incidents/{id}/status` | Technician / Admin | Transition incident lifecycle status with validation |
| `POST` | `/api/incidents/{id}/classify` | Technician / Admin | Manually classify category, service, and technician |
| `POST` | `/api/incidents/{id}/assign/{techId}` | Admin | Reassign ticket to specific technician |
| `POST` | `/api/incidents/{id}/notes` | All Authenticated | Append work note or public investigation note |
| `POST` | `/api/incidents/{id}/escalate` | Technician / Admin | Manually trigger multi-tier incident escalation |
| `GET` | `/api/incidents/suggest-category` | All Authenticated | Intelligent heuristic category recommendation |
| `GET` | `/api/incidents/check-duplicates` | All Authenticated | Intelligent duplicate incident detection |
| `GET` | `/api/incidents/{id}/sla-prediction` | Technician / Admin | Predictive SLA breach risk assessment gauge |
| `GET` | `/api/incidents/{id}/root-cause` | Technician / Admin | Automated heuristic root-cause analysis (RCA) |
| `GET` | `/api/incidents/{id}/ai-resolution` | Technician / Admin | Gemini AI contextual resolution playbook |
| `POST` | `/api/incidents/{id}/ai-resolution/apply-note` | Technician / Admin | Auto-inject AI playbook recommendation as note |
| `GET` | `/api/technician/my-incidents` | Technician | Retrieve assigned incidents queue for technician |
| `PATCH`| `/api/technician/{id}/availability` | Technician / Admin | Toggle technician active dispatch availability |
| `GET` | `/api/admin/metrics` | Administrator | Retrieve global operations health metrics |
| `GET` | `/api/admin/strategy` | Administrator | Get active technician assignment strategy |
| `POST` | `/api/admin/strategy` | Administrator | Switch active assignment strategy at runtime |
| `GET` | `/api/audit` | Administrator | Retrieve paginated immutable audit log trail |
| `GET` | `/api/notifications` | All Authenticated | Retrieve user notifications and unread badge count |
| `PATCH`| `/api/notifications/{id}/read`| All Authenticated | Mark notification alert as read |
| `POST` | `/api/feedback` | Employee | Submit 1-5 star customer satisfaction rating |

### Appendix C: Demonstration Workflow Checklist & Video Script
Please refer to the standalone presentation document `docs/project-report/demo_workflows.md` for the exact minute-by-minute speaking script and workflow demonstration checklist.
""")

print("Successfully wrote complete I_ITSM_Project_Report.md!")
