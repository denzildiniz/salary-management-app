# ACME Salary Management — Frontend

React + TypeScript + Tailwind CSS frontend for the ACME CompManager payroll and compensation analytics platform.

## Tech Stack

- **React 18** with TypeScript
- **Vite** — dev server and bundler
- **Tailwind CSS v3** — utility-first styling with custom animations
- **Axios** — HTTP client with response interceptors
- **Lucide React** — icon library

## Features

### Compensation Dashboard
- KPI cards: headcount, total payroll spend, average salary, global gender pay gap
- Department payroll allocation bar chart
- Average salaries by region (SVG bar chart)
- Salary band distribution histogram
- Gender pay gap breakdown by department
- **NLP query interface** — ask plain-English questions like *"average salary in Engineering"* or *"highest paid in Germany"*

### Employee Directory
- Paginated table (10 per page) with full-text search across name, email, job title, and employee ID
- Filter by department, country, and USD salary range
- Sortable columns (click any header to toggle ASC/DESC)
- Create, edit, and delete employee profiles via modal
- Previous salary history indicator per row

### Bulk Salary Adjustments
- Apply percentage or flat raises to any department/country cohort
- Dry-run **preview mode** shows affected headcount, annual cost delta, and average salary shift before committing
- Confirmation gate before any database mutation

### Data Exchange
- Upload CSV worksheets — upserts by `employee_id`, inserts new rows
- Row-level validation error console surfaces every failing row
- Export full employee register as CSV
- Download CSV template with example rows

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file and configure
cp .env.example .env

# Start the dev server
npm run dev
```

The dev server runs on `http://localhost:5173`.  
All `/api` requests are proxied to the backend (configured via `VITE_API_TARGET` in `.env`).

> The backend must be running separately. See `../backend/README.md`.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_TARGET` | `http://localhost:3001` | Backend URL used by the Vite dev server proxy |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Preview the production build locally |

## Project Structure

```
src/
├── api/
│   ├── client.ts       # Axios instance + ApiError class
│   ├── employees.ts    # Employee CRUD and bulk endpoints
│   ├── analytics.ts    # Analytics and NLP query endpoints
│   └── index.ts        # Re-exports
├── components/
│   ├── Dashboard/      # Compensation Dashboard page
│   ├── Directory/      # Employee Directory page + table, filters, modal
│   ├── BulkActions/    # Bulk Salary Adjustments page
│   ├── DataExchange/   # CSV Import/Export page
│   └── ui/             # Shared primitives: Spinner, ErrorBanner, StatCard
├── constants/          # Departments, countries, currencies, ratings
├── hooks/
│   ├── useEmployees.ts # Data-fetching hook for employee list
│   └── useAnalytics.ts # Data-fetching hook for analytics
├── types/              # Shared TypeScript interfaces
├── utils/              # Helpers (boldMarkdownToHtml)
├── App.tsx             # Root component with sidebar navigation
├── main.tsx            # React entry point
└── index.css           # Tailwind base + custom glass-panel utility
```
