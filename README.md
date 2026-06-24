# TutorMatch

A focused marketplace MVP that helps students discover private tutors by subject, city, and online availability — and send a lesson request in one flow. Academic final project for an AI Product Development course.

> **Living document:** updated at the end of every implementation phase.

## Problem statement

Finding a private tutor is fragmented — students dig through Facebook groups, WhatsApp groups, Google, and word of mouth, manually comparing scattered listings. TutorMatch centralizes tutor discovery and lesson inquiries in one place.

## Target audience

- **Primary:** high school and university students.
- **Secondary:** parents searching for a tutor for their children.

## Competitor analysis

- **Direct:** LimudNaim and other tutor marketplaces.
- **Indirect:** Facebook groups, WhatsApp groups, Google search, personal recommendations.

## Product differentiation

- One centralized directory with structured filtering (subject / city / online).
- Direct in-platform lesson requests with a per-tutor inbox.
- Clean, focused UX — no noise, no irrelevant marketplace features.

## Technologies used

- **Frontend:** React + Vite + TypeScript, React Router
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Auth, PostgreSQL, Row Level Security)
- **Deployment:** Vercel

## Setup

```bash
npm install
npm run dev
```

App runs at the URL Vite prints (default http://localhost:5173).

### Supabase setup

1. Copy `.env.example` to `.env.local` and fill in your Supabase **Project URL** and **publishable (anon) key**. Never put the secret key in this app.
2. In the Supabase SQL editor, run the migrations in `supabase/migrations/` in order (`0001_…`, `0002_…`, `0003_…`). Then optionally run `supabase/seed.sql` to load 10 demo tutors, 2 demo students, and sample lesson requests (all seeded accounts share the password `TutorDemo123!`).
3. Auth → Providers → Email: for easy local testing, **disable "Confirm email"** so signup logs you in immediately.
4. Auth → URL Configuration: add your local (`http://localhost:5173`) and production Vercel URLs to the redirect allow-list.

## Build

```bash
npm run build      # type-check + production build
npm run preview    # preview the production build locally
```

## Deployment

Deployed on Vercel as a single-page app. `vercel.json` rewrites all routes to
`/index.html` so deep links survive a refresh.

**Vercel project settings (this app is in a subdirectory of the repo):**
- **Root Directory:** `adi-bassman/final-project`
- Framework: Vite · Build: `npm run build` · Output: `dist`
- Env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`): added in Phase 2.5.

Deployment link: https://final-project-ochre-chi-15.vercel.app/

## Project status

- **Phase 1 — Setup + UI shell:** ✅ App scaffolded (Vite + React + TS + Tailwind + React Router). All routes navigable with placeholder pages, shared layout, and navbar.
- **Early Vercel deploy:** ✅ Live with SPA rewrite (deep-link refresh verified). Subdir root config validated ahead of Phase 2.5.
- **Phase 2 — Supabase + Auth:** ✅ Email/password signup (role chosen at signup), login, logout. `profiles` table auto-populated by a DB trigger; RLS enabled. Route guards (`ProtectedRoute`, `RoleRoute`) and an auth-aware navbar.
- **Phase 3 — Tutor profiles + seed:** ✅ `tutor_profiles`, `subjects`, `tutor_subjects` tables + RLS. Tutors create/edit their profile (bio, city, hourly rate, online availability, subjects) at `/profile/edit`. Initials `Avatar`, `SubjectMultiSelect` chips, `lib/queries.ts` data layer. `seed.sql` loads 10 demo tutors across Israeli cities.
- **Phase 4 — Directory + filtering:** ✅ `/tutors` lists all tutors (`TutorCard` grid) with client-side filters (name search, subject, city, online-only). `/tutors/:id` shows a full tutor profile. Shared `Spinner`/`EmptyState`/`ErrorMessage`.
- **Phase 5 — Lesson requests:** ✅ `lesson_requests` table + RLS (student inserts own; student & target tutor can read). `ContactModal` on the tutor profile (auth-gated; prefilled name/email from account). `sendLessonRequest` query. Seed adds 2 students + sample requests.
- Phases 6–7: pending.

See [`docs/superpowers/specs/2026-06-21-tutormatch-design.md`](docs/superpowers/specs/2026-06-21-tutormatch-design.md) for the full design spec and phased roadmap.
