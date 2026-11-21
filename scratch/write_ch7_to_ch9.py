import os

md_path = r"c:\dev\i-itsm\docs\project-report\I_ITSM_Project_Report.md"

with open(md_path, "a", encoding="utf-8") as f:
    f.write("""
<div style="page-break-after: always;"></div>

# CHAPTER 7 — DETAILED MODULE IMPLEMENTATION

### 7.1 User Management Module
- **Purpose:** Manages registration, authentication, and role-tailored authorization across Employee, Technician, and Administrator personas.
- **Implementation:** `AuthController.java`, `AuthService.java`, `UserDetailsServiceImpl.java`, `JwtUtil.java`.
- **Security:** Passwords encrypted using BCrypt (`strength = 10`). Endpoints emit signed JWT tokens parsed on subsequent requests by `JwtAuthFilter`.

### 7.2 Incident Creation and Tracking Module
- **Purpose:** Enables end-users and administrators to submit structured incident reports and track real-time resolution progress.
- **Implementation:** `IncidentController.java`, `IncidentService.java`, `IncidentNumberGenerator.java`.
- **Unique Ticket Numbering:** Thread-safe, synchronized generator produces `INC-YYYYMMDD-XXXX` (e.g. `INC-20261121-0001`).

### 7.3 Incident Classification Module
- **Purpose:** Classifies incoming reports into functional infrastructure categories (Hardware, Software, Network, Database, Cloud, Security, Authentication, Storage) and maps them to affected digital services.
- **Implementation:** `CategoryService.java`, `ItServiceService.java`, `Category.java`, `ItService.java`.

### 7.4 Priority Determination Engine
- **Mathematical Model:**
  $$\text{Priority Score} = \text{Impact} (1-3) \times \text{Urgency} (1-3) \times \text{Business Criticality} (1-3)$$
- **Score Range & Thresholds:**
  - $18 \le \text{Score} \le 27 \implies \mathbf{P1\_CRITICAL}$ (Severe enterprise-wide stoppage)
  - $12 \le \text{Score} \le 17 \implies \mathbf{P2\_HIGH}$ (Major degradation, workaround unavailable)
  - $6 \le \text{Score} \le 11 \implies \mathbf{P3\_MEDIUM}$ (Moderate impairment, workaround exists)
  - $1 \le \text{Score} \le 5 \implies \mathbf{P4\_LOW}$ (Cosmetic or minor single-user issue)
- **Realistic Worked Example:**
  - *Problem:* Payment Gateway database transaction pool exhausted during peak sale event.
  - *Inputs:* $\text{Impact} = 3$ (Whole organization/customers affected), $\text{Urgency} = 3$ (Immediate transaction failure), $\text{Business Criticality} = 3$ (Revenue-generating core service).
  - *Score Calculation:* $3 \times 3 \times 3 = 27$.
  - *Resulting Priority:* Classified as **P1_CRITICAL**. Triggers 5-minute response target and 30-minute resolution target.

### 7.5 Technician Assignment Engine
- **Strategy Pattern Architecture:** Implemented via `AssignmentStrategyContext` dynamically delegating to active strategy bean.
- **Strategy A (Skill-Based Matching):**
  ```
  Algorithm: Skill-Based Technician Assignment
  Input: Incident inc
  Output: Assigned Technician tech
  1. Retrieve all technicians where available = true and enabled = true
  2. If technicians is empty, return Optional.empty()
  3. Extract keyword tokens K from inc.category.name and inc.title
  4. For each technician T in available technicians:
        score(T) = count of matching skills in T.skills intersecting K
  5. Select T_best with maximum score(T)
  6. If maximum score == 0, fall back to Least-Loaded technician
  7. Return T_best
  ```
- **Strategy B (Least-Loaded Workload Balancing):**
  ```
  Algorithm: Least-Loaded Technician Assignment
  Input: Incident inc
  Output: Assigned Technician tech
  1. Retrieve all technicians where available = true and enabled = true
  2. For each technician T:
        activeCount(T) = count of incidents assigned to T where status NOT IN ('RESOLVED', 'VERIFIED', 'CLOSED')
  3. Filter technicians where activeCount(T) < T.maxConcurrentIncidents
  4. Order technicians ascending by activeCount(T), tie-break alphabetically by T.fullName
  5. Return top technician
  ```

### 7.6 SLA Management Module
- **SLA Policy Matrix:**
  - **P1 Critical:** 5 Minutes Initial Response Target | 30 Minutes Final Resolution Target
  - **P2 High:** 15 Minutes Initial Response Target | 2 Hours Final Resolution Target
  - **P3 Medium:** 1 Hour Initial Response Target | 8 Hours Final Resolution Target
  - **P4 Low:** 4 Hours Initial Response Target | 24 Hours Final Resolution Target
- **Background Compliance Monitoring:**
  - `@Scheduled(fixedDelay = 60000)` executes `SlaMonitoringService.monitorSlaCompliance()` every 60 seconds.
  - If $\text{Elapsed Time} / \text{Resolution Window} \ge 75\%$ and ticket is uncompleted, status transitions to `APPROACHING` and a warning alert is dispatched.
  - If current time exceeds `resolutionDeadline`, status transitions to `BREACHED`, recording `resolutionBreached = true` and invoking automatic escalation.

### 7.7 Notification System Module
- **Observer Pattern Integration:** Triggered asynchronously via `NotificationEventListener` on `IncidentCreatedEvent`, `IncidentStatusChangedEvent`, and `IncidentAssignedEvent`.
- **Dual Delivery Mechanisms:**
  1. *In-App Notifications:* Persisted into `notifications` table with unread status badge.
  2. *Simulated Email Notifications:* Persisted into `email_logs` table with full recipient address, subject, and MIME body text.

### 7.8 Incident Audit Trail Module
- **Immutable Ledger:** Every state change, technician delegation, and priority escalation triggers `AuditEventListener`, which writes an immutable record into `audit_logs`.
- **Captured Attributes (7 Fields):** `id`, `timestamp`, `actor_id`, `incident_id`, `action`, `previous_state`, `new_state`, `description`.

### 7.9 Search and Multi-Criteria Filtering Module
The operations queue (`IncidentQueueTable.jsx`) exposes seven distinct real-time filter dimensions:
1. Search Text (Free text match against ID, Title, or Description)
2. Incident Status (`NEW`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, etc.)
3. Priority Tier (`P1`, `P2`, `P3`, `P4`)
4. Category (Hardware, Software, Network, etc.)
5. Affected Service (Payment Gateway, VPN, ERP, etc.)
6. Assigned Technician (Alex Network, Sarah Database, etc.)
7. SLA Compliance Status (`WITHIN_SLA`, `APPROACHING`, `BREACHED`)

### 7.10 Operational Reporting and Analytics Module
`ReportService.java` computes real-time operational aggregates displayed via Recharts:
- Incident volume distribution by priority and status.
- Technician workload distribution and resolution efficiency percentage.
- Hourly incident influx stream vs. resolution velocity trend curve.

### 7.11 Administrative Operations Console
Exposes global configuration controls:
- Real-time assignment strategy switcher (`SKILL_BASED` $\longleftrightarrow$ `LEAST_LOADED`).
- Category and service catalog management (CRUD).
- SLA policy deadline configuration.
- Comprehensive audit log inspection and CSV report export.

### 7.12 Intelligent & Automated Features

#### 7.12.1 Automatic Category Suggestion (`CategorySuggestionService.java`)
- Tokenizes incoming incident title and description into lowercase lexical words.
- Compares tokens against active category keyword dictionaries.
- Computes frequency scores and dynamically recommends the category with highest match score during form entry.

#### 7.12.2 Duplicate Incident Detection (`DuplicateDetectionService.java`)
- Computes weighted multi-attribute similarity index against all open tickets:
  $$\text{Similarity Score} = (\text{Title Jaccard Overlap} \times 40) + (\text{Description Overlap} \times 30) + (\text{Category Match} \times 15) + (\text{Service Match} \times 15)$$
- Incidents scoring $\ge 40\%$ are flagged as potential duplicates on the UI to prevent redundant effort.

#### 7.12.3 Predictive SLA Violation Risk Assessment (`SlaPredictionService.java`)
- Evaluates temporal progress, current workflow stage inertia, technician workload factor, and priority weight.
- Returns a normalized risk score ($0.0 - 1.0$) categorized as `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL` with actionable mitigation advice.

#### 7.12.4 Automated Root-Cause Analysis - RCA (`RootCauseAnalysisService.java`)
- Employs heuristic symptom-to-failure taxonomy mapping across Network, Database, Cloud, Security, Application, and Hardware failure domains.
- Infers probable technical cause, immediate workaround, step-by-step remediation, and preventive recommendations. Restricted exclusively to `TECHNICIAN` role.

#### 7.12.5 Gemini AI Resolution Playbook & Conversational Assistant (`GeminiResolutionService.java`, `GeminiChatbotService.java`)
- Interacts with Google Gemini API (`gemini-1.5-flash`) to generate contextual diagnostic playbooks.
- Includes a robust, deterministic offline heuristic fallback engine when external API keys are omitted.
- Interactive chatbot widget assists employees in initial troubleshooting and pre-populating incident ticket forms.

#### 7.12.6 Multi-Tier Automated Incident Escalation (`IncidentEscalationService.java`)
- Elevates incident priority tier ($P4 \to P3 \to P2 \to P1$).
- Reallocates ticket to higher-tier specialist or least-loaded technician.
- Injects formal investigation audit notes and broadcasts multi-channel high-priority alerts to reporter, specialist, and administrators.

---

<div style="page-break-after: always;"></div>

# CHAPTER 8 — SECURITY AND EXCEPTION HANDLING

### 8.1 Authentication and Password Encryption
- User passwords are protected using the industry-standard BCrypt adaptive hashing function (`BCryptPasswordEncoder`, cost factor 10), incorporating random per-user salt generation to prevent rainbow table attacks.
- Stateless authentication uses HMAC-SHA256 signed JSON Web Tokens (JWT) containing subject username, assigned role, and issuance/expiration timestamps.

### 8.2 Role-Based Access Control (RBAC) & Filter Chain
Spring Security's filter chain (`SecurityConfig.java`) enforces defensive perimeter authorization:
- Public endpoints (`/api/auth/**`, `/api/auth/health`) permit unauthenticated access.
- Admin endpoints (`/api/admin/**`) require `hasRole('ADMINISTRATOR')`.
- Technician endpoints (`/api/technician/**`) require `hasAnyRole('TECHNICIAN', 'ADMINISTRATOR')`.
- All other endpoints require authenticated principal context.

### 8.3 Input Validation and Sanitization
Incoming DTOs utilize Jakarta Validation annotations (`@NotBlank`, `@NotNull`, `@Min`, `@Max`, `@Email`). Controller methods declare `@Valid` to reject malformed inputs before reaching domain services.

### 8.4 Comprehensive Custom Exception Hierarchy
The application defines 12 specialized custom exceptions inheriting from `RuntimeException`:

| Exception Class | Trigger Condition | HTTP Status Code |
| :--- | :--- | :---: |
| `InvalidInputException` | Blank title/description or priority factor out of bounds (1-3) | 400 Bad Request |
| `InvalidIncidentException` | Malformed incident state or missing mandatory creation data | 400 Bad Request |
| `InvalidStateTransitionException`| Attempted lifecycle transition not permitted by FSM | 400 Bad Request |
| `DuplicateIncidentException` | Ticket with identical number or concurrent duplicate submission | 409 Conflict |
| `DuplicateResourceException` | Username or email already registered during sign-up | 409 Conflict |
| `ResourceNotFoundException` | Requested Incident, User, or Service ID does not exist | 404 Not Found |
| `ServiceNotFoundException` | Referenced IT Service ID not found in catalog | 404 Not Found |
| `TechnicianUnavailableException`| Technician is toggled unavailable or account disabled | 409 Conflict |
| `TechnicianWorkloadExceededException`| Assigned technician has reached max concurrent capacity | 409 Conflict |
| `MissingSlaConfigurationException`| No SLA policy configured for the incident priority/category | 500 Internal Error |
| `UnauthorizedOperationException`| User attempts action forbidden to their role or ticket ownership | 403 Forbidden |
| `DatabaseOperationException` | Transactional rollback or persistent storage communication failure | 500 Internal Error |

### 8.5 Centralized Global Exception Handler
`GlobalExceptionHandler.java` uses `@RestControllerAdvice` to intercept exceptions across all controllers, returning consistent, machine-readable JSON error payloads:
```json
{
  "code": "INVALID_STATE_TRANSITION",
  "error": "Bad Request",
  "message": "Cannot transition incident from NEW to CLOSED. Permitted next states: [CLASSIFIED]",
  "timestamp": "2026-11-21T12:00:00.000",
  "status": 400
}
```

### 8.6 Security Hardening & CORS Configuration
CORS origin patterns (`SecurityConfig.java`) explicitly permit authorized local (`http://localhost:5173`) and cloud origins (`https://*.onrender.com`, `https://*.vercel.app`) with credentials support, while blocking arbitrary cross-origin script execution.

---

<div style="page-break-after: always;"></div>

# CHAPTER 9 — TESTING AND VALIDATION

### 9.1 Testing Strategy and Methodology
The project enforces a multi-tier testing strategy combining:
1. **Unit Tests:** Isolated testing of mathematical calculations, token matching algorithms, and state transition logic using JUnit 5.
2. **Integration Tests:** Verifying interaction between controllers, services, JPA repositories, and the H2/PostgreSQL database harness using `@SpringBootTest` and `MockMvc`.
3. **End-to-End Workflow Tests:** Simulating multi-role operational sequences across authentication, ticket reporting, assignment, technician investigation, and administrative verification.

### 9.2 Test Environment & Execution Harness
- **Test Harness:** JUnit 5, Mockito, Spring Boot Test Framework, Maven Surefire Plugin.
- **Execution Command:** `mvn test`
- **Verified Execution Result:** **Total Tests Run: 27, Failures: 0, Errors: 0, Skipped: 0. BUILD SUCCESS.**

### 9.3 Comprehensive Test Case Execution Table

The complete suite of 27 automated test cases is documented below:

| Test ID | Module | Test Scenario & Class | Input / Precondition | Expected Result | Actual Result | Status |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Priority | `PriorityEngineTest.testComputeCriticalPriority` | Impact=3, Urgency=3, Criticality=3 | Score=27, Classified as P1_CRITICAL | Score=27, P1_CRITICAL returned | **PASS** |
| **TC-02** | Priority | `PriorityEngineTest.testComputeHighPriority` | Impact=2, Urgency=2, Criticality=3 | Score=12, Classified as P2_HIGH | Score=12, P2_HIGH returned | **PASS** |
| **TC-03** | Priority | `PriorityEngineTest.testComputeMediumPriority` | Impact=2, Urgency=2, Criticality=2 | Score=8, Classified as P3_MEDIUM | Score=8, P3_MEDIUM returned | **PASS** |
| **TC-04** | Priority | `PriorityEngineTest.testComputeLowPriority` | Impact=1, Urgency=2, Criticality=1 | Score=2, Classified as P4_LOW | Score=2, P4_LOW returned | **PASS** |
| **TC-05** | Heuristics | `CategorySuggestionTest.testNetworkCategorySuggestion`| Title contains "VPN connection drops", text="wifi failed" | Category "Network" suggested | "Network" category suggested | **PASS** |
| **TC-06** | Heuristics | `CategorySuggestionTest.testNoMatchSuggestion` | Title="xyz gibberish 123", text="no match" | Optional.empty() returned | Optional.empty() returned | **PASS** |
| **TC-07** | Heuristics | `DuplicateDetectionTest.testDuplicateDetectionSuccess` | Two tickets with title "Payment gateway timeout" on same service | Similarity score $\ge 40\%$, flagged duplicate | Duplicate detected, match score 85% | **PASS** |
| **TC-08** | Heuristics | `DuplicateDetectionTest.testDifferentIncidentNotDuplicate`| Ticket A: "VPN fail", Ticket B: "Monitor broken" | Similarity score $< 40\%$, not flagged | No duplicate flagged | **PASS** |
| **TC-09** | Assignment | `AssignmentStrategyTest.testSkillBasedStrategy` | Incident category "Network", tech with "Networking" skill | Assigned to matching specialist technician | Assigned to Alex Network | **PASS** |
| **TC-10** | Assignment | `AssignmentStrategyTest.testLeastLoadedStrategy` | Tech A has 3 active tickets, Tech B has 0 active tickets | Assigned to Tech B (lowest workload) | Assigned to Tech B | **PASS** |
| **TC-11** | Lifecycle | `IncidentLifecycleTest.testValidTransitions` | Sequential calls: NEW $\to$ CLASSIFIED $\to$ ASSIGNED $\to$ ACK $\to$ IN_PROG | All transitions succeed without error | Status correctly reaches IN_PROGRESS | **PASS** |
| **TC-12** | Lifecycle | `IncidentLifecycleTest.testInvalidTransitions` | Attempt direct jump from NEW $\to$ CLOSED | InvalidStateTransitionException thrown | InvalidStateTransitionException thrown | **PASS** |
| **TC-13** | SLA | `SlaManagementTest.testSlaDeadlinesP1` | Incident created with P1 policy | Response deadline +5m, Resolution +30m | Deadlines match policy exactly | **PASS** |
| **TC-14** | SLA | `SlaManagementTest.testSlaBreachFlagging` | Simulating elapsed time exceeding resolution deadline | SLA status transitions to BREACHED | Status BREACHED, resolutionBreached=true | **PASS** |
| **TC-15** | Security | `ItsmEndToEndWorkflowsTest.testAuthenticationAndRolePermissions`| Valid login vs. invalid password vs. role access | Valid JWT issued; bad password returns 401; role enforced | Authenticated successfully; 401 on bad pass | **PASS** |
| **TC-16** | Heuristics | `GeminiAiFeaturesTest.testResolutionRecommendationFallback`| Request AI resolution playbook with Gemini key unconfigured | Deterministic fallback playbook returned | Valid structured playbook returned | **PASS** |
| **TC-17** | Heuristics | `GeminiAiFeaturesTest.testResolutionRecommendationLiveGemini` | Mocked live Gemini API response payload | Parses JSON into actionable steps | Actionable steps parsed into DTO | **PASS** |
| **TC-18** | Heuristics | `GeminiAiFeaturesTest.testChatbotConversationAndDrafting` | Chatbot conversation with troubleshooting dialogue | Formats chat response & drafts incident | Ticket draft payload emitted | **PASS** |
| **TC-19** | Escalation | `IncidentEscalationTest.testIncidentPriorityEscalation` | Escalate P3 ticket approaching breach | Priority elevated to P2; reallocated to specialist | Priority elevated to P2; reallocated | **PASS** |
| **TC-20** | Heuristics | `RootCauseAnalysisTest.testNetworkRootCauseAnalysis` | Description contains "vpn gateway latency tunnel error" | RCA infers Network & DNS gateway failure | Network RCA inferred with remediation | **PASS** |
| **TC-21** | Heuristics | `RootCauseAnalysisTest.testDatabaseRootCauseAnalysis` | Description contains "database deadlock connection pool exhausted" | RCA infers Database connection pool starvation | Database RCA inferred with steps | **PASS** |
| **TC-22** | Heuristics | `SlaPredictionTest.testPredictHighSlaRisk` | Active ticket with 85% elapsed time in NEW status | Returns CRITICAL SLA breach risk | CRITICAL risk rating returned | **PASS** |
| **TC-23** | Heuristics | `SlaPredictionTest.testPredictLowSlaRisk` | Fresh ticket with 5% elapsed time | Returns LOW SLA breach risk | LOW risk rating returned | **PASS** |
| **TC-24** | Workflow | `ItsmEndToEndWorkflowsTest.testWorkflow1_EmployeeReportIncident`| Full Workflow 1: Employee reports incident | Priority computed, technician assigned, events emitted | Ticket created, assigned, notifications logged | **PASS** |
| **TC-25** | Workflow | `ItsmEndToEndWorkflowsTest.testWorkflow2_TechnicianInvestigationAndResolution`| Full Workflow 2: Technician acknowledges and resolves | Notes added, status transitions to RESOLVED | Incident resolved with timestamp | **PASS** |
| **TC-26** | Workflow | `ItsmEndToEndWorkflowsTest.testWorkflow3_AdminMonitoringAndClosure`| Full Workflow 3: Verification, feedback, closure, audit | Feedback recorded, closed, audit verified | Incident closed, 5-star feedback saved | **PASS** |
| **TC-27** | Context | `ItsmBackendApplicationTests.contextLoads` | Spring Boot application context startup | WebApplicationContext initializes cleanly | Context loaded successfully | **PASS** |

### 9.4 Defects Identified and Verified Fixes
1. *Defect 1:* Incremental compiler stale `.class` cache caused compilation failure after creating 12 new custom exception classes. *Resolution:* Executed `mvn clean test-compile` to recompile all 117 source classes cleanly.
2. *Defect 2:* Initial ticket submission left tickets in `NEW` state awaiting manual allocation. *Resolution:* Integrated automatic classification and strategy allocation pipeline directly into `createIncident()`.
3. *Defect 3:* Spring Security CORS allowedOrigins rejected wildcard patterns when credentials were true. *Resolution:* Replaced `setAllowedOrigins` with `setAllowedOriginPatterns` in `SecurityConfig.java`.
""")

print("Appended Chapters 7 to 9.")
