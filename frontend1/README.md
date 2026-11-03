# DayPilot AI: frontend

React + TypeScript + Tailwind CSS interface (the AI Studio layout), connected to the Spring Boot API.

## Run (Windows, PowerShell)

1. Start MySQL and the backend first (see the repository README). The API must answer on `http://localhost:8080`.
2. In this folder:

```powershell
npm install
npm run dev
```

3. Open http://localhost:5173 and create an account.

Node 22.18 or newer is needed (Node 24 is fine).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 5173. `/api` is proxied to `http://localhost:8080` |
| `npm run build` | Production build into `dist/` |
| `npm run lint` | TypeScript type check |
| `npm test` | 22 unit tests for the API client and the data mappers |

## How the data layer works

```
pages and components
        │  useApp()
        ▼
 context/AppContext.tsx   optimistic update → API call → reload from server
        │
        ├── services/backend.ts   fetch client: cookie session, CSRF header, readable errors
        └── services/mappers.ts   API shapes ↔ screen shapes (pure functions, unit tested)
```

* Login is a cookie session. The browser never holds a token. The API sets an `XSRF-TOKEN` cookie and
  `backend.ts` echoes it in the `X-XSRF-TOKEN` header on every write.
* Every change is shown at once, sent to the API, and then the screen reloads from the server.
  If the API rejects a change, the screen rolls back and a notification explains why.
* A "task" on screen is either a flexible task or one day of a routine (id starts with `occ-`).

## What is real and what is demo

| Area | State |
|---|---|
| Register, sign in, sign out | Real (Spring Security, BCrypt, session cookie) |
| Tasks, routines, daily routine items, job applications and their event history | Real, stored in MySQL |
| Dashboard, My Day, Calendar, Insights | Real: calculated from your stored data |
| AI Planner | Rule-based (priority, due date, free time). No AI model is called |
| Email Assistant and Gmail connection | Demo: sample emails, nothing is read from an inbox |
| Google Calendar sync button | Demo |
| Notifications, resumes list, profile extras | Kept in this browser only |

## Known limitations

* Routine days are loaded for 30 days back and 30 days ahead.
* Work mode, salary range and recruiter phone on an application are stored in this browser only.
* A routine's category is not stored by the backend.
* "Not today" on a flexible task moves it to the next day. On a routine day it marks that day skipped.
* The backend restarts with an empty session store, so a restart signs you out.
* The PWA manifest exists, but there is no service worker, so the app does not work offline.
