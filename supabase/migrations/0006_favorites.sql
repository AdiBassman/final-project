-- TutorMatch — students can save (favorite) tutors. Run after 0005. Re-runnable.

create table if not exists public.favorites (
  student_id uuid not null references public.profiles (id) on delete cascade,
  tutor_id   uuid not null references public.tutor_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, tutor_id)
);

alter table public.favorites enable row level security;

-- Favorites are private: a user only ever sees/edits their own.
drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own"
  on public.favorites for select using (auth.uid() = student_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own"
  on public.favorites for insert with check (auth.uid() = student_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own"
  on public.favorites for delete using (auth.uid() = student_id);
