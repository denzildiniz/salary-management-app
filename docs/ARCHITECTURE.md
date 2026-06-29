# Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (HR Manager)                │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │        React 18 + TypeScript (Vite)              │   │
│  │                                                  │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────┐  │   │
│  │  │  Dashboard │  │  Directory   │  │  Bulk   │  │   │
│  │  │ (Analytics)│  │ (CRUD Table) │  │  Raise  │  │   │
│  │  └────────────┘  └──────────────┘  └─────────┘  │   │
│  │  ┌────────────────────┐  ┌────────────────────┐  │   │
│  │  │   Data Exchange    │  │  NLP Query Widget  │  │   │
│  │  │   (CSV import/exp) │  │  (natural language)│  │   │
│  │  └────────────────────┘  └────────────────────┘  │   │
│  │                                                  │   │
│  │  Tailwind CSS · Lucide Icons · Axios · Hooks     │   │
│  └────────────────────────────────┬─────────────────┘   │
└───────────────────────────────────│─────────────────────┘
                                    │ HTTPS / JSON
                                    │ VITE_API_BASE_URL (prod)
                                    │ Vite proxy (dev)
┌───────────────────────────────────▼─────────────────────┐
│          Express + TypeScript — Render (free tier)       │
│                                                         │
│  Routes                                                 │
│  ├─ /api/employees   → employee.controller.ts           │
│  ├─ /api/analytics   → analytics.controller.ts          │
│  └─ /api/query       → query.routes.ts                  │
│                                                         │
│  Services                                               │
│  ├─ employee.service.ts  (CRUD, bulk raise, CSV import) │
│  ├─ analytics.service.ts (aggregations, pay gap)        │
│  └─ queryEngine.ts       (rule-based NLP parser)        │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │       SQLite (node:sqlite, WAL mode)             │   │
│  │       acme_payroll.db — auto-seeded on startup   │   │
│  │       employees table · 4 indexes                │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

Deployment
  Frontend → Vercel  (https://salary-management-app-five.vercel.app)
  Backend  → Render  (https://salary-management-be-0elh.onrender.com)
```

---

## Key Technical Decisions

### Backend: Express + TypeScript + node:sqlite

Express was chosen for its simplicity and proximity to the JD's Node.js background. SQLite removes the need for a running database server while still supporting concurrent reads and acceptable write throughput for 10,000-employee datasets. The database layer uses Node.js's built-in `node:sqlite` module (available since Node 22) wrapped in a thin async adapter — this eliminates native addon compilation issues that caused GLIBC mismatch errors on Render's free tier.

### Frontend: React + Vite + Tailwind

React (with hooks and TypeScript) matches the stated technical constraint. Vite gives near-instant HMR during development. Tailwind CSS was chosen as the component library alternative because it keeps the bundle small and avoids heavy component framework lock-in. Lucide React supplies icons without a full icon font.

### API URL strategy (dev vs. production)

In development, Vite's `server.proxy` forwards all `/api` requests to the local backend — no absolute URLs needed in source code. In production, `VITE_API_BASE_URL` is set in Vercel's environment settings and read by Axios as the `baseURL`. The fallback `'/api'` is only active locally.

### Currency normalisation in SQL

All salary analytics are computed by embedding a `CASE currency WHEN … THEN rate END` expression directly in SQL. This pushes the arithmetic into SQLite's query engine, keeping the result set small and avoiding a round-trip to JavaScript for aggregation.

### Rule-based NLP over LLM

The query engine uses pattern matching (substring search) over a known set of intents and filter dimensions. This avoids external API cost, adds zero latency, and is fully deterministic — important for test coverage. The set of supported intents is limited but explicitly communicated to users via sample queries.

### node:sqlite singleton with test injection

`db.ts` keeps a module-level `AsyncDatabase` singleton wrapping `DatabaseSync` from `node:sqlite`. Tests override the singleton via `setTestDb()` / `clearTestDb()` to inject an in-memory database without touching the real file.

---

## Data Model

```
employees
  id                INTEGER  PK AUTOINCREMENT
  employee_id       TEXT     UNIQUE  e.g. EMP-00042
  first_name        TEXT
  last_name         TEXT
  email             TEXT
  job_title         TEXT
  department        TEXT     indexed
  salary            REAL     stored in local currency
  currency          TEXT     USD | EUR | GBP | CAD | INR | JPY
  country           TEXT     indexed
  date_of_joining   TEXT     YYYY-MM-DD
  performance_rating INTEGER  1–5
  gender            TEXT
  previous_salary   REAL     NULL if no change recorded
```

---

## File Structure

```
frontend/                          ← this repository
├── docs/
│   ├── ARCHITECTURE.md   ← this file
│   ├── DECISIONS.md
│   └── AI-PROCESS.md
├── src/
│   ├── api/
│   │   ├── client.ts       Axios instance + ApiError class
│   │   ├── employees.ts    employee CRUD and bulk endpoints
│   │   ├── analytics.ts    analytics and NLP query endpoints
│   │   └── index.ts        re-exports
│   ├── components/
│   │   ├── Dashboard/      Compensation Dashboard page
│   │   ├── Directory/      Employee Directory + table, filters, modal
│   │   ├── BulkActions/    Bulk Salary Adjustments page
│   │   ├── DataExchange/   CSV Import/Export page
│   │   └── ui/
│   │       ├── StatCard.tsx        KPI card primitive
│   │       ├── Spinner.tsx         loading spinner (sm/md/lg)
│   │       ├── ErrorBanner.tsx     error display with optional retry
│   │       ├── StatCard.test.tsx   ← render tests
│   │       ├── Spinner.test.tsx    ← render + size tests
│   │       └── ErrorBanner.test.tsx← render + interaction tests
│   ├── constants/          departments, countries, currencies
│   ├── hooks/
│   │   ├── useEmployees.ts data-fetching hook for employee list
│   │   └── useAnalytics.ts data-fetching hook for analytics
│   ├── test/
│   │   └── setup.ts        @testing-library/jest-dom setup
│   ├── types/              shared TypeScript interfaces
│   ├── utils/
│   │   ├── index.ts            boldMarkdownToHtml helper
│   │   └── utils.test.ts   ← unit tests for utility functions
│   ├── api/
│   │   └── client.test.ts  ← unit tests for ApiError class
│   ├── App.tsx             root component with sidebar navigation
│   ├── main.tsx            React entry point
│   ├── index.css           Tailwind base + custom glass-panel utility
│   └── vite-env.d.ts       Vite type reference (import.meta.env)
├── vitest.config.ts        test config — jsdom environment
├── vite.config.ts          build + dev server config
├── tailwind.config.js      custom theme (animations, slate-850, scrollbar-none)
├── .env.example            documents required environment variables
├── .gitignore
└── README.md

backend/                           ← separate repository
  See https://github.com/denzildiniz/salary-management-BE
```
