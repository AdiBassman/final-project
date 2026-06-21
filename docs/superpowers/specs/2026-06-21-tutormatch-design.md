# TutorMatch — Design Spec

**Date:** 2026-06-21
**Type:** Final project, AI Product Development course
**Status:** Approved design, pre-implementation

---

## 1. Product Overview

**TutorMatch** is a marketplace MVP that centralizes private-tutor discovery and lesson inquiries in one place, replacing fragmented searching across Facebook/WhatsApp groups and word of mouth.

**Value proposition:** Students find a suitable tutor (by subject, city, online availability) and send a lesson request in one flow, instead of manually comparing scattered listings.

**Inspired by** limudnaim.co.il but intentionally a small, focused MVP — not a clone.

### Target audience
- Primary: high school + university students.
- Secondary: parents searching for their children.

### Competitors
- Direct: LimudNaim, other tutor marketplaces.
- Indirect: Facebook groups, WhatsApp groups, Google search, personal recommendations.

### Differentiation
- Single centralized directory with structured filtering (subject / city / online).
- Direct in-platform lesson requests with a per-tutor inbox.
- Clean, focused UX — no noise, no irrelevant marketplace features.

---

## 2. Core User Flow

```
Visitor lands on Home
  -> browses Tutor Directory (filter by subject / city / online)
  -> opens a Tutor Profile
  -> clicks Contact Tutor (must be logged in; redirect to login if not)
  -> submits lesson request (name + email prefilled from account, + message)
Tutor logs in
  -> Dashboard shows lesson requests received
Student logs in
  -> Dashboard ("My Requests") shows requests they sent
```

---

## 3. Resolved Product Decisions

| Topic | Decision | Rationale |
|---|---|---|
| Student auth | Both tutors AND students log in. | Resolves brief's name/email-vs-"authenticated submit" conflict. Request form prefills from account; `lesson_requests` carries `student_id`. |
| User/role storage | No duplicate `users` table. `profiles` table keyed to `auth.users(id)`, holds `role` + `full_name`. Auto-created by DB trigger on signup. | Supabase Auth already owns identity; mirroring it invites drift. |
| Profile image | Cut. Generated initials/DiceBear avatar. No Supabase Storage. | Removes a whole class of complexity (bucket, storage RLS, upload UI, broken images) for an optional field. |
| Student role scope | Student gets a "My Requests" dashboard mirroring the tutor dashboard. | Justifies the student account; gradeable symmetry; cheap RLS. |
| Subjects | Fixed seed list (~15 rows), multi-select chips. No free text. | Matches `subjects` + `tutor_subjects` join; keeps filtering clean. |
| Request status / handled flag | Cut. Requests are immutable, view-only. | YAGNI; keeps MVP small. |

### Explicitly out of scope (per brief)
Chat, payments, notifications, calendars, messaging, ratings/reviews, scheduling.

---

## 4. Database Schema (Postgres / Supabase)

```
profiles                      -- 1 row per auth user
  id            uuid  PK, FK -> auth.users(id) ON DELETE CASCADE
  role          text  NOT NULL CHECK (role IN ('tutor','student'))
  full_name     text  NOT NULL
  created_at    timestamptz DEFAULT now()

tutor_profiles                -- 1:1 with a profile whose role='tutor'
  id               uuid  PK DEFAULT gen_random_uuid()
  user_id          uuid  UNIQUE NOT NULL FK -> profiles(id) ON DELETE CASCADE
  bio              text
  city             text  NOT NULL
  hourly_rate      integer NOT NULL CHECK (hourly_rate >= 0)
  online_available boolean NOT NULL DEFAULT false
  created_at       timestamptz DEFAULT now()
  updated_at       timestamptz DEFAULT now()

subjects                      -- seed data (~15 rows)
  id            serial PK
  name          text UNIQUE NOT NULL

tutor_subjects                -- many-to-many join
  tutor_id      uuid FK -> tutor_profiles(id) ON DELETE CASCADE
  subject_id    int  FK -> subjects(id) ON DELETE CASCADE
  PRIMARY KEY (tutor_id, subject_id)

lesson_requests
  id            uuid PK DEFAULT gen_random_uuid()
  tutor_id      uuid NOT NULL FK -> tutor_profiles(id) ON DELETE CASCADE
  student_id    uuid NOT NULL FK -> profiles(id) ON DELETE CASCADE
  student_name  text NOT NULL     -- snapshot at send time
  student_email text NOT NULL     -- snapshot at send time
  message       text NOT NULL
  created_at    timestamptz DEFAULT now()
```

**Notes**
- `full_name` lives on `profiles` (both roles have a name), not on `tutor_profiles`.
- `student_name`/`student_email` are snapshots stored on the request so the tutor's inbox is stable even if the student later changes their account.

### ERD (relationships)

```
auth.users 1───1 profiles 1───1 tutor_profiles 1───* tutor_subjects *───1 subjects
                     │                                  │
                     │ (as student)                     │ (as tutor target)
                     *                                  *
                  lesson_requests ──────────────────────
```

- `auth.users` 1:1 `profiles`
- `profiles` 1:1 `tutor_profiles` (only when role='tutor')
- `tutor_profiles` *:* `subjects` via `tutor_subjects`
- `tutor_profiles` 1:* `lesson_requests` (tutor receives many)
- `profiles` 1:* `lesson_requests` (student sends many)

---

## 5. RLS Policies

RLS = Row Level Security: per-row access rules Postgres enforces on every query using `auth.uid()`. Since the React app talks directly to the DB (no backend server), RLS *is* the security layer.

**profiles** (RLS on)
- SELECT: `true` — public read (directory needs tutor names).
- INSERT: `auth.uid() = id` — create only your own row (trigger handles it at signup).
- UPDATE: `auth.uid() = id` — edit only your own.

**tutor_profiles** (RLS on)
- SELECT: `true` — public browse.
- INSERT: `auth.uid() = user_id` and caller's profile role = 'tutor'.
- UPDATE: `auth.uid() = user_id` — owner only.
- DELETE: `auth.uid() = user_id` — owner only.

**subjects** (RLS on)
- SELECT: `true`.
- No write policy — seeded via migration only.

**tutor_subjects** (RLS on)
- SELECT: `true`.
- INSERT / DELETE: allowed only when `tutor_id` belongs to `auth.uid()` (subquery: `tutor_id IN (SELECT id FROM tutor_profiles WHERE user_id = auth.uid())`).

**lesson_requests** (RLS on)
- INSERT: `auth.uid() = student_id` — authenticated student creates own request.
- SELECT: `auth.uid() = student_id` OR `auth.uid() = (SELECT user_id FROM tutor_profiles WHERE id = tutor_id)` — student sees what they sent; tutor sees what was sent to them; nobody else.
- No UPDATE / DELETE policy — requests are immutable.

---

## 6. Routes / Pages

| Route | Page | Access |
|---|---|---|
| `/` | Home / landing + CTA to directory | public |
| `/tutors` | Directory: search + filters | public |
| `/tutors/:id` | Tutor profile + Contact button | public |
| `/login` | Login | public |
| `/signup` | Signup (choose role tutor/student) | public |
| `/dashboard` | Tutor: requests received. Student: My Requests | authenticated (role-aware) |
| `/profile/edit` | Tutor: create/edit profile + subjects | authenticated + role=tutor |
| `*` | 404 Not Found | public |

Contact action is a modal on the tutor profile page; auth-gated (redirect to `/login` if no session).

---

## 7. Component Architecture

```
src/
  lib/
    supabaseClient.ts        // single supabase-js instance
    queries.ts               // typed data-access fns (getTutors, getTutor, sendRequest, ...)
    types.ts                 // DB row types
  auth/
    AuthProvider.tsx         // session context
    useAuth.ts
    ProtectedRoute.tsx       // redirect if no session
    RoleRoute.tsx            // redirect if wrong role
  components/
    Navbar.tsx               // auth-aware links
    Layout.tsx
    TutorCard.tsx
    FilterBar.tsx            // subject select, city input, online toggle
    SubjectMultiSelect.tsx
    Avatar.tsx               // initials / DiceBear
    ContactModal.tsx
    RequestCard.tsx
    EmptyState.tsx
    Spinner.tsx
    ErrorMessage.tsx
  pages/
    Home.tsx  Login.tsx  Signup.tsx  TutorDirectory.tsx  TutorProfile.tsx
    TutorDashboard.tsx  StudentDashboard.tsx  EditTutorProfile.tsx  NotFound.tsx
  App.tsx
  main.tsx
  index.css
```

**Data flow:** components → `queries.ts` → supabase-js → Postgres (RLS enforces access). Auth session held in `AuthProvider` context. No global state library — React Router + context + local component state is sufficient.

---

## 8. Tech Stack

- **Frontend:** React + Vite + TypeScript, React Router.
- **Styling:** Tailwind CSS.
- **Backend:** Supabase (Auth, PostgreSQL, Row Level Security).
- **Deployment:** Vercel (SPA, no SSR, no Next.js).

---

## 9. Phased Implementation Roadmap

Each phase is independently runnable and testable, with a checkpoint before moving on.

**Cross-cutting conventions (apply every phase):**
- **README is a living document** — update it at the end of every phase (what got built, how to run it, any new env vars), not only at the end.
- **Seed data is introduced as soon as its tables exist** — subjects + 10 tutors land in Phase 3 (earliest possible, since their tables are created there); sample lesson requests land in Phase 5. Seed via an idempotent SQL script (`supabase/seed.sql`) re-runnable in the Supabase SQL editor.
- **Deploy early** — an initial Vercel deploy happens right after Phase 2 (see Phase 2.5) to surface env-var, routing, and SPA-rewrite issues while the app is still small.

### Seed data set (target content)
- **Subjects (10–15):** Mathematics, Physics, Chemistry, Biology, English, Hebrew, Arabic, History, Computer Science, Economics, Statistics, Psychology, Geography.
- **Cities (Israeli):** Tel Aviv, Jerusalem, Haifa, Be'er Sheva, Rishon LeZion, Petah Tikva, Netanya, Ramat Gan, Herzliya, Be'er Ya'akov.
- **Tutors (10):** realistic names, bios, hourly rates (₪80–₪250), mix of online/in-person, 1–3 subjects each, spread across the cities above.
- **Lesson requests:** several sample rows targeting a couple of tutors, so both dashboards have content to show during testing (added in Phase 5).

### Phase 1 — Setup + UI shell
- **Goal:** App runs locally; all routes navigable with placeholder pages.
- **Features:** Vite+React+TS scaffold, Tailwind, React Router, Navbar/Layout, page stubs, env scaffold.
- **DB:** none.
- **Test checklist:** `npm run dev` boots; every route renders; nav links work; no console errors.
- **DoD:** App boots, routing works.

### Phase 2 — Supabase + Authentication
- **Goal:** Sign up / log in / log out; role chosen at signup.
- **Features:** `supabaseClient`, `AuthProvider`/`useAuth`, Login + Signup pages, `ProtectedRoute` + `RoleRoute`, Navbar reflects session.
- **DB:** `profiles` table + signup trigger + RLS; Supabase Auth enabled.
- **Test checklist:** sign up as tutor and as student; log out/in; session persists on refresh; protected route redirects when logged out.
- **DoD:** Both roles authenticate; `profiles` row auto-created with correct role.
- **README:** add Supabase setup + env var instructions.

### Phase 2.5 — Initial Vercel deploy (early checkpoint)
- **Goal:** Get the authenticated app live on Vercel before more features land, to catch deployment problems early.
- **Features:** Vercel project linked, env vars set in Vercel, SPA rewrite config (`vercel.json` rewriting all routes to `/index.html`), production Supabase auth redirect URLs configured.
- **DB:** none.
- **Test checklist:** prod URL loads; deep-link to a route (e.g. `/login`) works on refresh (no 404 → SPA rewrite OK); signup/login works against Supabase from prod; env vars resolve.
- **DoD:** App is live on Vercel; auth works in production; routing survives refresh. Deploy link added to README.

### Phase 3 — Tutor profiles (CRUD)
- **Goal:** Tutor creates/edits their profile + subjects.
- **Features:** `EditTutorProfile` form, `SubjectMultiSelect`, `Avatar`, queries (upsert profile, set subjects).
- **DB:** `tutor_profiles`, `subjects` (seeded), `tutor_subjects` + RLS. **Seed `supabase/seed.sql` with 10–15 subjects + 10 realistic tutors across Israeli cities** so the directory has content from here on.
- **Test checklist:** tutor saves profile; reload shows persisted data; edits persist; cannot edit another tutor's profile (verify RLS in SQL editor); seed script runs cleanly and is idempotent.
- **DoD:** Tutor profile CRUD + subject assignment work end-to-end; seed data present.
- **README:** document seed script usage.

### Phase 4 — Directory + filtering
- **Goal:** Browse and filter tutors.
- **Features:** `TutorDirectory`, `TutorCard`, `FilterBar`, `TutorProfile` page, `getTutors(filters)`.
- **DB:** none (read queries; optional view for tutor+subjects).
- **Test checklist:** list shows seeded tutors; filter by subject / city / online works individually and combined; profile page loads by id.
- **DoD:** Search + filters return correct results.

### Phase 5 — Lesson requests
- **Goal:** Logged-in student sends a request.
- **Features:** `ContactModal` (prefilled, auth-gated), `sendRequest` query.
- **DB:** `lesson_requests` + RLS. **Add sample lesson requests to `supabase/seed.sql`** targeting a couple of seeded tutors so dashboards have content in Phase 6.
- **Test checklist:** student sends request → row appears in DB; clicking Contact while logged out redirects to login; cannot insert a request with another user's `student_id` (verify RLS).
- **DoD:** Students submit requests; stored correctly with snapshot name/email; sample requests seeded.

### Phase 6 — Dashboards
- **Goal:** Tutor sees requests received; student sees requests sent.
- **Features:** `TutorDashboard`, `StudentDashboard`, `RequestCard`, `EmptyState`, queries.
- **DB:** none (RLS from Phase 5).
- **Test checklist:** tutor sees only their own received requests; student sees only their own sent requests; empty states render; cross-account isolation verified.
- **DoD:** Both dashboards correct and isolated.

### Phase 7 — Production hardening + final docs
- **Goal:** Polished, fully documented production app (already deployed in Phase 2.5; this phase redeploys the finished build).
- **Features:** loading/error polish, responsive pass, final README pass + ERD, redeploy latest to Vercel.
- **DB:** production RLS audit.
- **Test checklist:** full prod flow (signup → browse → request → dashboard); RLS holds in prod; mobile/responsive check.
- **DoD:** Live URL works end-to-end; README + ERD complete.

---

## 10. Documentation Deliverables

- **README:** overview, problem statement, target audience, competitor analysis, differentiation, setup instructions, technologies, deployment link placeholder.
- **ERD:** tables, columns, data types, PKs, FKs, relationships (section 4 above is the source).
