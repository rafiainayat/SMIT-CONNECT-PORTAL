-- SMIT Connect - Auto-create user profile on signup
-- This uses a trigger so RLS doesn't block profile creation

-- Step 1: Enable the pgsql_http extension (required for auth webhooks)
create extension if not exists "http" with schema extensions;

-- Step 2: Create trigger function to auto-create user profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'student'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Step 3: Create trigger on auth.users table
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Step 4: Minimal RLS policies (only what's needed)
drop policy if exists "users_read_own" on public.users;
drop policy if exists "users_create_own" on public.users;
drop policy if exists "users_update_own" on public.users;
drop policy if exists "users_read_admin" on public.users;
drop policy if exists "users_create_admin" on public.users;
drop policy if exists "users_update_admin" on public.users;
drop policy if exists "users_delete_only_admin" on public.users;

-- Users: Read own profile
create policy "users_read_own" on public.users
  for select using (id = auth.uid());

-- Users: Read admin all profiles
create policy "users_read_admin" on public.users
  for select using (auth.jwt()->>'role' = 'admin');

-- Users: Update own profile
create policy "users_update_own" on public.users
  for update using (id = auth.uid());

-- Users: Update admin any profile
create policy "users_update_admin" on public.users
  for update using (auth.jwt()->>'role' = 'admin');

-- Courses: Everyone reads
drop policy if exists "courses_read_all" on public.courses;
create policy "courses_read_all" on public.courses
  for select using (true);

-- Courses: Admin only writes
drop policy if exists "courses_insert_admin" on public.courses;
drop policy if exists "courses_update_admin" on public.courses;
drop policy if exists "courses_delete_admin" on public.courses;

create policy "courses_insert_admin" on public.courses
  for insert with check (auth.jwt()->>'role' = 'admin');

create policy "courses_update_admin" on public.courses
  for update using (auth.jwt()->>'role' = 'admin');

create policy "courses_delete_admin" on public.courses
  for delete using (auth.jwt()->>'role' = 'admin');

-- Applications: Students apply, admins manage
drop policy if exists "applications_read_own" on public.applications;
drop policy if exists "applications_insert_own" on public.applications;
drop policy if exists "applications_read_admin" on public.applications;
drop policy if exists "applications_update_admin" on public.applications;

create policy "applications_read_own" on public.applications
  for select using (user_id = auth.uid());

create policy "applications_read_admin" on public.applications
  for select using (auth.jwt()->>'role' = 'admin');

create policy "applications_insert_own" on public.applications
  for insert with check (user_id = auth.uid());

create policy "applications_update_admin" on public.applications
  for update using (auth.jwt()->>'role' = 'admin');

-- Leaves: Students request, admins manage
drop policy if exists "leaves_read_own" on public.leaves;
drop policy if exists "leaves_insert_own" on public.leaves;
drop policy if exists "leaves_read_admin" on public.leaves;
drop policy if exists "leaves_update_admin" on public.leaves;

create policy "leaves_read_own" on public.leaves
  for select using (user_id = auth.uid());

create policy "leaves_read_admin" on public.leaves
  for select using (auth.jwt()->>'role' = 'admin');

create policy "leaves_insert_own" on public.leaves
  for insert with check (user_id = auth.uid());

create policy "leaves_update_admin" on public.leaves
  for update using (auth.jwt()->>'role' = 'admin');
