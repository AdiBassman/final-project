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
- **Backend:** Supabase (Auth, PostgreSQL, Row Level Security) — added in Phase 2
- **Deployment:** Vercel

## Setup

```bash
npm install
npm run dev
```

App runs at the URL Vite prints (default http://localhost:5173).

Supabase env vars are required from Phase 2 onward — copy `.env.example` to `.env.local` and fill in.

## Build

```bash
npm run build      # type-check + production build
npm run preview    # preview the production build locally
```

## Deployment

Deployment link: _TBD (added in Phase 2.5 — initial Vercel deploy)._

## Project status

- **Phase 1 — Setup + UI shell:** ✅ App scaffolded (Vite + React + TS + Tailwind + React Router). All routes navigable with placeholder pages, shared layout, and navbar.
- Phases 2–7: pending.

See [`docs/superpowers/specs/2026-06-21-tutormatch-design.md`](docs/superpowers/specs/2026-06-21-tutormatch-design.md) for the full design spec and phased roadmap.
