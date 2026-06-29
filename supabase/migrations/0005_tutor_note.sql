-- TutorMatch — optional tutor reply note on a lesson request. Run after 0004.
-- The tutor UPDATE policy from 0004 already covers writing this column.

alter table public.lesson_requests
  add column if not exists tutor_note text;
