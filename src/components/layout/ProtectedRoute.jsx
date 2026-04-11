/**
 * ProtectedRoute Component
 * 
 * RESPONSIBILITY: Route guard for role-based access control
 * 
 * SECURITY:
 * - Validates user role before rendering
 * - Redirects unauthorized users to login
 * - Handles loading state (prevents flash of unauthorized content)
 * 
 * USAGE:
 * <Route element={<ProtectedRoute allowedRole="admin" />}>
 *   <Route path="dashboard" element={<AdminDashboard />} />
 * </Route>
 */

import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { selectUser, selectUserRole, selectAuthLoading } from '../../features/auth/authSlice'
import { ROUTES } from '../../utils/constants'
import Spinner from '../ui/Spinner'

export default function ProtectedRoute({ allowedRole }) {
  const user = useSelector(selectUser)
  const userRole = useSelector(selectUserRole)
  const loading = useSelector(selectAuthLoading)

  // Still checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Logged in but wrong role
  if (allowedRole && userRole !== allowedRole) {
    // Redirect based on role
    const redirectRoute = userRole === 'admin' ? ROUTES.ADMIN.DASHBOARD : ROUTES.STUDENT.DASHBOARD
    return <Navigate to={redirectRoute} replace />
  }

  // Has access - render nested routes
  return <Outlet />
}
