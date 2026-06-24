-- TutorMatch — Phase 2: profiles table, signup trigger, RLS.
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- Safe to re-run: drops/recreates policies and trigger idempotently.

-- 1. profiles: one row per auth user, holds role + display name.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       text not null check (role in ('tutor', 'student')),
  full_name  text not null,
  created_at timestamptz not null default now()
);

-- 2. Enable Row Level Security.
alter table public.profiles enable row level security;

-- 3. Policies.
--    SELECT: anyone may read profiles (directory needs tutor names).
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

--    INSERT: a user may create only their own profile row.
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

--    UPDATE: a user may edit only their own profile row.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- 4. Trigger: auto-create a profile when a new auth user signs up.
--    Reads full_name + role from the signUp metadata (raw_user_meta_data).
--    SECURITY DEFINER so the insert runs regardless of the caller's RLS.
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
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
