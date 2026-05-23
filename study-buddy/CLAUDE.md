# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

study-buddy (学习搭子) — A Chinese-language study accountability web app built with Next.js 14 (App Router), React 18, TypeScript, and SQLite.

## Commands

All commands run from the `study-buddy/` directory:

```bash
npm run dev      # Start dev server (next dev)
npm run build    # Production build (next build)
npm run start    # Start production server (next start)
npm run lint     # ESLint (next lint)
```

No test framework is configured.

## Architecture

### Tech Stack
- **Framework:** Next.js 14 App Router
- **Database:** SQLite via `better-sqlite3` (WAL mode, file: `data.db` in project root)
- **Auth:** JWT (`jose`) in httpOnly cookies (`sb-token`), bcrypt password hashing
- **Styling:** Tailwind CSS + CSS custom properties (Gumroad-inspired design system, light/dark mode via `.dark` class)
- **Font:** Satoshi (fontshare CDN)

### Source Layout (`src/`)

- `middleware.ts` — JWT auth guard, protects `/dashboard` and `/stats`
- `app/` — Next.js App Router pages
  - `(app)/` — Route group for authenticated pages (dashboard, stats)
  - `api/` — REST API routes (auth, todos, pair, partner, stats)
- `components/` — React client components (all use `'use client'`)
- `lib/` — Shared utilities:
  - `db.ts` — SQLite singleton, auto-creates schema on first access
  - `auth.ts` — JWT sign/verify, password hashing helpers
  - `gamification.ts` — Points system, level calculation
  - `streak.ts` — Consecutive-day streak logic
  - `constants.ts` — Tags and priority definitions

### Key Patterns

- All pages are client components that fetch data from API routes (no server components with data fetching).
- Database schema migrations use try/catch `ALTER TABLE` statements in `db.ts`.
- The `@/*` path alias maps to `./src/*`.
- Dark mode toggled via localStorage, applied as `.dark` class on `<html>`.
- Gamification: +10 create task, +20 complete task, +5 receive like. Level = floor(sqrt(points/100)) + 1.

### Pairing System
Users pair by username. Partners can view each other's tasks, like completed tasks, and send nudge notifications.
