-- TutorMatch — development seed data.
-- Run in the Supabase SQL editor AFTER 0001 + 0002. Idempotent (re-runnable).
--
-- Creates 10 confirmed tutor accounts. The signup trigger turns each auth user
-- into a profiles row (role=tutor); we then add tutor_profiles + subject links.
-- All seeded tutors share the demo password below (handy for grading/demo).
--
--   Demo tutor password: TutorDemo123!
--   Emails: <name>@tutormatch.test

create extension if not exists pgcrypto with schema extensions;

-- 1. Auth users (confirmed). Fixed UUIDs so re-runs are stable.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000001','authenticated','authenticated','noa.cohen@tutormatch.test',     crypt('TutorDemo123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Noa Cohen","role":"tutor"}',     now(), now()),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000002','authenticated','authenticated','daniel.levi@tutormatch.test',   crypt('TutorDemo123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Daniel Levi","role":"tutor"}',   now(), now()),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000003','authenticated','authenticated','maya.friedman@tutormatch.test', crypt('TutorDemo123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Maya Friedman","role":"tutor"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000004','authenticated','authenticated','itai.mizrahi@tutormatch.test',  crypt('TutorDemo123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Itai Mizrahi","role":"tutor"}',  now(), now()),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000005','authenticated','authenticated','tamar.azoulay@tutormatch.test', crypt('TutorDemo123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Tamar Azoulay","role":"tutor"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000006','authenticated','authenticated','yossi.peretz@tutormatch.test',  crypt('TutorDemo123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Yossi Peretz","role":"tutor"}',  now(), now()),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000007','authenticated','authenticated','shira.katz@tutormatch.test',    crypt('TutorDemo123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Shira Katz","role":"tutor"}',    now(), now()),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000008','authenticated','authenticated','omer.bar@tutormatch.test',      crypt('TutorDemo123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Omer Bar","role":"tutor"}',      now(), now()),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000009','authenticated','authenticated','lior.shapira@tutormatch.test',  crypt('TutorDemo123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Lior Shapira","role":"tutor"}',  now(), now()),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000010','authenticated','authenticated','avigail.dahan@tutormatch.test', crypt('TutorDemo123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Avigail Dahan","role":"tutor"}', now(), now()),
  -- Two demo students (password also TutorDemo123!) so dashboards have content.
  ('00000000-0000-0000-0000-000000000000','c0000000-0000-0000-0000-000000000001','authenticated','authenticated','student.one@tutormatch.test',   crypt('TutorDemo123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Ron Student","role":"student"}',   now(), now()),
  ('00000000-0000-0000-0000-000000000000','c0000000-0000-0000-0000-000000000002','authenticated','authenticated','student.two@tutormatch.test',   crypt('TutorDemo123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Gal Student","role":"student"}',   now(), now())
on conflict (id) do nothing;

-- 1b. GoTrue crashes on login (HTTP 500) if these token columns are NULL rather
--     than empty strings. Backfill them for the seeded users (idempotent).
update auth.users set
  confirmation_token     = coalesce(confirmation_token, ''),
  recovery_token         = coalesce(recovery_token, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change           = coalesce(email_change, '')
where email like '%@tutormatch.test';

-- 2. Identities (GoTrue needs these for email/password login).
insert into auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
select
  gen_random_uuid(), u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now()
from auth.users u
where u.email like '%@tutormatch.test'
on conflict (provider_id, provider) do nothing;

-- 3. tutor_profiles (one per seeded tutor). Fixed UUIDs for stable re-runs.
insert into public.tutor_profiles (id, user_id, bio, city, hourly_rate, online_available)
values
  ('b0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','Patient math & physics tutor. Helps with bagrut and first-year university courses.','Tel Aviv',     120, true),
  ('b0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000002','English literature and history teacher with 8 years of experience.','Jerusalem',                       100, false),
  ('b0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000003','Chemistry and biology specialist. Lab-focused, exam-oriented sessions.','Haifa',                        150, true),
  ('b0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000004','Math and statistics tutor for high school and university students.','Be''er Sheva',                    90,  true),
  ('b0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000005','Native Hebrew and Arabic tutor. Conversation and grammar.','Rishon LeZion',                            130, false),
  ('b0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000006','Computer science and math tutor. Python, algorithms, and bagrut 5 units.','Petah Tikva',               110, true),
  ('b0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000007','Biology and psychology tutor. Clear explanations, lots of practice.','Netanya',                        140, true),
  ('b0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000008','Economics and statistics tutor for university students.','Ramat Gan',                                  160, false),
  ('b0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000009','Physics and advanced math. Specializes in 5-unit bagrut.','Herzliya',                                  200, true),
  ('b0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000010','Friendly English and geography tutor for middle and high school.','Be''er Ya''akov',                    85,  true)
on conflict (user_id) do nothing;

-- 4. tutor_subjects (link each tutor to subjects by name).
insert into public.tutor_subjects (tutor_id, subject_id)
select tp.id, s.id
from (values
  ('b0000000-0000-0000-0000-000000000001', array['Mathematics','Physics']),
  ('b0000000-0000-0000-0000-000000000002', array['English','History']),
  ('b0000000-0000-0000-0000-000000000003', array['Chemistry','Biology']),
  ('b0000000-0000-0000-0000-000000000004', array['Mathematics','Statistics']),
  ('b0000000-0000-0000-0000-000000000005', array['Hebrew','Arabic']),
  ('b0000000-0000-0000-0000-000000000006', array['Computer Science','Mathematics']),
  ('b0000000-0000-0000-0000-000000000007', array['Biology','Psychology']),
  ('b0000000-0000-0000-0000-000000000008', array['Economics','Statistics']),
  ('b0000000-0000-0000-0000-000000000009', array['Physics','Mathematics']),
  ('b0000000-0000-0000-0000-000000000010', array['English','Geography'])
) as seed(tutor_id, subject_names)
cross join lateral unnest(seed.subject_names) as sn(name)
join public.tutor_profiles tp on tp.id = seed.tutor_id::uuid
join public.subjects s on s.name = sn.name
on conflict (tutor_id, subject_id) do nothing;

-- 5. Sample lesson requests (so tutor + student dashboards have content).
--    Requires table lesson_requests (migration 0003). Fixed ids = idempotent.
insert into public.lesson_requests (id, tutor_id, student_id, student_name, student_email, message)
values
  ('d0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','Ron Student','student.one@tutormatch.test','Hi Noa, I need help preparing for my 5-unit math bagrut. Are you available on weekends?'),
  ('d0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000001','Ron Student','student.one@tutormatch.test','Hello Maya, looking for chemistry help before my next exam. What is your availability?'),
  ('d0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000002','Gal Student','student.two@tutormatch.test','Hi, can you tutor physics for first-year university? Thanks!')
on conflict (id) do nothing;
