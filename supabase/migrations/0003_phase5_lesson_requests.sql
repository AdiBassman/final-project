-- TutorMatch — Phase 5: lesson_requests + RLS.
-- Run in the Supabase SQL editor after 0002. Safe to re-run.

create table if not exists public.lesson_requests (
  id            uuid primary key default gen_random_uuid(),
  tutor_id      uuid not null references public.tutor_profiles (id) on delete cascade,
  student_id    uuid not null references public.profiles (id) on delete cascade,
  student_name  text not null,
  student_email text not null,
  message       text not null,
  created_at    timestamptz not null default now()
);

create index if not exists lesson_requests_tutor_id_idx on public.lesson_requests (tutor_id);
create index if not exists lesson_requests_student_id_idx on public.lesson_requests (student_id);

alter table public.lesson_requests enable row level security;

-- INSERT: an authenticated user may create a request only as themselves.
drop policy if exists "lesson_requests_insert_own" on public.lesson_requests;
create policy "lesson_requests_insert_own"
  on public.lesson_requests for insert
  with check (auth.uid() = student_id);

-- SELECT: visible to the student who sent it OR the tutor it was sent to.
drop policy if exists "lesson_requests_select_party" on public.lesson_requests;
create policy "lesson_requests_select_party"
  on public.lesson_requests for select
  using (
    auth.uid() = student_id
    or auth.uid() = (
      select tp.user_id from public.tutor_profiles tp where tp.id = tutor_id
    )
  );

-- No UPDATE/DELETE policies: lesson requests are immutable.
