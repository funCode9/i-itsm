# I-ITSM Demonstration Workflows Guide

**Course:** CS F213 / MAC F212 — Object Oriented Programming  
**Semester:** Semester I, 2026–2027  
**Project:** Intelligent IT Service Management & Incident Resolution System (I-ITSM)  
**Target Duration:** 15–20 Minutes Recorded Video Presentation  
**Group Video Submission Requirement:** Supposing Group No. is 1, name file `1_OOP_S1_2025-2026_Project.mp4`.

---

## Overview & Demo Roles Assignment

Each group member should introduce themselves and explain their designated module:
* **Student 1 (UI / UX):** Introduction, Employee Portal, incident submission form, responsive UI, theme toggle, and notification bell.
* **Student 2 (Backend & REST APIs):** Architecture overview, Spring Boot REST controllers, Spring Security JWT filter, and API routing.
* **Student 3 (Domain Model & OOP Design):** Incident Lifecycle FSM, Priority Engine math, Strategy Pattern implementation, and OOP principles.
* **Student 4 (Database & Persistence):** PostgreSQL schema, 15 relational tables, JPA/Hibernate mapping, Neon Cloud deployment, and audit trails.
* **Student 5 (Intelligent Features & Testing):** Category suggestion, duplicate detection, predictive SLA risk, Gemini AI resolution playbook, escalation, and 27 automated tests.

---

## Demonstration Workflow 1: Incident Reporting, Automated Prioritization, Strategy Assignment & Notification

### Scenario
An Employee experiences a critical database outage on the core payment processing gateway during business hours and reports the incident through the employee portal.

### Step-by-Step Demonstration Script:
1. **Login as Employee:**
   * Navigate to `https://i-itsm-frontend.onrender.com/login` (or `http://localhost:5173/login`).
   * Enter credentials: `employee1` / `password123` (or register a new user).
   * Notice role-specific navigation menu: Dashboard, Report Incident, My Incidents, Notifications.
2. **Open "Report Incident" Form:**
   * Click **Report Incident**.
   * Enter Title: `"Payment gateway database connection timeout under high transaction load"`.
   * Type Description: `"Users receive 500 error on checkout. Database connection pool exhausted and queries timing out."`
   * **Highlight Intelligent Feature 1 (Category Suggestion):** Show how the system dynamically analyzes keywords and suggests `"Database"` or `"Application"` category with a one-click apply button.
   * Select Affected Service: `"Payment Gateway"`.
   * Select Impact: `"High (3)"` (Organization-wide outage).
   * Select Urgency: `"High (3)"` (Immediate operational impairment).
   * Select Business Criticality: `"Critical (3)"` (Core revenue generation service).
   * Click **Submit Incident**.
3. **Show System Automation & Strategy Execution:**
   * Demonstrate the generated ticket number: e.g. `INC-20261121-0001`.
   * **Highlight Priority Engine Calculation:**
     $$\text{Priority Score} = 3 \times 3 \times 3 = 27 \implies \mathbf{P1\_CRITICAL}$$
   * **Highlight Strategy Pattern Assignment:** Show that the ticket was automatically transitioned from `NEW` to `ASSIGNED` and allocated to an available technician (e.g., Alex Network or Sarah Database) matching the database skill domain.
4. **Demonstrate Multi-Channel Notifications & Audit Logging:**
   * Click the **Notifications** bell icon at the top right: show the newly received in-app alert confirming ticket submission.
   * Open the Administrator console (`/admin/audit`) or query database to show the generated `EmailLog` entry and immutable `AuditLog` record (`INCIDENT_CREATED`).

---

## Demonstration Workflow 2: Technician Workspace, SLA Monitoring, Heuristic RCA, AI Resolution & Resolution

### Scenario
The assigned technician receives the P1 ticket, reviews the strict SLA countdown, consults automated root-cause analysis and Gemini AI resolution playbook, performs troubleshooting, and resolves the issue.

### Step-by-Step Demonstration Script:
1. **Login as Technician:**
   * Log out and log in as: `tech_alex` / `password123` (or any assigned technician).
   * Notice the Technician Workspace view: Assigned Incidents Queue, Active Workload gauge, and skill profile.
2. **Acknowledge Ticket & Begin Investigation:**
   * Open the assigned P1 ticket from the queue table.
   * **Highlight SLA Policy Monitoring:** Show the live SLA Countdown timer (P1 Response: 5 minutes, Resolution: 30 minutes).
   * Click **Acknowledge Incident**: Status transitions `ASSIGNED -> ACKNOWLEDGED`. SLA records the exact `actualResponseTime`.
   * Click **Start Investigation**: Status transitions `ACKNOWLEDGED -> IN_PROGRESS`.
3. **Inspect Intelligent Features:**
   * **Highlight Intelligent Feature 2 (Predictive SLA Violation Risk):** Click **Predict SLA Risk**. Show how the service computes remaining time, workflow inertia, and returns a quantitative risk rating with recommended action.
   * **Highlight Intelligent Feature 3 (Automated Root-Cause Analysis - RCA):** Click **Root Cause Analysis**. Show how the system identifies the `"Database & Storage"` failure taxonomy, highlights probable causes (connection pool starvation / deadlock), and suggests diagnostic steps.
   * **Highlight Intelligent Feature 4 (Gemini AI Resolution Playbook):** Click **AI Resolution Playbook**. Show the structured resolution checklist generated by the AI assistant (or fallback engine). Click **Apply Recommendation as Note** to auto-inject the troubleshooting steps into the ticket's work log.
4. **Add Investigation Notes & Resolve Incident:**
   * Click **Add Work Note**. Enter: `"Restarted connection pool pool-size expanded to 50 connections. Latency normalized."`
   * Click **Resolve Incident**. Enter Resolution Details: `"Applied connection pool tuning patch and terminated stale idle transactions. Payment gateway operational."`
   * Status transitions `IN_PROGRESS -> RESOLVED`. Resolution timestamp `resolvedAt` is stamped and SLA tracking evaluates compliance (SLA Met).

---

## Demonstration Workflow 3: Duplicate Incident Handling, SLA Escalation, Verification, Feedback & Administrative Analytics

### Scenario
Multiple employees report identical or related issues during an outage. The system uses real-time word similarity to identify existing tickets, suppresses redundant ticket creation upon submission, automatically escalates the existing primary ticket's priority and impact, notifies the reporting employee via in-app alert and email, and verifies and closes the resolved incident.

### Step-by-Step Demonstration Script:
1. **Demonstrate Real-Time Word Similarity Detection & Outage Surge Escalation:**
   * Log in as an Employee (e.g., `user1` or newly registered employee).
   * Navigate to **Report Incident (`/employee/report`)**.
   * Begin typing Title: `"Office VPN down and cannot connect"`.
   * **Highlight Real-Time Word Similarity:** Show the alert card appearing immediately below the title input: *"Similar Active Tickets Detected (1)"* with a card showing the open ticket number (e.g., `INC-20261121-0001`), status, service chip, and a *"View Ticket"* button. Explain how stemming and synonym clustering (`vpn`, `disconnect`, `connection`) flag related issues without needing exact word-for-word matching.
   * **Submit Duplicate Ticket to Trigger Automated Outage Escalation:**
     * Click **Submit Incident Report**.
     * **Point out the Intelligent Outage Consolidation:** The system does **NOT** create a redundant ticket. Instead, the backend intercepts the duplicate, correlates it with the open incident, elevates the existing ticket's priority (e.g. $P3 \to P2$), raises its impact level to reflect multi-user disruption, and appends the new reporter's details as an investigation note.
     * **Show the In-App Alert Banner:** The UI immediately redirects to the primary incident with a prominent banner:
       > *"⚡ Correlated Issue Detected — Existing Incident Escalated: Your report matches an active incident. Rather than creating a duplicate ticket, the system has consolidated your report, escalated priority to P2_HIGH, and alerted the engineering team."*
   * **Show Employee Notification:**
     * Click on **Notifications (`/notifications`)** in the sidebar.
     * Highlight the incoming in-app alert:
       > *"⚡ Ongoing Incident Escalated: INC-20261121-0001 — Your report matches active incident INC-20261121-0001. Rather than creating a redundant ticket, the existing incident has been escalated to P2_HIGH to expedite resolution."*
2. **Verify Resolution & Submit Customer Feedback:**
   * Log in as the original ticket reporter (Employee).
   * Navigate to **My Incidents** and open the resolved incident.
   * Review resolution details provided by the technician.
   * Click **Verify & Close Incident**: Status transitions `RESOLVED -> VERIFIED -> CLOSED`.
   * Submit 5-star customer satisfaction feedback with rating and comment: `"Exceptional turnaround time and clear root cause explanation!"`.
3. **Demonstrate Administrator Operations Console & Analytics:**
   * Log in as `admin` / `Admin@123`.
   * Navigate to **Operations Console (`/admin`)**:
     * Show live summary cards: Total Incidents (36), Active Queue (13), P1 Critical (5), Resolved & Closed (23), SLA Breaches (4).
     * Show **Ticket Generation Velocity Trend** chart (continuous influx vs resolution velocity).
     * Show **Runtime Strategy Switcher** in header: Toggle between `Skill-Based` and `Least-Loaded` and explain how dynamic polymorphism changes runtime dispatching.
   * Navigate to **SLA Monitoring (`/admin/sla-monitoring`)**: Show compliance percentages and violation breakdowns.
   * Navigate to **Audit Trail (`/admin/audit`)**: Filter by incident ID and show the complete end-to-end event chain from creation to closure.
   * Navigate to **Reports & Analytics (`/admin/reports`)**: Export CSV / JSON summary reports.

---

## Demonstration Checklist & Timing Plan

| Segment | Speaker | Topic | Target Time |
| :--- | :--- | :--- | :--- |
| **1. Intro & Architecture** | Student 1 & 2 | Problem statement, technology stack, architecture diagram | 0:00 – 3:00 |
| **2. Workflow 1** | Student 1 & 3 | Employee submission, Priority Engine, Strategy assignment | 3:00 – 7:30 |
| **3. Workflow 2** | Student 3 & 4 | Technician workspace, SLA monitoring, Heuristic RCA, AI playbook | 7:30 – 12:00 |
| **4. Workflow 3** | Student 4 & 5 | Duplicate detection, ticket suppression, priority escalation, employee notification, admin console | 12:00 – 16:30 |
| **5. Testing & Conclusion** | Student 5 | 31 automated tests verification, cloud deployment URL, concluding remarks | 16:30 – 19:00 |
