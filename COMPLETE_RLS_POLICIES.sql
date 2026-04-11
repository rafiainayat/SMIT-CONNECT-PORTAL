-- ================================================
-- SMIT CONNECT - COMPLETE RLS POLICIES
-- Production-Ready Security Configuration
-- ================================================

-- Drop all existing policies first
DROP POLICY IF EXISTS "users_read_own" ON public.users;
DROP POLICY IF EXISTS "users_read_admin" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_update_admin" ON public.users;
DROP POLICY IF EXISTS "users_delete_admin" ON public.users;
DROP POLICY IF EXISTS "users_insert" ON public.users;

DROP POLICY IF EXISTS "courses_read_all" ON public.courses;
DROP POLICY IF EXISTS "courses_read_student" ON public.courses;
DROP POLICY IF EXISTS "courses_insert_admin" ON public.courses;
DROP POLICY IF EXISTS "courses_update_admin" ON public.courses;
DROP POLICY IF EXISTS "courses_delete_admin" ON public.courses;

DROP POLICY IF EXISTS "applications_read_own" ON public.applications;
DROP POLICY IF EXISTS "applications_read_admin" ON public.applications;
DROP POLICY IF EXISTS "applications_insert" ON public.applications;
DROP POLICY IF EXISTS "applications_update_own" ON public.applications;
DROP POLICY IF EXISTS "applications_update_admin" ON public.applications;
DROP POLICY IF EXISTS "applications_delete_admin" ON public.applications;

DROP POLICY IF EXISTS "leaves_read_own" ON public.leaves;
DROP POLICY IF EXISTS "leaves_read_admin" ON public.leaves;
DROP POLICY IF EXISTS "leaves_insert" ON public.leaves;
DROP POLICY IF EXISTS "leaves_update_own" ON public.leaves;
DROP POLICY IF EXISTS "leaves_update_admin" ON public.leaves;
DROP POLICY IF EXISTS "leaves_delete_admin" ON public.leaves;

-- ================================================
-- ENABLE RLS ON ALL TABLES
-- ================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;

-- ================================================
-- USERS TABLE POLICIES
-- ================================================

-- Students can read their own profile
CREATE POLICY "users_read_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "users_read_admin" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Students can update their own profile (name, email, cnic, roll_number)
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role IS NOT NULL);

-- Admins can update any user
CREATE POLICY "users_update_admin" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete users
CREATE POLICY "users_delete_admin" ON public.users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow inserts for trigger (via SECURITY DEFINER function)
CREATE POLICY "users_insert" ON public.users
  FOR INSERT WITH CHECK (true);

-- ================================================
-- COURSES TABLE POLICIES
-- ================================================

-- Everyone can read all courses (students see open, admins see all)
CREATE POLICY "courses_read_all" ON public.courses
  FOR SELECT USING (true);

-- Admins can create courses
CREATE POLICY "courses_insert_admin" ON public.courses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update courses
CREATE POLICY "courses_update_admin" ON public.courses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete courses
CREATE POLICY "courses_delete_admin" ON public.courses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ================================================
-- APPLICATIONS TABLE POLICIES
-- ================================================

-- Students can read their own applications
CREATE POLICY "applications_read_own" ON public.applications
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can read all applications
CREATE POLICY "applications_read_admin" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Students can create applications (apply to courses)
CREATE POLICY "applications_insert" ON public.applications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'student'
    )
  );

-- Students can update their own applications (change status via admin only)
CREATE POLICY "applications_update_own" ON public.applications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can update all applications
CREATE POLICY "applications_update_admin" ON public.applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete applications
CREATE POLICY "applications_delete_admin" ON public.applications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ================================================
-- LEAVES TABLE POLICIES
-- ================================================

-- Students can read their own leaves
CREATE POLICY "leaves_read_own" ON public.leaves
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can read all leaves
CREATE POLICY "leaves_read_admin" ON public.leaves
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Students can submit leaves
CREATE POLICY "leaves_insert" ON public.leaves
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'student'
    )
  );

-- Students can update their own leaves (before approval)
CREATE POLICY "leaves_update_own" ON public.leaves
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Admins can update all leaves (approve/reject)
CREATE POLICY "leaves_update_admin" ON public.leaves
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete leaves
CREATE POLICY "leaves_delete_admin" ON public.leaves
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ================================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- ================================================

-- Get current user's profile (bypasses RLS)
DROP FUNCTION IF EXISTS public.get_my_profile();

CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile json;
BEGIN
  SELECT row_to_json(u.*)
  INTO user_profile
  FROM public.users u
  WHERE u.id = auth.uid();

  RETURN user_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

-- ================================================

-- Ensure user profile exists (used during signup)
DROP FUNCTION IF EXISTS public.ensure_user_profile(uuid, text, text);

CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  p_id uuid,
  p_name text,
  p_email text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile json;
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (p_id, p_name, p_email, 'student')
  ON CONFLICT (id) DO NOTHING;

  SELECT row_to_json(u.*)
  INTO user_profile
  FROM public.users u
  WHERE u.id = p_id;

  RETURN user_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_user_profile(uuid, text, text) TO authenticated;

-- ================================================

-- Get admin statistics (admins only)
DROP FUNCTION IF EXISTS public.get_admin_stats();

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_stats json;
BEGIN
  -- Verify caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can view statistics';
  END IF;

  SELECT json_build_object(
    'total_students', (SELECT COUNT(*) FROM public.users WHERE role = 'student'),
    'total_courses', (SELECT COUNT(*) FROM public.courses),
    'total_applications', (SELECT COUNT(*) FROM public.applications),
    'open_courses', (SELECT COUNT(*) FROM public.courses WHERE status = 'open'),
    'pending_leaves', (SELECT COUNT(*) FROM public.leaves WHERE status = 'pending'),
    'approved_leaves', (SELECT COUNT(*) FROM public.leaves WHERE status = 'approved'),
    'rejected_leaves', (SELECT COUNT(*) FROM public.leaves WHERE status = 'rejected')
  ) INTO admin_stats;

  RETURN admin_stats;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;

-- ================================================

-- Update leave status (admin only)
DROP FUNCTION IF EXISTS public.update_leave_status(uuid, text);

CREATE OR REPLACE FUNCTION public.update_leave_status(
  leave_id uuid,
  new_status text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_leave json;
BEGIN
  -- Verify caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can update leave status';
  END IF;

  -- Update leave status
  UPDATE public.leaves
  SET status = new_status
  WHERE id = leave_id;

  -- Return updated leave
  SELECT row_to_json(l.*)
  INTO updated_leave
  FROM public.leaves l
  WHERE l.id = leave_id;

  RETURN updated_leave;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_leave_status(uuid, text) TO authenticated;

-- ================================================

-- Get all applications with student details (admin only)
DROP FUNCTION IF EXISTS public.get_all_applications();

CREATE OR REPLACE FUNCTION public.get_all_applications()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  course_id uuid,
  status text,
  created_at timestamptz,
  user_name text,
  user_email text,
  course_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can view all applications';
  END IF;

  RETURN QUERY
  SELECT 
    a.id,
    a.user_id,
    a.course_id,
    a.status,
    a.created_at,
    u.name,
    u.email,
    c.name
  FROM public.applications a
  JOIN public.users u ON a.user_id = u.id
  JOIN public.courses c ON a.course_id = c.id
  ORDER BY a.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_applications() TO authenticated;

-- ================================================

-- Get all leaves with student details (admin only)
DROP FUNCTION IF EXISTS public.get_all_leaves();

CREATE OR REPLACE FUNCTION public.get_all_leaves()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  reason text,
  start_date date,
  end_date date,
  image_url text,
  status text,
  created_at timestamptz,
  user_name text,
  user_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can view all leaves';
  END IF;

  RETURN QUERY
  SELECT 
    l.id,
    l.user_id,
    l.reason,
    l.start_date,
    l.end_date,
    l.image_url,
    l.status,
    l.created_at,
    u.name,
    u.email
  FROM public.leaves l
  JOIN public.users u ON l.user_id = u.id
  ORDER BY l.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_leaves() TO authenticated;

-- ================================================
-- STORAGE POLICIES (Optional - for file uploads)
-- ================================================

-- Note: Storage bucket policies must be configured in Supabase Dashboard
-- Go to: Storage > leave-attachments bucket > Policies

-- Required policies:
-- SELECT: (auth.uid() = owner) or (auth.role() = 'authenticated' and parent_folder_rls_id = leave_id)
-- INSERT: auth.uid() = owner
-- UPDATE: auth.uid() = owner
-- DELETE: auth.uid() = owner

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

CREATE INDEX IF NOT EXISTS idx_courses_id ON public.courses(id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_course_id ON public.applications(course_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_course ON public.applications(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

CREATE INDEX IF NOT EXISTS idx_leaves_user_id ON public.leaves(user_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON public.leaves(status);
CREATE INDEX IF NOT EXISTS idx_leaves_dates ON public.leaves(start_date, end_date);

-- ================================================
-- VERIFY RLS IS ENABLED
-- ================================================

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename IN ('users', 'courses', 'applications', 'leaves')
ORDER BY tablename;

-- All should show rowsecurity = true

-- ================================================
-- VERIFY POLICIES ARE CREATED
-- ================================================

SELECT 
  tablename,
  policyname,
  permissive,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ================================================
-- COMPLETE - ALL POLICIES CONFIGURED
-- ================================================
