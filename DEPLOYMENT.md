# I-ITSM Production Deployment Guide

## 1. Project Analysis & Architecture

| Component | Technology | Version | Location / Build Output |
| :--- | :--- | :--- | :--- |
| **Frontend** | React SPA, Vite, MUI v5, Axios, Recharts | React 18, Vite 6 | `frontend/dist` |
| **Backend** | Spring Boot, Spring Security (JWT), Spring Data JPA, Hibernate | Java 21, Spring Boot 4.1.2 | `backend/target/itsm-backend-0.0.1-SNAPSHOT.jar` |
| **Cloud Database** | PostgreSQL 18.7 on AWS (Singapore `aws-ap-southeast-1`) | Neon Serverless Postgres | Project: `odd-boat-85966864` (`i-itsm-db`) |
| **Containerization** | Multi-stage Docker (Eclipse Temurin JDK 21 Alpine -> JRE 21) | Dockerfile | `backend/Dockerfile` |
| **CI/CD Remote** | GitHub Repository | `main` branch | `https://github.com/funCode9/i-itsm.git` |

---

## 2. Live Cloud Database (Provisioned & Initialized)

The production PostgreSQL database has been provisioned on **Neon Cloud** and bootstrapped with the full relational schema and seed data.

- **Host:** `ep-green-bread-aoohsox1.c-2.ap-southeast-1.aws.neon.tech`
- **Database Name:** `i-itsm-db`
- **Username:** `i-itsm-db_owner`
- **SSL Mode:** `require`
- **Tables Initialized (15/15):**
  - `users`, `technicians`, `technician_skills`, `categories`, `it_services`
  - `incidents`, `incident_notes`, `incident_sla_records`, `assignment_history`
  - `sla_policies`, `feedback`, `audit_logs`, `email_logs`, `notifications`, `system_config`
- **Default Cloud Administrator Credentials:**
  - **Username:** `admin`
  - **Password:** `Admin@123`
  - **Role:** `ADMINISTRATOR`

---

## 3. Production Fixes & Configurations Implemented

1. **Dynamic Environment Variable Binding (`application.properties`):**
   - `server.port=${PORT:8080}`
   - `spring.datasource.url=${SPRING_DATASOURCE_URL:...}`
   - `spring.datasource.username=${SPRING_DATASOURCE_USERNAME:...}`
   - `cors.allowed.origins=${CORS_ALLOWED_ORIGINS:...}`
2. **CORS Configuration (`SecurityConfig.java`):**
   - Switched to `setAllowedOriginPatterns` with credentials support. This allows wildcards such as `https://*.onrender.com`, `https://*.vercel.app`, and custom domains without throwing Spring Security credential origin errors.
3. **Health Check Endpoint (`AuthController.java`):**
   - Added `GET /api/auth/health` returning `{"status": "UP", "service": "i-itsm-backend"}` for zero-downtime platform health probes.
4. **Decoupled API Base URL (`frontend/src/api/axiosConfig.js`):**
   - Reads `import.meta.env.VITE_API_BASE_URL` or `VITE_API_URL` dynamically, defaulting cleanly to `/api` for local proxy development and falling back without trailing slash issues.
5. **SPA Routing Rewrites:**
   - `frontend/vercel.json`: Handles client-side routing on Vercel (`/(.*) -> /index.html`).
   - `frontend/public/_redirects`: Handles client-side routing on Netlify, Render, and Cloudflare Pages (`/* /index.html 200`).
6. **Multi-Stage Containerization (`backend/Dockerfile`):**
   - Stage 1 builds the fat JAR using Alpine Maven.
   - Stage 2 runs a secure non-root `itsm` user on `eclipse-temurin:21-jre-alpine`.
7. **Infrastructure Blueprint (`render.yaml`):**
   - Configures the backend Docker service and frontend static site in a unified Blueprint.

---

## 4. One-Click / Free Hosting Deployment Instructions

### Option A: Render (Recommended — 1-Click Blueprint)
Render offers a generous free tier for Docker web services and static sites:

1. Log in to [render.com](https://render.com) using your GitHub account (`funCode9`).
2. Click **New +** -> **Blueprint**.
3. Select your repository: `funCode9/i-itsm`.
4. Render will parse `render.yaml` and configure two services:
   - **`i-itsm-backend` (Web Service, Docker)**:
     - Set the Environment Variable `DB_PASSWORD` to: `npg_ptxIo9UFZ6aV`
     - Click **Apply**.
   - **`i-itsm-frontend` (Static Site)**:
     - Add environment variable `VITE_API_BASE_URL`: `https://<YOUR-RENDER-BACKEND-URL>` (e.g. `https://i-itsm-backend.onrender.com`).
5. Render deploys both services over automatic free HTTPS.

### Option B: Vercel (Frontend) + Render / Railway (Backend)
1. **Backend on Render / Railway:**
   - Create a Web Service pointing to `https://github.com/funCode9/i-itsm.git` (Root: `backend`, Dockerfile: `backend/Dockerfile`).
   - Add Environment Variables:
     - `PORT`: `8080`
     - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://ep-green-bread-aoohsox1.c-2.ap-southeast-1.aws.neon.tech/i-itsm-db?sslmode=require`
     - `SPRING_DATASOURCE_USERNAME`: `i-itsm-db_owner`
     - `DB_PASSWORD`: `npg_ptxIo9UFZ6aV`
     - `CORS_ALLOWED_ORIGINS`: `https://*.vercel.app,http://localhost:5173`
2. **Frontend on Vercel:**
   - Import `funCode9/i-itsm` on [vercel.com](https://vercel.com).
   - Set **Root Directory** to `frontend`.
   - Framework Preset: **Vite**.
   - Add Environment Variable:
     - `VITE_API_BASE_URL`: `https://<YOUR_DEPLOYED_BACKEND-URL>`
   - Click **Deploy**. Vercel will provide a live `https://*.vercel.app` URL with automatic HTTPS and global edge CDN caching.

---

## 5. End-to-End Verification Summary

- [x] **Unit & Integration Tests:** 27 passed, 0 failures, 0 errors.
- [x] **Production Backend Build:** Maven package `BUILD SUCCESS` (FAT JAR generated).
- [x] **Production Frontend Build:** Vite build succeeded (Static bundle in `frontend/dist`).
- [x] **Cloud Database:** Neon Postgres 18.7 connected, 15 tables migrated, DataLoader seeded initial admin and sample technicians.
- [x] **Authentication Flow:** Verified JWT token issue via REST call against cloud database (`admin` / `Admin@123`).
- [x] **Git Repository:** Synced to `origin/main` with zero working tree changes.
