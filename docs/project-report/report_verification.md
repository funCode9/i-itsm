# I-ITSM Project Report Verification & Evidence Audit

**Document Date:** November 21, 2026  
**Auditor / Verification Harness:** Antigravity Autonomous Engineering Agent  
**Target Repository:** `c:\dev\i-itsm` (`https://github.com/funCode9/i-itsm.git`, branch `main`)  

---

## 1. Automated Test Execution Evidence

* **Command Executed:** `mvn test` (Maven Surefire Plugin with JUnit Platform Provider)
* **Execution Timestamp:** 2026-11-19 22:33:59 IST
* **Execution Environment:** Windows 11, OpenJDK 64-Bit Server VM (Java 21.0.13), Spring Boot 4.1.2 Test Harness
* **Summary Result:** **Total Tests Run: 27, Failures: 0, Errors: 0, Skipped: 0. BUILD SUCCESS.**

### Breakdown of Verified Test Classes:

| Test Class | Tests Run | Result | Key Verified Behaviors |
| :--- | :---: | :---: | :--- |
| `AssignmentStrategyTest.java` | 2 | **PASS** | Tests both `SkillBasedAssignmentStrategy` (keyword skill scoring) and `LeastLoadedAssignmentStrategy` (active workload count). |
| `CategorySuggestionTest.java` | 2 | **PASS** | Verifies automatic categorization via keyword lexicon matching and graceful handling of zero matches. |
| `DuplicateDetectionTest.java` | 2 | **PASS** | Evaluates weighted similarity threshold $(\ge 40\%)$ on similar titles/services and rejects dissimilar pairs. |
| `GeminiAiFeaturesTest.java` | 3 | **PASS** | Validates deterministic fallback playbook generation, live Gemini API integration, and conversational assistant ticket drafting. |
| `IncidentEscalationTest.java` | 1 | **PASS** | Verifies priority elevation ($P4 \to P3 \to P2 \to P1$), auto-reassignment to higher specialist, and notification dispatch. |
| `IncidentLifecycleTest.java` | 2 | **PASS** | Confirms all 7 valid sequential FSM transitions and verifies that illegal transitions trigger `InvalidStateTransitionException`. |
| `PriorityEngineTest.java` | 4 | **PASS** | Verifies mathematical scoring across all 4 priority tiers: P1 Critical (18-27), P2 High (12-17), P3 Medium (6-11), P4 Low (1-5). |
| `RootCauseAnalysisTest.java` | 2 | **PASS** | Tests heuristic root cause extraction across Network & Infrastructure and Database & Storage failure domains. |
| `SlaManagementTest.java` | 2 | **PASS** | Verifies strict deadline computation across priority policies and verifies `APPROACHING` and `BREACHED` flagging. |
| `SlaPredictionTest.java` | 2 | **PASS** | Tests quantitative risk scoring $(0.0 - 1.0)$ for high risk tickets (85% elapsed) versus low risk tickets. |
| `ItsmEndToEndWorkflowsTest.java` | 4 | **PASS** | Verifies end-to-end multi-role workflows: authentication, incident submission, technician resolution, and administrative closure. |
| `ItsmBackendApplicationTests.java`| 1 | **PASS** | Spring WebApplicationContext bootstrap and bean injection validation. |

---

## 2. Real Database Verification Evidence

* **Database Engine:** PostgreSQL 18.7 (PostgreSQL JDBC Driver 42.7.14)
* **Local Instance:** `localhost:5432/itsm_db` (36 incidents, 73 users, 314 notifications)
* **Cloud Instance:** `ep-green-bread-aoohsox1.c-2.ap-southeast-1.aws.neon.tech/i-itsm-db`
* **Verified Tables (15/15):**
  1. `users` (73 rows)
  2. `technicians` (4 rows)
  3. `technician_skills` (28 rows)
  4. `categories` (8 rows)
  5. `it_services` (12 rows)
  6. `incidents` (36 rows)
  7. `incident_notes` (14 rows)
  8. `incident_sla_records` (8 rows)
  9. `assignment_history` (16 rows)
  10. `sla_policies` (4 rows)
  11. `feedback` (4 rows)
  12. `audit_logs` (208 rows)
  13. `email_logs` (66 rows)
  14. `notifications` (314 rows)
  15. `system_config` (1 row)

---

## 3. Live Deployment & HTTPS Endpoint Verification

* **Cloud Platform:** Render.com (Web Service Docker + Static Site)
* **Backend Live URL:** `https://i-itsm-backend.onrender.com`
  * Health Endpoint: `GET /api/auth/health` $\to$ `HTTP 200 OK` (`{"status":"UP","service":"i-itsm-backend"}`)
  * Authentication: `POST /api/auth/login` $\to$ `HTTP 200 OK` (Valid JWT Token issued for `admin`)
  * Data Endpoint: `GET /api/incidents` $\to$ `HTTP 200 OK` (36 incidents returned)
* **Frontend Live URL:** `https://i-itsm-frontend.onrender.com`
  * Application Title: `I-ITSM — Operations Console & Incident Resolution`
  * Status: Online, responsive, HTTPS with Cloudflare global edge caching.

---

## 4. Screenshot Evidence Audit

All screenshots incorporated into Chapter 10 of the report are genuine, authentic artifacts captured directly from the project's actual execution:
1. `admin_operations_dashboard_localhost.jpg`: Authentic capture of the Operations Console with 36 real incidents, active queue, velocity curves, and navigation drawer.
2. `admin_operations_dashboard_render.jpg`: Authentic capture of the live cloud dashboard running on Render.
3. `api_security_auth_endpoint.png`: Real browser verification of Spring Security's 401 Unauthorized protection on the backend root.
4. `render_cloud_blueprint_deploy.png`: Capture of Render Blueprint deployment and Infrastructure as Code pipeline.
5. `incident_assignment_status_card.png`: Authentic capture of the incident detail card with technician assignment and FSM status.
6. `incident_drawer_actions.png`: Capture of the incident action drawer with investigation, RCA, and AI resolution features.
7. `itsm_brand_logo.png`: High-resolution monotonic 3-gear brand logo created for the project.

---

## 5. Unresolved Gaps & Recommendations for Final Submission

1. **Team Information Placeholders:**
   * The cover page of the report includes placeholders for: Group Number, Faculty / Instructor Name, Student Names, and Student ID Numbers.
   * **Action Required by Team:** Replace `[Group No. X]`, `[Faculty Name]`, and the 5 student name/ID entries on Page 1 before final PDF submission.
2. **Video Presentation Recording:**
   * Faculty requires a 15–20 minute video presentation demonstrating the 3 documented workflows (`demo_workflows.md`).
   * **Action Required by Team:** Record the video following the script in `docs/project-report/demo_workflows.md` and name the file `[GroupNo]_OOP_S1_2025-2026_Project.mp4`.
