# DayPilot AI

AI-powered personal routine, task and job application tracker.

## Tech stack
- Backend: Java 21, Spring Boot, Spring Data JPA, Flyway, MySQL
- Frontend: React, Vite, Tailwind CSS

## Run locally
1. Create a MySQL database named `daypilot` and a user for it.
2. Backend (PowerShell, in `backend/`):
   set `DB_USERNAME` and `DB_PASSWORD` as environment variables, then run `.\mvnw.cmd spring-boot:run`.
3. Frontend (PowerShell, in `frontend/`): `npm install`, then `npm run dev`.
4. Open http://localhost:5173

## Status
Phase 2 complete: backend, database and frontend connected.