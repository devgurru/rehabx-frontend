# RehabX — Clinician Web Portal

Desktop-first web portal for pediatric rehabilitation physicians. It is part of the RehabX **investor prototype**; the project overview, architecture, API reference and investor demo script are in the **backend** repository's README and `docs/DEMO_SCRIPT.md`.

> Prototype with fictional demo data. Not for clinical use.

## What's in it

- **Dashboard**: caseload stats, cohort KPI overview (baseline / current / target), patients requiring review, home-exercise adherence and recent activity.
- **Patients**: searchable and filterable table (name, age, diagnosis, specialty, progress, status, last assessment).
- **Patient profile** with tabs for Overview, Assessment, Rehabilitation plan, Exercises (live status and 3D guides), KPIs (cards, comparison and trend charts), Progress, Milestones (editable status) and Timeline.
- **Care-plan wizard**, the investor journey: Assessment → Clinical review → Specialty referral → Program → Exercise assignment (with a live 3D caregiver preview) → Goals & milestones.
- **Programs**, **Referrals**, **KPIs** (data-driven KPI model preview) and **Reports** (platform statistics and roadmap).

## Stack

React 19 · TypeScript (strict) · Vite 7 · React Router 7 · **TanStack Query** (server state) · **Redux Toolkit** (client state) · **shadcn/ui** + Tailwind CSS 4 · Recharts · react-three-fiber (3D exercise guide) · lucide icons.

| Concern | Where |
|---|---|
| Server data | `src/api/queries.ts`: typed TanStack Query hooks, one query-key factory, mutations invalidate the patient. Patient views poll every 15 s so caregiver completions appear live. |
| Client state | `src/store/`: `authSlice` (session, persisted), `carePlanSlice` (wizard draft per patient), `uiSlice` (patient filters) |
| UI kit | `src/components/ui/` (shadcn, added with `npx shadcn@latest add …`) + `src/components/shared/` |
| Charts | `src/components/charts/`: validated categorical palette, neutral baseline, 0–100 shared axis |
| 3D guide | `src/components/exercise3d/`: procedural child avatar + keyframe motions (shared with the mobile app) |

## Run

```bash
cp .env.example .env        # VITE_API_URL, default http://localhost:3000
npm install
npm run dev                 # http://localhost:5173
```

The backend must be running (see the backend README: `npm run db:up && npm run db:reset && npm run start:dev`).

**Demo login:** "Continue as demo clinician", or `clinician@rehabx.demo` / `demo`.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build (three.js and charts are split into lazy chunks) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run format` | Prettier (with Tailwind class sorting) |

## Responsive behaviour

Designed for desktop and laptop. On tablet widths the sidebar collapses to an icon rail, and grids reflow to one or two columns.
