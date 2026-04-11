import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from './services/supabase'
import { setUser, clearUser, selectAuthLoading, selectProfile } from './features/auth/authSlice'
import { ROLES, ROUTES } from './utils/constants'

// Pages
import HomePage     from './pages/HomePage'
import LoginPage    from './pages/LoginPage'
import SignupPage   from './pages/SignupPage'
import CoursesPage  from './pages/CoursesPage'

// Student pages
import StudentDashboard from './pages/student/Dashboard'
import StudentLeaves    from './pages/student/Leaves'

// Admin pages
import AdminDashboard  from './pages/admin/Dashboard'
import AdminStudents   from './pages/admin/Students'
import AdminCourses    from './pages/admin/Courses'
import AdminLeaves     from './pages/admin/Leaves'
import AdminSettings   from './pages/admin/Settings'

// Layout & Guards
import ProtectedRoute  from './components/layout/ProtectedRoute'
import AdminLayout     from './components/layout/AdminLayout'
import StudentLayout   from './components/layout/StudentLayout'
import Spinner         from './components/ui/Spinner'

export default function App() {
  const dispatch  = useDispatch()
  const loading   = useSelector(selectAuthLoading)
  const profile   = useSelector(selectProfile)

  useEffect(() => {
    // On mount: check if there's an active session
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Use RPC function to bypass RLS
        const { data: userProfile } = await supabase
          .rpc('get_my_profile')

        dispatch(setUser({ user: session.user, profile: userProfile }))
      } else {
        dispatch(clearUser())
      }
    }

    initAuth()

    // Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          dispatch(clearUser())
        }
        // Other events handled by login/signup flows directly
      }
    )

    return () => subscription.unsubscribe()
  }, [dispatch])

  // Block render until we know the auth state — prevents flash of wrong route
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.HOME}    element={<HomePage />} />
      <Route path={ROUTES.LOGIN}   element={<LoginPage />} />
      <Route path={ROUTES.SIGNUP}  element={<SignupPage />} />
      <Route path={ROUTES.COURSES} element={<CoursesPage />} />

      {/* Student routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRole={ROLES.STUDENT} />
      }>
        <Route element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="leaves"    element={<StudentLeaves />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRole={ROLES.ADMIN} />
      }>
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students"  element={<AdminStudents />} />
          <Route path="courses"   element={<AdminCourses />} />
          <Route path="leaves"    element={<AdminLeaves />} />
          <Route path="settings"  element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}
