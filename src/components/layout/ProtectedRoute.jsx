import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { selectUser, selectRole } from '../../features/auth/authSlice'
import { ROUTES } from '../../utils/constants'

export default function ProtectedRoute({ allowedRole }) {
  const user = useSelector(selectUser)
  const role = useSelector(selectRole)
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />
  if (allowedRole && role !== allowedRole)
    return <Navigate to={role === 'admin' ? ROUTES.ADMIN.DASHBOARD : ROUTES.STUDENT.DASHBOARD} replace />
  return <Outlet />
}