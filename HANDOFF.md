# TutorMatch — Project Handoff

> Purpose: let a fresh Claude session (or developer) continue from exactly where work stopped, without re-planning. Last updated end of Phase 2 (code complete, validation in progress).

---

## 1. What the project is

**TutorMatch** — a small, focused marketplace MVP that helps students find private tutors by subject, city, and online availability, and send a lesson request in one flow. Academic final project for an AI Product Development course. Inspired by limudnaim.co.il but intentionally a much smaller MVP, **not** a clone.

**Core flow:** visitor browses tutor directory → opens a tutor profile → (logged in) sends a lesson request → tutor sees requests in a dashboard; student sees their sent requests in their dashboard.

**Grading priorities:** working end-to-end product > feature count. Product definition, UI/UX, frontend, DB design, integrations, deployment stability, documentation.

---

## 2. What has already been planned

A full design spec exists and is approved:
**`docs/superpowers/specs/2026-06-21-tutormatch-design.md`** — read this first. It contains the PRD, schema, ERD, RLS policies, routes, component architecture, data flow, folder structure, and the 7-phase roadmap. The summary below reflects it plus decisions made since.

---

## 3. What has already been implemented

### Phase 1 — Setup + UI shell ✅ (committed + pushed + deployed)
- Vite + React 19 + TypeScript + Tailwind v4 + React Router 7 scaffold.
- 8 routes inside a shared `Layout` with a `Navbar`; landing hero on Home; placeholder stubs elsewhere; 404 page.
- TS project references, `.env.example`, favicon, `.gitignore`, `vercel.json` (SPA rewrite).
- **Live on Vercel:** https://final-project-ochre-chi-15.vercel.app/ (deep-link refresh verified).

### Phase 2 — Supabase + Auth ✅ code complete (NOT yet committed; validation in progress)
- `src/lib/supabaseClient.ts` — single client, reads env, throws if missing.
- `src/lib/types.ts` — `Role` (`'tutor' | 'student'`), `Profile`.
- `src/auth/AuthProvider.tsx` — session + profile context; loads the profile before flipping `loading` off so guards never see a half-loaded state. Uses `onAuthStateChange` (fires INITIAL_SESSION + on every login/logout).
- `src/auth/useAuth.ts`, `ProtectedRoute.tsx` (redirect to `/login` if no session), `RoleRoute.tsx` (redirect to `/dashboard` if wrong role).
- `src/pages/Login.tsx`, `Signup.tsx` — real forms; role chosen at signup and passed as user metadata.
- `src/components/Navbar.tsx` — auth-aware (Dashboard / Edit Profile / name / Log out vs Log in / Sign up).
- `src/pages/Dashboard.tsx` — shows signed-in name + role (proof of auth; real request views come in Phase 6).
- DB migration `supabase/migrations/0001_phase2_profiles.sql` — `profiles` table, signup trigger (`handle_new_user`, SECURITY DEFINER, copies `full_name`+`role` from signup metadata), and RLS policies. **Run this in the Supabase SQL editor.** Note: the trigger only creates a profile on *new* signups — any auth user created before the table existed must be deleted and re-signed-up (or backfilled manually).

**Build + boot verified** (`npm run build` green, dev server boots clean, Supabase client initializes). End-to-end auth test was briefly blocked by a **Chrome CORS browser extension** on the user's machine (not a code bug — server endpoint + key tested healthy via curl). Re-testing with the extension disabled.

---

## 4. Current tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19, Vite 6, TypeScript |
| Routing | react-router-dom 7 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`; CSS-first, `@import "tailwindcss"` in `src/index.css`) |
| Backend | Supabase: Auth + Postgres + Row Level Security |
| Client lib | `@supabase/supabase-js` ^2.108 |
| Deploy | Vercel (SPA, no SSR, no Next.js) |

Scripts: `npm run dev`, `npm run build` (`tsc -b && vite build`), `npm run preview`.

---

## 5. Supabase / Vercel / GitHub setup

### Repository (IMPORTANT — non-standard layout)
- **The app lives in a subdirectory:** `adi-bassman/final-project/`.
- **The git repo root is the PARENT:** `c:/Dev/uriel/uriel-p/limud-naim/` — which also contains unrelated classmate folders (omer, rotem, ella, nodejsapp), all **untracked**.
- **Always scope `git add` to `adi-bassman/final-project`.** Never `git add -A` at the root.
- GitHub remote: `origin = https://github.com/AdiBassman/Final-project.git` (already configured; note capital F).
- **`git push` is blocked by Claude Code's auto safety classifier** from this repo (parent tree is broader than the app → flagged as exfiltration). The user must run `git push` manually from their own terminal.
- User policy: **no git commits or pushes unless the user explicitly asks.**

### Supabase
- Project ID: `aiwhtqukykvcauwdozus`
- Project URL: `https://aiwhtqukykvcauwdozus.supabase.co`
- Client uses the **publishable (anon) key** via `VITE_SUPABASE_ANON_KEY` in `.env.local` (gitignored). Safe for the browser because RLS enforces access.
- `.env.local` exists locally with `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.
- Migration `0001` must be run in the SQL editor (it was NOT run during the initial session — discovered when `profiles` 404'd with PGRST205). Email confirmation should be disabled (Auth → Providers → Email) for easy testing.
- ⚠️ **SECURITY:** the Supabase **secret key** (`sb_secret_…`) was pasted into an earlier chat. It must never be used in this frontend, and should be **rotated** in the dashboard (Settings → API). It is not stored in the codebase.

### Vercel
- Project imported from the GitHub repo. **Root Directory = `adi-bassman/final-project`** (critical, since the app is in a subdir).
- SPA rewrite via `vercel.json`. Auto-deploys on push to `main`.
- Phase 2.5 (pre-existing in the plan): set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` env vars in Vercel and add prod URL to Supabase Auth redirect allow-list so auth works in production. **Not done yet** — Vercel currently has no Supabase env vars.

---

## 6. Important decisions already made

1. **Both tutors AND students log in** (resolved a brief contradiction). Lesson request form will prefill name/email from the account; `lesson_requests` will carry a `student_id`.
2. **No duplicate `users` table** — a `profiles` table keyed to `auth.users(id)` holds `role` + `full_name`, auto-created by a DB trigger on signup.
3. **No image upload** — tutor avatars are generated from initials (DiceBear/initials). `image_url` dropped. No Supabase Storage.
4. **Students get a "My Requests" dashboard** mirroring the tutor dashboard (the `/dashboard` route is single and role-aware; one `Dashboard.tsx` branches by role rather than two route files).
5. **Subjects are a fixed seed list** (~10–15), multi-select chips, no free text. `subjects` + `tutor_subjects` join tables.
6. **No request status/handled flag** — lesson requests are immutable, view-only (YAGNI).
7. **Seed data** introduced as soon as tables exist: subjects + 10 tutors in Phase 3; sample lesson requests in Phase 5. Idempotent `supabase/seed.sql`.
8. **README is a living document** — updated at the end of every phase.
9. **Deploy early** — initial Vercel deploy already done (ahead of the planned Phase 2.5).

Out of scope (per brief): chat, payments, notifications, calendars, messaging, ratings/reviews, scheduling.

---

## 7. What still needs to be done

Remaining phases (each independently testable; see spec for full checklists/DoD):

- **Finish validating Phase 2** auth flow end-to-end (signup both roles, profile row created, guards redirect, session persists).
- **Commit Phase 2** (uncommitted right now) once validated.
- **Phase 2.5 — production auth:** add Supabase env vars in Vercel + redirect URLs; confirm auth works on the live URL.
- **Phase 3 — Tutor profiles (CRUD):** `tutor_profiles`, `subjects` (seeded), `tutor_subjects` + RLS; `EditTutorProfile` form, `SubjectMultiSelect`, `Avatar`; **seed 10–15 subjects + 10 tutors** across Israeli cities.
- **Phase 4 — Directory + filtering:** `TutorDirectory`, `TutorCard`, `FilterBar`, real `TutorProfile` page, `getTutors(filters)`.
- **Phase 5 — Lesson requests:** `lesson_requests` + RLS; `ContactModal` (auth-gated, prefilled); seed sample requests.
- **Phase 6 — Dashboards:** tutor sees received, student sees sent; `RequestCard`, `EmptyState`; verify cross-account isolation.
- **Phase 7 — Hardening + final docs:** loading/error polish, responsive pass, final README + ERD, redeploy.

### Planned schema for later phases (from the spec)
```
tutor_profiles(id, user_id→profiles UNIQUE, bio, city, hourly_rate, online_available, created_at, updated_at)
subjects(id serial, name unique)
tutor_subjects(tutor_id→tutor_profiles, subject_id→subjects, PK both)
lesson_requests(id, tutor_id→tutor_profiles, student_id→profiles, student_name, student_email, message, created_at)
```
RLS intent: public read on profiles/tutor_profiles/subjects/tutor_subjects; owner-only writes; `lesson_requests` INSERT where `auth.uid()=student_id`, SELECT where you're the student or the target tutor, no update/delete.

---

## 8. Next recommended steps (in order)

1. **Disable the Chrome CORS extension** (it caused the false "CORS error" during Phase 2 testing), then run `npm run dev` and complete the Phase 2 testing checklist (in the spec / Phase 2 summary).
2. Once auth passes, **commit Phase 2** (scoped to `adi-bassman/final-project`) and push manually.
3. **Phase 2.5:** add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` to Vercel, add the prod URL to Supabase Auth redirect URLs, redeploy, verify login on the live site.
4. **Start Phase 3** — begin with the SQL migration (`0002_*.sql`) for `tutor_profiles` + `subjects` + `tutor_subjects` + RLS + `seed.sql`, then build the tutor profile editor.
5. **Rotate the exposed Supabase secret key.**

### How the new session should work
- Use the **superpowers brainstorming/writing-plans workflow** already in motion; the design is approved, so go phase by phase.
- After each phase: build, run, test against the checklist, then stop for user validation before the next phase.
- Respect the **no-auto-commit / no-auto-push** policy and the **subdir git scoping**.
- Read `docs/superpowers/specs/2026-06-21-tutormatch-design.md` and this file before writing code.

---

## 9. Key file map

```
adi-bassman/final-project/
├─ HANDOFF.md                  ← this file
├─ README.md                   living doc (status per phase, setup, deploy URL)
├─ docs/superpowers/specs/2026-06-21-tutormatch-design.md   full design spec
├─ vercel.json                 SPA rewrite
├─ .env.example / .env.local   (.env.local gitignored)
├─ supabase/migrations/0001_phase2_profiles.sql   profiles + trigger + RLS (already run)
└─ src/
   ├─ main.tsx                 BrowserRouter + AuthProvider
   ├─ App.tsx                  routes + guards
   ├─ lib/        supabaseClient.ts, types.ts   (queries.ts comes later)
   ├─ auth/       AuthProvider, useAuth, ProtectedRoute, RoleRoute
   ├─ components/ Layout, Navbar, PageStub
   └─ pages/      Home, Login, Signup, TutorDirectory, TutorProfile,
                  Dashboard, EditTutorProfile, NotFound
```
