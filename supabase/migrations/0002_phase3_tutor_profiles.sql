-- TutorMatch — Phase 3: tutor_profiles, subjects, tutor_subjects + RLS.
-- Run in the Supabase SQL editor after 0001. Safe to re-run.

-- 1. tutor_profiles: extra details for users whose role = 'tutor' (1:1).
create table if not exists public.tutor_profiles (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid unique not null references public.profiles (id) on delete cascade,
  bio              text,
  city             text not null,
  hourly_rate      integer not null check (hourly_rate >= 0),
  online_available boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 2. subjects: fixed catalogue.
create table if not exists public.subjects (
  id   serial primary key,
  name text unique not null
);

-- 3. tutor_subjects: many-to-many between tutors and subjects.
create table if not exists public.tutor_subjects (
  tutor_id   uuid not null references public.tutor_profiles (id) on delete cascade,
  subject_id integer not null references public.subjects (id) on delete cascade,
  primary key (tutor_id, subject_id)
);

-- 4. RLS.
alter table public.tutor_profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.tutor_subjects enable row level security;

-- tutor_profiles: public read; a tutor manages only their own row.
drop policy if exists "tutor_profiles_select_public" on public.tutor_profiles;
create policy "tutor_profiles_select_public"
  on public.tutor_profiles for select using (true);

drop policy if exists "tutor_profiles_insert_own" on public.tutor_profiles;
create policy "tutor_profiles_insert_own"
  on public.tutor_profiles for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'tutor'
    )
  );

drop policy if exists "tutor_profiles_update_own" on public.tutor_profiles;
create policy "tutor_profiles_update_own"
  on public.tutor_profiles for update using (auth.uid() = user_id);

drop policy if exists "tutor_profiles_delete_own" on public.tutor_profiles;
create policy "tutor_profiles_delete_own"
  on public.tutor_profiles for delete using (auth.uid() = user_id);

-- subjects: public read; no client writes (seeded via SQL only).
drop policy if exists "subjects_select_public" on public.subjects;
create policy "subjects_select_public"
  on public.subjects for select using (true);

-- tutor_subjects: public read; a tutor edits links only for their own tutor row.
drop policy if exists "tutor_subjects_select_public" on public.tutor_subjects;
create policy "tutor_subjects_select_public"
  on public.tutor_subjects for select using (true);

drop policy if exists "tutor_subjects_insert_own" on public.tutor_subjects;
create policy "tutor_subjects_insert_own"
  on public.tutor_subjects for insert
  with check (
    exists (
      select 1 from public.tutor_profiles tp
      where tp.id = tutor_id and tp.user_id = auth.uid()
    )
  );

drop policy if exists "tutor_subjects_delete_own" on public.tutor_subjects;
create policy "tutor_subjects_delete_own"
  on public.tutor_subjects for delete
  using (
    exists (
      select 1 from public.tutor_profiles tp
      where tp.id = tutor_id and tp.user_id = auth.uid()
    )
  );

-- 5. Make the signup trigger idempotent (re-runs / seed inserts won't error).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 6. Seed the subject catalogue (idempotent).
insert into public.subjects (name) values
  ('Mathematics'), ('Physics'), ('Chemistry'), ('Biology'),
  ('English'), ('Hebrew'), ('Arabic'), ('History'),
  ('Computer Science'), ('Economics'), ('Statistics'),
  ('Psychology'), ('Geography')
on conflict (name) do nothing;
