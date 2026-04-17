import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from './services/supabase'
import { setUser, clearUser, selectAuthLoading } from './features/auth/authSlice'
import { ROLES, ROUTES } from './utils/constants'
import Spinner from './components/ui/Spinner'

import HomePage       from './pages/HomePage'
import LoginPage      from './pages/LoginPage'
import SignupPage     from './pages/SignupPage'
import CoursesPage    from './pages/CoursesPage'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminLayout    from './components/layout/AdminLayout'
import StudentLayout  from './components/layout/StudentLayout'

import AdminDashboard  from './pages/admin/Dashboard'
import AdminStudents   from './pages/admin/Students'
import AdminCourses    from './pages/admin/Courses'
import AdminLeaves     from './pages/admin/Leaves'
import AdminSettings   from './pages/admin/Settings'
import StudentDashboard from './pages/student/Dashboard'
import StudentLeaves    from './pages/student/Leaves'

export default function App() {
  const dispatch = useDispatch()
  const loading  = useSelector(selectAuthLoading)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single()
        if (profile) dispatch(setUser({ user: session.user, profile }))
        else dispatch(clearUser())
      } else {
        dispatch(clearUser())
      }
    }
    init()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') dispatch(clearUser())
    })
    return () => subscription.unsubscribe()
  }, [dispatch])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <span className="text-white text-2xl">🎓</span>
          </div>
          <Spinner size="md" className="mx-auto" />
          <p className="text-sm font-semibold text-gray-400">Loading SMIT Connect…</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path={ROUTES.HOME}    element={<HomePage />} />
      <Route path={ROUTES.LOGIN}   element={<LoginPage />} />
      <Route path={ROUTES.SIGNUP}  element={<SignupPage />} />
      <Route path={ROUTES.COURSES} element={<CoursesPage />} />

      <Route element={<ProtectedRoute allowedRole={ROLES.STUDENT} />}>
        <Route element={<StudentLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/leaves"    element={<StudentLeaves />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRole={ROLES.ADMIN} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students"  element={<AdminStudents />} />
          <Route path="/admin/courses"   element={<AdminCourses />} />
          <Route path="/admin/leaves"    element={<AdminLeaves />} />
          <Route path="/admin/settings"  element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}