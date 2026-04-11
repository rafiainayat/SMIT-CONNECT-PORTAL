-- Create a function to safely get user profile (bypasses RLS)
-- This runs with full privileges so it can read any profile

create or replace function get_my_profile()
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

-- Also create direct function to insert profile if needed
create or replace function ensure_user_profile(
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

-- Grant execute permissions to authenticated users
grant execute on function get_my_profile() to authenticated;
grant execute on function ensure_user_profile(uuid, text, text) to authenticated;
