# IITIX Labs — Operational Intelligence Platform

A disciplined command center for JEE and NEET exam preparation. Tracks focus/study time, attendance, assessments, analytics, and daily goals. All data stored locally in the browser (localStorage).

## Run & Operate

- `pnpm --filter @workspace/iitix-labs run dev` — run the frontend (via workflow: `artifacts/iitix-labs: web`)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port varies, via workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite 7, inline CSS styles (no Tailwind used at runtime), Recharts for charts
- No backend required — all data stored in localStorage via the `store` helper
- Auth: local user store (signup/login/session in localStorage)

## Where things live

- `artifacts/iitix-labs/src/AppEnhanced.jsx` — the entire app (single large file with all components)
- `artifacts/iitix-labs/src/main.tsx` — entry point, imports AppEnhanced
- `artifacts/iitix-labs/src/index.css` — minimal Tailwind base (app uses inline styles)
- `artifacts/iitix-labs/tailwind.config.js` — Tailwind v3 config

## Architecture decisions

- The app uses inline JS styles throughout (not Tailwind classes), so Tailwind is included but barely used
- All state is persisted to localStorage via the `store` helper (key prefix: `iitix_`)
- `useTimerController()` is a custom hook managing Pomodoro and stopwatch state at the root level to prevent timer resets on navigation
- Auth flow: landing → login/signup → onboarding (6-step profile setup) → daily initialization (3-step daily goals) → main app

## Product

- **Dashboard**: KPI cards, progress charts, task list, quick stats
- **Focus Systems**: Pomodoro timer (4 presets) + stopwatch with session labeling
- **Attendance**: Daily attendance tracking with calendar view and streak counter
- **Operations/Analytics/Assessments/Reports**: Navigation sections (placeholder implementations)
- **Profile**: User info + sign out

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The main app file is `AppEnhanced.jsx` (not `App.tsx`) — `App.tsx` is a stub that re-exports it
- `TimerController` was renamed to `useTimerController` during migration (was incorrectly called as a plain function)
- `DailyInitialization` component was referenced but missing — added during migration
- Tailwind v3 is used (not v4), so `postcss.config.js` is needed; `@tailwindcss/vite` plugin is removed

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
