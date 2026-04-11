-- SMIT Connect - Complete Supabase Setup
-- Run this entire file in Supabase SQL Editor

-- ============================================
-- 1. DROP EXISTING POLICIES (clean slate)
-- ============================================
drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_update_own" on public.users;
drop policy if exists "users_read_own" on public.users;
drop policy if exists "users_read_admin" on public.users;
drop policy if exists "users_create_own" on public.users;
drop policy if exists "users_create_admin" on public.users;
drop policy if exists "users_update_own" on public.users;
drop policy if exists "users_update_admin" on public.users;
drop policy if exists "users_delete_only_admin" on public.users;
drop policy if exists "courses_read_all" on public.courses;
drop policy if exists "courses_select_all" on public.courses;
drop policy if exists "courses_insert_admin" on public.courses;
drop policy if exists "courses_update_admin" on public.courses;
drop policy if exists "courses_delete_admin" on public.courses;
drop policy if exists "applications_select_own" on public.applications;
drop policy if exists "applications_insert_own" on public.applications;
drop policy if exists "applications_read_own" on public.applications;
drop policy if exists "applications_insert_own" on public.applications;
drop policy if exists "leaves_select_own" on public.leaves;
drop policy if exists "leaves_insert_own" on public.leaves;
drop policy if exists "leaves_read_own" on public.leaves;
drop policy if exists "leaves_insert_own" on public.leaves;

-- ============================================
-- 2. DROP EXISTING TRIGGERS
-- ============================================
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- ============================================
-- 3. CREATE TRIGGER - Auto-create profile on signup
-- ============================================
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- 4. CREATE HELPER FUNCTIONS (bypass RLS)
-- ============================================
drop function if exists public.get_my_profile();
drop function if exists public.ensure_user_profile(uuid, text, text);

create or replace function public.get_my_profile()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  profile json;
begin
  select row_to_json(u.*)
  into profile
  from public.users u
  where u.id = auth.uid();
  
  return profile;
end;
$$;

create or replace function public.ensure_user_profile(
  p_id uuid,
  p_name text,
  p_email text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  profile json;
begin
  -- Try to insert if not exists
  insert into public.users (id, name, email, role)
  values (p_id, p_name, p_email, 'student')
  on conflict (id) do nothing;
  
  -- Return the profile
  select row_to_json(u.*)
  into profile
  from public.users u
  where u.id = p_id;
  
  return profile;
end;
$$;

-- Grant execute to authenticated users
grant execute on function public.get_my_profile() to authenticated;
grant execute on function public.ensure_user_profile(uuid, text, text) to authenticated;

-- ============================================
-- 5. MINIMAL RLS POLICIES (no circular deps)
-- ============================================

-- Users: Only allow reading own profile
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

-- Users: Only allow updating own profile
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- Courses: Everyone reads courses
create policy "courses_select_all" on public.courses
  for select using (true);

-- Applications: Users read own
create policy "applications_select_own" on public.applications
  for select using (auth.uid() = user_id);

-- Applications: Users insert own
create policy "applications_insert_own" on public.applications
  for insert with check (auth.uid() = user_id);

-- Leaves: Users read own
create policy "leaves_select_own" on public.leaves
  for select using (auth.uid() = user_id);

-- Leaves: Users insert own
create policy "leaves_insert_own" on public.leaves
  for insert with check (auth.uid() = user_id);

-- ============================================
-- Done! Now test signup in your app
-- ============================================
