-- SMIT Connect - Simplified RLS Policies
-- This is the minimal working set

-- Drop all existing policies
drop policy if exists "users_read_own" on public.users;
drop policy if exists "users_read_admin" on public.users;
drop policy if exists "users_update_own" on public.users;
drop policy if exists "users_update_admin" on public.users;
drop policy if exists "users_delete_only_admin" on public.users;
drop policy if exists "courses_read_all" on public.courses;
drop policy if exists "courses_insert_admin" on public.courses;
drop policy if exists "courses_update_admin" on public.courses;
drop policy if exists "courses_delete_admin" on public.courses;
drop policy if exists "applications_read_own" on public.applications;
drop policy if exists "applications_insert_own" on public.applications;
drop policy if exists "applications_read_admin" on public.applications;
drop policy if exists "applications_update_admin" on public.applications;
drop policy if exists "leaves_read_own" on public.leaves;
drop policy if exists "leaves_insert_own" on public.leaves;
drop policy if exists "leaves_read_admin" on public.leaves;
drop policy if exists "leaves_update_admin" on public.leaves;

-- USERS TABLE: Simple policies
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- COURSES TABLE: Everyone reads
create policy "courses_select_all" on public.courses
  for select using (true);

-- APPLICATIONS TABLE: Users manage own
create policy "applications_select_own" on public.applications
  for select using (auth.uid() = user_id);

create policy "applications_insert_own" on public.applications
  for insert with check (auth.uid() = user_id);

-- LEAVES TABLE: Users manage own
create policy "leaves_select_own" on public.leaves
  for select using (auth.uid() = user_id);

create policy "leaves_insert_own" on public.leaves
  for insert with check (auth.uid() = user_id);
