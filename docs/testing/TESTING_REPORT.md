# I-ITSM Automated Testing Report

**Course:** CS F213 / MAC F212 — Object Oriented Programming  
**Department:** Department of Computer Science & Information Systems, BITS Pilani  
**Project:** Intelligent IT Service Management & Incident Resolution System (I-ITSM)  
**Group Number:** 36  
**Submission Date:** 22/11/2026  
**Test Framework:** JUnit 5 (Jupiter), Spring Boot Test, Spring Security Test, Mockito  
**Build Tool:** Maven Wrapper (`.\mvnw test`)  
**Java Runtime:** Java 21 (LTS)  
**Database:** PostgreSQL 18.x (`itsm_db`)  

---

## 1. Test Execution Summary

| Metric | Result |
|---|---|
| **Total Test Cases Executed** | **19** |
| **Passed** | **19** |
| **Failures** | **0** |
| **Errors** | **0** |
| **Skipped** | **0** |
| **Success Rate** | **100%** |
| **Build Status** | `BUILD SUCCESS` |
| **Frontend Production Build** | `✓ built in 52.20s (0 errors)` |

> **Documented Result (Repository Report):** `19/19 PASS, 0 failures, 0 skipped`

---

## 2. Test Coverage and Evidence

| Coverage Type | Representative Documented Cases |
|---|---|
| **Normal Workflows** | Login, ticket creation, assignment, notes, resolution, closure. |
| **Boundary Conditions** | Priority at minimum (1), P1 boundary (18) and maximum (27), SLA deadlines. |
| **Invalid Inputs / Exceptions** | Invalid password, impossible lifecycle changes, unrelated category keywords. |
| **Authorization** | Employee forbidden from admin endpoint (403); invalid login (401). |
| **Business Rules** | Priority mapping, assignment strategy, duplicate check and SLA breach. |

---

## 3. Documented Test-Case Matrix (19 Cases)

The following 19 test cases represent the core automated test suite covering all functional, architectural, security, and lifecycle specifications:

| ID | Type | Input / Scenario | Expected Result | Status |
|:---:|:---:|:---|:---|:---:|
| **TC-01** | Boundary / rule | Priority: $3 \times 3 \times 3 = 27$ or $3 \times 2 \times 3 = 18$ | `P1_CRITICAL` | **PASS** |
| **TC-02** | Business rule | Priority score 12 and 16 | `P2_HIGH` | **PASS** |
| **TC-03** | Business rule | Priority scores 6, 8 and 11 | `P3_MEDIUM` | **PASS** |
| **TC-04** | Boundary / rule | Priority score 1 and 5 | `P4_LOW` | **PASS** |
| **TC-05** | Normal | VPN / Wi-Fi keywords in incident title | Suggest `Network` category | **PASS** |
| **TC-06** | Invalid / edge | Cafeteria text with no IT keywords | No false category suggestion (`Optional.empty()`) | **PASS** |
| **TC-07** | Business rule | New Wi-Fi outage similar to open Wi-Fi ticket | Return possible duplicate warning (Jaccard similarity threshold) | **PASS** |
| **TC-08** | Negative | Laptop battery issue vs network outage | No duplicate suggested (empty list) | **PASS** |
| **TC-09** | Normal / OOP | Network incident; network-skilled and hardware techs | Skill-based strategy selects matching technician | **PASS** |
| **TC-10** | Normal / OOP | Available tech workloads 8 vs 1 active tickets | Least-loaded strategy selects workload 1 | **PASS** |
| **TC-11** | Normal | `NEW` → `CLASSIFIED` → ... → `CLOSED` | Valid sequential lifecycle progression succeeds | **PASS** |
| **TC-12** | Exception | `NEW` → `RESOLVED`, `NEW` → `CLOSED` | `InvalidStateTransitionException` thrown (illegal jump rejected) | **PASS** |
| **TC-13** | Boundary / SLA | P1 created 10:00; SLA response 5m, resolve 30m | Deadlines calculated as 10:05 and 10:30 | **PASS** |
| **TC-14** | SLA / rule | Response at 10:20; response deadline 10:15 | SLA breach recorded (`responseBreached = true`) | **PASS** |
| **TC-15** | Auth / invalid | Login; employee accesses admin; wrong password | Valid signed JWT; admin rejected with HTTP 403; wrong password rejected with HTTP 401 | **PASS** |
| **TC-16** | Integration | Employee creates ticket; events published | Ticket number `INC-YYYYMMDD-XXXX` generated; audit log & notification created via Observer | **PASS** |
| **TC-17** | Integration | Technician acknowledges, notes, then resolves | Valid state progression (`ACKNOWLEDGED` → `IN_PROGRESS` → `RESOLVED`), notes stored | **PASS** |
| **TC-18** | Integration / roles | Employee verifies; admin/system closes | Ticket transitioned `VERIFIED` → `CLOSED`; history updated | **PASS** |
| **TC-19** | Integration | Spring application context starts | Core components, repositories, entities, and security filters initialize | **PASS** |

---

## 4. Automated Test Areas

| Area | What Is Checked | Test Class / Method |
|---|---|---|
| **Priority Engine** | Correct score calculation and mapping at each boundary threshold (1, 5, 6, 11, 12, 17, 18, 27). | `PriorityEngineTest` |
| **Assignment Strategies** | Skill matching and workload balancing polymorphically executed via `AssignmentStrategyContext`. | `AssignmentStrategyTest` |
| **Lifecycle FSM** | Legal sequential transitions succeed; invalid direct transitions throw `InvalidStateTransitionException`. | `IncidentLifecycleTest` |
| **SLA Tracking** | Correct response and resolution deadlines, warning thresholds ($\le 20\%$ remaining), and breach recording. | `SlaManagementTest` |
| **Suggestions & Intelligence** | Keyword-based category suggestion, soft-token duplicate detection heuristics, and diagnostic rules. | `CategorySuggestionTest`, `DuplicateDetectionTest` |
| **Integration & Workflows** | End-to-end multi-role workflows: employee submission, technician investigation, verification, closure, and security checks. | `ItsmEndToEndWorkflowsTest`, `ItsmBackendApplicationTests` |

---

## 5. Execution Instructions

To execute the full automated test suite locally on Windows from the `backend/` directory:

```powershell
cd backend
.\mvnw.cmd test
```

Expected output:
```text
[INFO] Results:
[INFO] 
[INFO] Tests run: 19, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```
