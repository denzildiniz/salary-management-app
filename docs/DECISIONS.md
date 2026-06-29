# Engineering Decisions & Trade-offs

## 1. SQLite over PostgreSQL / MySQL

**Decision:** Use SQLite with WAL mode as the relational database.

**Rationale:**
- Zero setup: no server process, credentials, or network configuration. The database is a single file (`data/acme_payroll.db`).
- WAL mode enables concurrent reads alongside a writer, which is adequate for a single-instance web server.
- SQLite handles 10,000-row datasets trivially; query times stay under 10 ms for all analytics queries.

**Trade-off accepted:**
- SQLite is not suitable for multi-writer, multi-instance deployments. Migrating to PostgreSQL later requires changing the driver and connection string — the SQL itself is compatible.

---

## 2. Fixed exchange rates

**Decision:** Exchange rates are hardcoded in `config.ts` and duplicated as a SQL CASE expression in `constants/sql.ts`.

**Rationale:**
- Eliminates external API dependency (no outage risk, no API key management).
- Makes analytics fully deterministic, which simplifies testing.
- Exchange rates for the assessment dataset change slowly enough that hardcoded values don't affect the utility of the analytics.

**Trade-off accepted:**
- Rates drift over time. A real production system would pull rates daily from an open exchange-rate API and cache them. This is a known V2 item.

---

## 3. Rule-based NLP over an LLM

**Decision:** The natural-language query engine uses substring matching against known intents and entity lists.

**Rationale:**
- No external API cost or latency.
- Fully deterministic — the same query always returns the same intent, making unit tests straightforward.
- The assessment only requires answering a bounded set of compensation questions.

**Trade-off accepted:**
- The engine cannot handle paraphrases or typos outside its pattern set. An LLM-backed engine (e.g., Claude with tool use) would cover arbitrary phrasing, but adds cost, API key management, and non-determinism.

---

## 4. node:sqlite over sqlite3 native addon

**Decision:** Use Node.js's built-in `node:sqlite` module (available since Node 22) instead of the `sqlite3` npm package.

**Rationale:**
- `sqlite3` ships prebuilt native binaries tied to a specific GLIBC version. Render's build machine (GLIBC 2.38+) and runtime machine (Ubuntu 20.04, GLIBC 2.31) differ, causing `ERR_DLOPEN_FAILED` on every deploy.
- `node:sqlite` is compiled into the Node.js binary itself — zero native addon, zero GLIBC dependency.
- A thin `AsyncDatabase` wrapper preserves the existing async/await API so no service files needed changing.

**Trade-off accepted:**
- `node:sqlite` was experimental in Node 22; it stabilised in Node 24 (which Render runs). The API is stable but newer than the well-documented `sqlite3` ecosystem.

---

## 5. Singleton database instance with test injection

**Decision:** `db.ts` keeps a module-level singleton. Tests inject an in-memory database via `setTestDb()`.

**Rationale:**
- A single SQLite connection avoids WAL contention and is idiomatic for a single-process Node.js server.
- Exporting `setTestDb` / `clearTestDb` gives full test isolation without mocking the entire db module — the real driver runs against `:memory:`, so tests exercise actual SQL.

**Trade-off accepted:**
- The singleton means the real database file is opened on first request and stays open. For a multi-tenant deployment this would need a connection pool, but for a single-tenant HR tool it is correct.

---

## 6. Salary stored in local currency; USD computed at query time

**Decision:** `salary` and `currency` are stored as-is. A SQL CASE expression converts to USD inline.

**Rationale:**
- Avoids a second column that must be kept in sync when exchange rates change.
- A single source of truth (local salary) is easier to audit.
- SQLite is fast enough that the arithmetic on 10,000 rows adds < 1 ms per query.

**Trade-off accepted:**
- Updating exchange rates requires updating the SQL constant and restarting the server. A stored USD column would make rate updates visible without restart.

---

## 7. Tailwind CSS as the "component library"

**Decision:** Use Tailwind CSS utility classes and a small set of hand-rolled components (`StatCard`, `Spinner`, `ErrorBanner`) instead of a full component library (MUI, Chakra, shadcn).

**Rationale:**
- No tree-shaking configuration needed; Tailwind's JIT purges unused styles automatically.
- No version conflicts or peer-dependency constraints from a heavy UI library.
- The design scope (HR dashboard) is narrow enough that bespoke components are quicker to tailor.

**Trade-off accepted:**
- More CSS to maintain than a design-system library. For a larger product or team, a standardised component library would reduce per-component decision fatigue.

---

## 8. CSV import as upsert (not append-only)

**Decision:** If an imported CSV row's `employee_id` matches an existing record, the record is updated. Otherwise it is inserted.

**Rationale:**
- HR teams often export, correct, and re-import the same data. Upsert prevents duplicate records and allows corrections without deleting first.
- The operation is wrapped in a transaction so a mid-import failure rolls back all changes.

**Trade-off accepted:**
- A row without an `employee_id` always results in a new insert, even if the email already exists. Full deduplication by email would require an extra look-up per row.

---

## 9. Vitest + @testing-library/react for frontend tests

**Decision:** Use Vitest with jsdom environment and `@testing-library/react` for frontend unit and component tests.

**Rationale:**
- Vitest shares the same config and module resolution as Vite — zero additional bundler setup.
- `@testing-library/react` encourages testing user-visible behaviour (what the user sees and clicks) rather than internal implementation details (component state, method calls).
- jsdom provides a lightweight DOM environment without launching a real browser — tests run in under 1 second.
- Keeping the same framework (Vitest) across backend and frontend means one mental model and one `npm test` convention.

**Trade-off accepted:**
- jsdom doesn't cover browser rendering edge cases (CSS layout, canvas, WebGL). For visual regression or E2E testing, Playwright or Cypress would be needed. For this assessment scope, unit and component-level tests are sufficient.

**Test scope decision:** Focused tests on shared primitives (`StatCard`, `Spinner`, `ErrorBanner`) and pure functions (`ApiError`, `boldMarkdownToHtml`) rather than full page components. Page components (`Dashboard`, `Directory`) require mocking Axios, React hooks, and large data fixtures — the effort-to-signal ratio is low for a single-developer MVP. The backend service tests cover the business logic that the pages rely on.

---

## 10. Auto-seed on startup (not on deploy or via admin endpoint)

**Decision:** `index.ts` calls `runSeed()` after `initDb()`. The seed function checks if the table is empty before inserting — it's a no-op when data exists.

**Rationale:**
- Render's free tier does not offer persistent disk storage. Every new deploy starts with an empty filesystem, so the SQLite database is wiped and must be repopulated.
- Running `npm run seed` as a separate command is not possible on Render's free web service tier.
- A seed API endpoint (e.g. `POST /admin/seed`) would be a security risk without authentication.
- Checking row count before seeding is a single fast query — negligible overhead on startup.

**Trade-off accepted:**
- Seeding 10,000 records adds ~5 seconds to the first cold start after each deploy. Acceptable for a demo app; a production system would use a persistent database (PostgreSQL on Render or Supabase) and run seed as a one-time migration.

---

## 11. Vercel (frontend) + Render (backend) deployment

**Decision:** Deploy the React SPA to Vercel and the Express API to Render's free tier.

**Rationale:**
- Vercel is purpose-built for static/SPA hosting — zero config, automatic HTTPS, global CDN, instant previews per commit.
- Render provides a Node.js web service with automatic redeploys on push, free TLS, and environment variable management.
- Both platforms support environment variables natively, enabling the `VITE_API_BASE_URL` / `CORS_ORIGIN` separation without any secrets in source code.

**Trade-off accepted:**
- Render's free tier spins down after 15 minutes of inactivity — the first request after idle takes 30–60 seconds (cold start). Acceptable for a demo; a paid instance or Railway would eliminate this.
