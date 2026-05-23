# AGENTS.md

## Project

study-buddy (学习搭子) — Chinese-language study accountability web app. Next.js 14 App Router, React 18, TypeScript, SQLite, Tailwind CSS.

The actual app lives in `study-buddy/`. All `npm` commands must run from `study-buddy/`, not the workspace root.

## Commands

```bash
# From study-buddy/
npm run dev      # Dev server (next dev)
npm run build    # Production build (next build)
npm run lint     # ESLint (next lint)
```

No test framework is configured. No typecheck script — `tsc` checks happen via `next build`.

## Architecture

- **Database:** SQLite via `better-sqlite3` (WAL mode). File: `study-buddy/data.db` in project root. Schema auto-creates on first access via `src/lib/db.ts`. Migrations are try/catch `ALTER TABLE` statements in that same file.
- **Auth:** JWT (`jose`) in httpOnly cookie `sb-token`. Default secret in `src/lib/auth.ts` and `src/middleware.ts` — override with `JWT_SECRET` env var in production.
- **Middleware:** `src/middleware.ts` guards `/dashboard` and `/stats`; redirects logged-in users away from `/login` and `/register`.

### Source layout (`study-buddy/src/`)

- `middleware.ts` — JWT auth guard
- `app/` — Next.js App Router pages
  - `(app)/` — Authenticated route group (dashboard, stats)
  - `api/` — REST API routes (auth, todos, pair, partner, stats)
  - `login/`, `register/` — Public auth pages
- `components/` — All React client components (`'use client'`)
- `lib/` — `db.ts`, `auth.ts`, `gamification.ts`, `streak.ts`, `constants.ts`

### Key patterns

- All pages are client components fetching from API routes — no server components with data fetching.
- Path alias `@/*` maps to `./src/*`.
- Dark mode: `.dark` class on `<html>`, toggled via localStorage.
- Gamification: +10 create task, +20 complete task, +5 receive like. Level = floor(sqrt(points/100)) + 1.

## Deployment

Two deploy scripts exist at workspace root (not inside `study-buddy/`):
- `deploy.sh` — Bash script: creates tarball, SCPs to server, builds remotely, restarts via PM2.
- `deploy.py` — Python/paramiko equivalent with initial key setup flow.

Deployment excludes `node_modules`, `.next`, `.git`, and `data.db*` (preserves remote DB).

## Gotchas

- Working directory for all app commands is `study-buddy/`, not workspace root.
- SQLite DB file (`data.db`) is excluded from deployment — schema changes require manual migration or adding `ALTER TABLE` to `db.ts`.
- The `data.db` file should not be committed (it's user data).
- The JWT secret defaults to a hardcoded string — must set `JWT_SECRET` env var for production.