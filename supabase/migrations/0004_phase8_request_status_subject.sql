-- TutorMatch — request status + subject. Run after 0003. Safe to re-run.

-- 1. New columns on lesson_requests.
alter table public.lesson_requests
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined'));

alter table public.lesson_requests
  add column if not exists subject_id integer references public.subjects (id) on delete set null;

-- 2. Allow the target tutor to update a request (used to set status).
--    RLS is row-level; the UI only changes `status`.
drop policy if exists "lesson_requests_update_tutor" on public.lesson_requests;
create policy "lesson_requests_update_tutor"
  on public.lesson_requests for update
  using (
    auth.uid() = (select tp.user_id from public.tutor_profiles tp where tp.id = tutor_id)
  )
  with check (
    auth.uid() = (select tp.user_id from public.tutor_profiles tp where tp.id = tutor_id)
  );
