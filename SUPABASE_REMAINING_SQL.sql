-- SMIT Connect - Complete RLS & Admin Policies
-- Run this in Supabase SQL Editor

-- ============================================
-- ADD MISSING ADMIN POLICIES
-- ============================================

-- COURSES: Admin can create, update, delete
drop policy if exists "courses_insert_admin" on public.courses;
drop policy if exists "courses_update_admin" on public.courses;
drop policy if exists "courses_delete_admin" on public.courses;

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

-- ============================================
-- APPLICATIONS: Admin can update/delete
-- ============================================
drop policy if exists "applications_update_admin" on public.applications;
drop policy if exists "applications_delete_admin" on public.applications;

create policy "applications_update_admin" on public.applications
  for update using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "applications_delete_admin" on public.applications
  for delete using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- Applications: Admin can read all
drop policy if exists "applications_read_admin" on public.applications;

create policy "applications_read_admin" on public.applications
  for select using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- ============================================
-- LEAVES: Admin can update/delete
-- ============================================
drop policy if exists "leaves_update_admin" on public.leaves;
drop policy if exists "leaves_delete_admin" on public.leaves;

create policy "leaves_update_admin" on public.leaves
  for update using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "leaves_delete_admin" on public.leaves
  for delete using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- Leaves: Admin can read all
drop policy if exists "leaves_read_admin" on public.leaves;

create policy "leaves_read_admin" on public.leaves
  for select using (
    auth.uid() is not null and
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- ============================================
-- ADMIN HELPER FUNCTIONS
-- ============================================

-- Function to approve/reject leave
drop function if exists public.update_leave_status(uuid, text);

create or replace function public.update_leave_status(
  leave_id uuid,
  new_status text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_leave json;
begin
  -- Check if caller is admin
  if (select role from public.users where id = auth.uid()) != 'admin' then
    raise exception 'Only admins can update leave status';
  end if;

  -- Update leave status
  update public.leaves
  set status = new_status
  where id = leave_id;

  -- Return updated leave
  select row_to_json(l.*)
  into updated_leave
  from public.leaves l
  where l.id = leave_id;

  return updated_leave;
end;
$$;

grant execute on function public.update_leave_status(uuid, text) to authenticated;

-- ============================================
-- CREATE STORAGE BUCKET FOR LEAVE ATTACHMENTS
-- ============================================
-- Run these in Supabase Dashboard > Storage > New Bucket:
-- Name: leave-attachments
-- Public: false (private bucket)
-- Then create RLS policy for users to read/upload their own files

-- ============================================
-- ENABLE FULL TEXT SEARCH ON USERS
-- ============================================
create index if not exists idx_users_name_search on public.users using gin(to_tsvector('english', name));
create index if not exists idx_users_email_search on public.users using gin(to_tsvector('english', email));

-- ============================================
-- Add RLS policy for storage bucket
-- ============================================
-- Note: Storage RLS is managed separately in Supabase Dashboard
-- For leave-attachments bucket, set:
-- SELECT: (auth.uid() = owner) or (auth.role() = 'authenticated')
-- INSERT: (auth.uid() = owner)
-- UPDATE: (auth.uid() = owner)
-- DELETE: (auth.uid() = owner)

-- ============================================
-- VERIFY ALL TABLES HAVE RLS ENABLED
-- ============================================
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
and tablename in ('users', 'courses', 'applications', 'leaves');

-- Should show all with rowsecurity = true

-- ============================================
-- Create function to get admin stats
-- ============================================
drop function if exists public.get_admin_stats();

create or replace function public.get_admin_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  stats json;
begin
  -- Check if caller is admin
  if (select role from public.users where id = auth.uid()) != 'admin' then
    raise exception 'Only admins can view statistics';
  end if;

  select json_build_object(
    'total_students', (select count(*) from public.users where role = 'student'),
    'total_courses', (select count(*) from public.courses),
    'total_applications', (select count(*) from public.applications),
    'pending_leaves', (select count(*) from public.leaves where status = 'pending'),
    'approved_leaves', (select count(*) from public.leaves where status = 'approved'),
    'rejected_leaves', (select count(*) from public.leaves where status = 'rejected'),
    'open_courses', (select count(*) from public.courses where status = 'open'),
    'closed_courses', (select count(*) from public.courses where status = 'closed'),
    'pending_applications', (select count(*) from public.applications where status = 'pending'),
    'approved_applications', (select count(*) from public.applications where status = 'approved'),
    'rejected_applications', (select count(*) from public.applications where status = 'rejected')
  ) into stats;

  return stats;
end;
$$;

grant execute on function public.get_admin_stats() to authenticated;

-- ============================================
-- DONE! All SQL policies configured
-- ============================================
