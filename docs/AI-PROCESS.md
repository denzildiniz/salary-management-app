# AI-Assisted Development — Process & Prompts

This document describes how Claude (via Claude Code CLI) was used to build the ACME Salary Management system. The goal is to be transparent about the AI tooling used and the human judgment exercised at each stage.

---

## Tool Used

**Claude Code** (Anthropic) — an agentic AI CLI that can read and write files, run shell commands, and reason about a codebase end-to-end.

---

## Development Phases

### Phase 1 — Requirements & Planning

**Human decision:** Defined the problem scope — replace Excel-based HR workflows for 10,000 employees with a web application. Explicitly decided what to leave out (auth, real-time FX rates, full audit logs, LLM query engine) and documented reasoning.

**Prompt used (paraphrased):**
> "I need to build employee salary management software for 10,000 employees. The user is an HR Manager. Help me write a one-page requirements document covering goal, scope, features, and deliberate omissions before we touch any code."

**Human review:** Reviewed the generated requirements document and added the trade-off rationale for leaving out LLM-based NLP in favour of a deterministic rule-based engine.

---

### Phase 2 — Backend Scaffold

**Prompt used (paraphrased):**
> "Set up a Node.js + Express + TypeScript backend with SQLite. I need: employee CRUD routes, analytics aggregation endpoint, a natural language query endpoint, CSV import/export, and a seed script for 10,000 realistic employees across 6 countries in 6 currencies."

**Human decisions made:**
- Chose WAL mode for SQLite (better concurrent read performance)
- Decided to store salary in local currency and convert to USD inline via SQL CASE rather than storing a redundant `salary_usd` column
- Chose `employee_id` as the upsert key for CSV import rather than email (more stable identifier)

---

### Phase 3 — Frontend Scaffold

**Prompt used (paraphrased):**
> "Build a React 18 + TypeScript + Vite + Tailwind CSS frontend. Four pages: Compensation Dashboard, Employee Directory, Bulk Salary Adjustments, and Data Exchange. Use Axios for API calls. The backend runs on port 3001; proxy all /api requests through Vite."

**Human decisions made:**
- Chose Tailwind CSS over a full component library (MUI, Chakra) to avoid peer-dependency overhead
- Decided to put analytics in a custom SVG/div bar chart rather than pulling in a chart library like Recharts — kept bundle small
- Chose Outfit + Inter font stack for the dark-themed HR dashboard aesthetic

---

### Phase 4 — NLP Query Engine

**Prompt used (paraphrased):**
> "Implement a rule-based natural language query engine in queryEngine.ts. Support these intents: total payroll spend, average salary, highest-paid employees, headcount, gender pay gap. Each intent should filter by department or country if mentioned. Return structured data with intent, answer text, data payload, and a visualization type hint."

**Human decision:** Deliberately kept this rule-based and not LLM-backed. Reasoning documented in `docs/DECISIONS.md` #3.

---

### Phase 5 — Security Hardening

**Prompt used (paraphrased):**
> "Add Helmet for HTTP security headers, express-rate-limit (500 req/15 min general, 100 req/15 min for write endpoints), and lock CORS to the CORS_ORIGIN environment variable instead of wildcard."

**Human review:** Verified the rate limit numbers were sensible for a single-HR-user application.

---

### Phase 6 — Bug Fixes & Polish

Identified and fixed bugs through manual testing:

| Bug | Root cause | Fix |
|-----|-----------|-----|
| CSV validation errors not showing in UI | Axios interceptor stripped `details` array from 400 responses | Created `ApiError` class preserving `details`; updated `DataExchange` component |
| "% of global staff" showed /10000 hardcoded | Hardcoded denominator in `BulkActions` component | Pulled real headcount from `useAnalytics()` hook |
| `animate-fadeIn`, `animate-scaleUp` not applying | Custom keyframes missing from Tailwind config | Added to `tailwind.config.js` keyframes section |
| `scrollbar-none` class not recognised | Not a standard Tailwind utility | Added via custom plugin in Tailwind config |
| `border-slate-850` class not recognised | Custom colour missing from theme | Added `slate: { 850: '#1a2537' }` to Tailwind theme extension |
| `.env` tracked by git | `frontend/` has its own `.git` repo; root `.gitignore` didn't apply | Created `frontend/.gitignore` |
| `import.meta.env` TypeScript error on Vercel build | Missing `vite-env.d.ts` type reference file | Created `src/vite-env.d.ts` with `/// <reference types="vite/client" />` |
| API calls returning 404 on Vercel | Production build has no Vite proxy; `/api` hit Vercel domain | Added `VITE_API_BASE_URL` env var; Axios baseURL reads from it |

---

### Phase 7 — Backend Testing

**Prompt used (paraphrased):**
> "Write Vitest unit tests for: currency conversion helpers, employee service (CRUD, pagination, filtering, bulk raise, CSV import), analytics service (aggregations, salary bands, gender pay gap), and the NLP query engine. Use an in-memory SQLite database for service tests. The db.ts module already has setTestDb / clearTestDb hooks for this."

**Human review:** Checked that each test exercised a real behaviour rather than just re-asserting the implementation. Verified 48 tests all pass with `npm test`.

---

### Phase 8 — Frontend Testing

**Prompt used (paraphrased):**
> "Set up Vitest with @testing-library/react and jsdom for the frontend. Write unit tests for: the ApiError class (message, name, instanceof, details array, throw behaviour), the boldMarkdownToHtml utility (all edge cases), and render tests for the three shared UI primitive components — StatCard, Spinner, ErrorBanner — including a user-interaction test for the retry button."

**Human decisions made:**
- Chose Vitest over Jest to match the backend test framework (consistent tooling across the full stack)
- Chose `@testing-library/react` over Enzyme — tests user-visible behaviour, not internal implementation details
- Focused tests on shared primitives and pure functions rather than page-level components that would require mocking the full Axios/hooks layer
- Created a separate `vitest.config.ts` so the jsdom environment doesn't pollute the Vite production build config

**Human review:** Verified all 34 tests pass. Checked that the `ErrorBanner` retry test uses `userEvent` (simulates real browser interaction) not `fireEvent`. Confirmed component tests use semantic queries (`getByRole`, `getByText`) rather than implementation-detail class selectors.

**Test coverage:**

| File | Tests | What it covers |
|---|---|---|
| `src/utils/utils.test.ts` | 8 | `boldMarkdownToHtml` — NLP answer markdown formatter |
| `src/api/client.test.ts` | 8 | `ApiError` class — message, name, instanceof, details array |
| `src/components/ui/StatCard.test.tsx` | 5 | KPI card renders label, value, subtext, iconBg correctly |
| `src/components/ui/Spinner.test.tsx` | 7 | All 3 sizes, optional label, `animate-spin` class always present |
| `src/components/ui/ErrorBanner.test.tsx` | 6 | Error message, heading, retry button visibility and click handler |
| **Total** | **34** | |

---

### Phase 9 — Deployment

**Prompt used (paraphrased):**
> "Deploy the frontend to Vercel and the backend to Render. Fix any production-specific issues — CORS, API URL routing, SQLite native addon failures, and auto-seeding since Render's free tier wipes the filesystem on redeploy."

**Issues encountered and resolved:**

| Issue | Root cause | Fix |
|---|---|---|
| `GLIBC_2.38` not found on Render | `sqlite3` native addon compiled on build machine (GLIBC 2.38) but runs on older runtime | Migrated to `node:sqlite` (built into Node.js 22+, zero native addon) |
| TypeScript build errors after migration | `node:sqlite` types `lastInsertRowid` as `number \| bigint`; default generic was `unknown[]` | Added `Number()` casts; changed wrapper defaults to `any` |
| No data after deploy | Render free tier wipes SQLite file on each redeploy | Added `runSeed()` call in `index.ts` — seeds automatically if table is empty |
| CORS blocked from Vercel | `CORS_ORIGIN` env var pointed to `localhost:5173` | Updated to Vercel production URL in Render environment settings |

**Human decisions made:**
- Chose Vercel (frontend) + Render (backend) — both offer free tier with zero config for the respective stack
- Decided to auto-seed on startup rather than commit seed data or use a persistent paid disk

---

## What AI Did vs. What I Decided

| AI Generated | Human Decided |
|---|---|
| Boilerplate route, controller, service structure | Which intents the NLP engine supports |
| SQL queries and index definitions | Store salary in local currency (not USD) |
| React component structure and Tailwind styling | Leave auth out of MVP scope |
| Backend test scaffolding and assertion patterns | Rate limit numbers appropriate for single-user tool |
| Frontend test file structure and assertions | Test primitives + pure functions, not mocked page components |
| Seed script data distributions | Upsert key = `employee_id`, not email |
| CSV parsing and validation logic | Tailwind over a component library |
| Deployment config and env var wiring | Vercel + Render as the deployment targets |
| `node:sqlite` migration and async wrapper design | Migrate rather than pay for Render persistent disk |

The AI accelerated implementation speed significantly. All architectural decisions, scope calls, and code reviews were performed by the developer.
