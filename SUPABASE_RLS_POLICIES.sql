-- SMIT Connect - Complete RLS Policies
-- Run this in Supabase SQL Editor

-- Update helper function
create or replace function public.get_my_role()
returns text
language sql stable
as $$
  select coalesce(
    (select role from public.users where id = auth.uid()),
    'student'
  )
$$;

-- Users Table Policies
drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_insert_admin" on public.users;
drop policy if exists "users_update" on public.users;
drop policy if exists "users_delete_admin" on public.users;
drop policy if exists "users_read_own" on public.users;
drop policy if exists "users_read_admin" on public.users;
drop policy if exists "users_create_own" on public.users;
drop policy if exists "users_create_admin" on public.users;
drop policy if exists "users_update_own" on public.users;
drop policy if exists "users_update_admin" on public.users;
drop policy if exists "users_delete_only_admin" on public.users;

create policy "users_read_own" on public.users
  for select using (id = auth.uid());

create policy "users_read_admin" on public.users
  for select using (
    auth.uid() is not null and 
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "users_create_own" on public.users
  for insert with check (id = auth.uid());

create policy "users_create_admin" on public.users
  for insert with check (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "users_update_own" on public.users
  for update using (id = auth.uid());

create policy "users_update_admin" on public.users
  for update using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "users_delete_only_admin" on public.users
  for delete using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- Courses Table Policies
drop policy if exists "courses_select_all" on public.courses;
drop policy if exists "courses_insert_admin" on public.courses;
drop policy if exists "courses_update_admin" on public.courses;
drop policy if exists "courses_delete_admin" on public.courses;

create policy "courses_select_all" on public.courses
  for select using (true);

create policy "courses_insert_admin" on public.courses
  for insert with check (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "courses_update_admin" on public.courses
  for update using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "courses_delete_admin" on public.courses
  for delete using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- Applications Table Policies
drop policy if exists "applications_select" on public.applications;
drop policy if exists "applications_insert_student" on public.applications;
drop policy if exists "applications_update_admin" on public.applications;
drop policy if exists "applications_read_own" on public.applications;
drop policy if exists "applications_read_admin" on public.applications;
drop policy if exists "applications_create_student" on public.applications;

create policy "applications_read_own" on public.applications
  for select using (user_id = auth.uid());

create policy "applications_read_admin" on public.applications
  for select using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "applications_create_student" on public.applications
  for insert with check (
    auth.uid() is not null and
    user_id = auth.uid() and
    (select role from public.users where id = auth.uid()) = 'student'
  );

create policy "applications_update_admin" on public.applications
  for update using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- Leaves Table Policies
drop policy if exists "leaves_select" on public.leaves;
drop policy if exists "leaves_insert_student" on public.leaves;
drop policy if exists "leaves_update_admin" on public.leaves;
drop policy if exists "leaves_read_own" on public.leaves;
drop policy if exists "leaves_read_admin" on public.leaves;
drop policy if exists "leaves_create_student" on public.leaves;

create policy "leaves_read_own" on public.leaves
  for select using (user_id = auth.uid());

create policy "leaves_read_admin" on public.leaves
  for select using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "leaves_create_student" on public.leaves
  for insert with check (
    auth.uid() is not null and
    user_id = auth.uid() and
    (select role from public.users where id = auth.uid()) = 'student'
  );

create policy "leaves_update_admin" on public.leaves
  for update using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );
