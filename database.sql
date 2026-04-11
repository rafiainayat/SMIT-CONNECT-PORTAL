-- ============================================
-- SMIT Connect Portal — Complete Schema
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLE: users
-- Modified for free signup: CNIC and roll_number are NULLABLE
-- Admins can pre-load students with CNIC + Roll Number
-- Free signup users just have name + email
-- ============================================
create table if not exists public.users (
  id          uuid primary key,
  name        text not null,
  cnic        text unique,
  roll_number text unique,
  role        text not null default 'student' check (role in ('student', 'admin')),
  email       text unique,
  created_at  timestamptz not null default now()
);

comment on table public.users is 
  'Platform users. id links to auth.users. Students can signup for free or be pre-loaded by admin.';

-- ============================================
-- TABLE: courses
-- ============================================
create table if not exists public.courses (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  status     text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

-- ============================================
-- TABLE: applications
-- Unique constraint prevents duplicate applications
-- ============================================
create table if not exists public.applications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  course_id  uuid not null references public.courses(id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ============================================
-- TABLE: leaves
-- ============================================
create table if not exists public.leaves (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  reason     text not null,
  start_date date not null,
  end_date   date not null,
  image_url  text,
  status     text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  constraint valid_date_range check (end_date >= start_date)
);

-- ============================================
-- INDEXES for query performance
-- ============================================
create index if not exists idx_applications_user_id   on public.applications(user_id);
create index if not exists idx_applications_course_id on public.applications(course_id);
create index if not exists idx_leaves_user_id         on public.leaves(user_id);
create index if not exists idx_leaves_status          on public.leaves(status);
create index if not exists idx_users_cnic             on public.users(cnic);
create index if not exists idx_users_roll_number      on public.users(roll_number);

-- ============================================
-- ROW LEVEL SECURITY
-- Enable on every table — this is MANDATORY
-- ============================================
alter table public.users        enable row level security;
alter table public.courses      enable row level security;
alter table public.applications enable row level security;
alter table public.leaves       enable row level security;

-- ============================================
-- HELPER FUNCTION: get caller's role
-- Used in RLS policies below
-- Returns 'student' as default if user doesn't exist
-- ============================================
create or replace function public.get_my_role()
returns text
language sql stable
as $$
  select coalesce(
    (select role from public.users where id = auth.uid()),
    'student'
  )
$$;

-- ============================================
-- RLS POLICIES: users table
-- ============================================
-- Drop existing policies if they exist
drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_insert_admin" on public.users;
drop policy if exists "users_update" on public.users;
drop policy if exists "users_delete_admin" on public.users;

-- POLICY 1: SELECT - Users can read their own profile
create policy "users_read_own" on public.users
  for select using (id = auth.uid());

-- POLICY 2: SELECT - Admins can read all profiles
create policy "users_read_admin" on public.users
  for select using (
    auth.uid() is not null and 
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- POLICY 3: INSERT - New users can create their own profile (signup)
create policy "users_create_own" on public.users
  for insert with check (id = auth.uid());

-- POLICY 4: INSERT - Admins can create other profiles
create policy "users_create_admin" on public.users
  for insert with check (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- POLICY 5: UPDATE - Users can update their own profile
create policy "users_update_own" on public.users
  for update using (id = auth.uid());

-- POLICY 6: UPDATE - Admins can update any profile
create policy "users_update_admin" on public.users
  for update using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- POLICY 7: DELETE - Only admins can delete
create policy "users_delete_only_admin" on public.users
  for delete using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- ============================================
-- RLS POLICIES: courses table
-- ============================================
-- Drop existing policies if they exist
drop policy if exists "courses_select_all" on public.courses;
drop policy if exists "courses_insert_admin" on public.courses;
drop policy if exists "courses_update_admin" on public.courses;
drop policy if exists "courses_delete_admin" on public.courses;

-- POLICY 1: Everyone can read courses
create policy "courses_select_all" on public.courses
  for select using (true);

-- POLICY 2: Only admins can insert courses
create policy "courses_insert_admin" on public.courses
  for insert with check (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- POLICY 3: Only admins can update courses
create policy "courses_update_admin" on public.courses
  for update using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- POLICY 4: Only admins can delete courses
create policy "courses_delete_admin" on public.courses
  for delete using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- ============================================
-- RLS POLICIES: applications table
-- ============================================
-- Drop existing policies if they exist
drop policy if exists "applications_select" on public.applications;
drop policy if exists "applications_insert_student" on public.applications;
drop policy if exists "applications_update_admin" on public.applications;

-- POLICY 1: Users can read their own applications
create policy "applications_read_own" on public.applications
  for select using (user_id = auth.uid());

-- POLICY 2: Admins can read all applications
create policy "applications_read_admin" on public.applications
  for select using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- POLICY 3: Students can insert their own applications
create policy "applications_create_student" on public.applications
  for insert with check (
    auth.uid() is not null and
    user_id = auth.uid() and
    (select role from public.users where id = auth.uid()) = 'student'
  );

-- POLICY 4: Admins can update applications
create policy "applications_update_admin" on public.applications
  for update using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- ============================================
-- RLS POLICIES: leaves table
-- ============================================
-- Drop existing policies if they exist
drop policy if exists "leaves_select" on public.leaves;
drop policy if exists "leaves_insert_student" on public.leaves;
drop policy if exists "leaves_update_admin" on public.leaves;

-- POLICY 1: Users can read their own leaves
create policy "leaves_read_own" on public.leaves
  for select using (user_id = auth.uid());

-- POLICY 2: Admins can read all leaves
create policy "leaves_read_admin" on public.leaves
  for select using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- POLICY 3: Students can insert their own leaves
create policy "leaves_create_student" on public.leaves
  for insert with check (
    auth.uid() is not null and
    user_id = auth.uid() and
    (select role from public.users where id = auth.uid()) = 'student'
  );

-- POLICY 4: Admins can update leaves
create policy "leaves_update_admin" on public.leaves
  for update using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Add a test admin (replace UUID with actual auth user ID from Supabase Auth)
-- INSERT INTO public.users (id, name, cnic, roll_number, role, email)
-- VALUES (
--   'your-admin-auth-uuid-here',
--   'Admin User',
--   '12345-1234567-1',
--   'ADMIN-001',
--   'admin',
--   'admin@smit.com'
-- );

-- Add sample courses
-- INSERT INTO public.courses (name, status) VALUES
-- ('Web Development Fundamentals', 'open'),
-- ('React Advanced Patterns', 'open'),
-- ('Database Design & Optimization', 'closed');
