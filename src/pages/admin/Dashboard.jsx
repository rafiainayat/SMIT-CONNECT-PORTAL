import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { selectProfile, clearUser } from '../../features/auth/authSlice'
import { fetchDashboardStats } from '../../services/adminService'
import { logoutUser } from '../../services/authService'
import Spinner from '../../components/ui/Spinner'
import { ROUTES } from '../../utils/constants'

const StatCard = ({ label, value, icon, color, to }) => (
  <Link
    to={to}
    className="card hover:shadow-card-hover transition-all duration-200 group block"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
      </div>
      <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center 
                       group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center gap-1 text-xs text-primary-600 font-medium">
      View details
      <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </Link>
)

export default function AdminDashboard() {
  const dispatch        = useDispatch()
  const navigate        = useNavigate()
  const profile         = useSelector(selectProfile)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logoutUser()
      dispatch(clearUser())
      navigate(ROUTES.LOGIN, { replace: true })
      toast.success('Signed out successfully.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoggingOut(false)
    }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="page-container">
      {/* Header with logout button */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400 font-medium">
            {new Date().toLocaleDateString('en-PK', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            {greeting}, {profile?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening in your portal today.</p>
        </div>

        {/* Logout button — dashboard shortcut */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 self-start px-4 py-2.5 rounded-xl text-sm font-medium
                     border border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50
                     hover:border-red-200 transition-all disabled:opacity-50 flex-shrink-0"
        >
          {loggingOut ? <Spinner size="sm" /> : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          )}
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Students"
            value={stats?.totalStudents}
            to={ROUTES.ADMIN.STUDENTS}
            color="bg-blue-50"
            icon={
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatCard
            label="Total Courses"
            value={stats?.totalCourses}
            to={ROUTES.ADMIN.COURSES}
            color="bg-green-50"
            icon={
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
          <StatCard
            label="Pending Leaves"
            value={stats?.pendingLeaves}
            to={ROUTES.ADMIN.LEAVES}
            color="bg-amber-50"
            icon={
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Applications"
            value={stats?.totalApplications}
            to={ROUTES.ADMIN.STUDENTS}
            color="bg-purple-50"
            icon={
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          />
        </div>
      )}

      {/* Quick actions */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Upload Students',   to: ROUTES.ADMIN.STUDENTS, color: 'bg-blue-600'  },
            { label: 'Add New Course',    to: ROUTES.ADMIN.COURSES,  color: 'bg-green-600' },
            { label: 'Review Leaves',     to: ROUTES.ADMIN.LEAVES,   color: 'bg-amber-600' },
          ].map(({ label, to, color }) => (
            <Link
              key={label}
              to={to}
              className={`${color} text-white text-sm font-medium py-2.5 px-4 rounded-xl text-center
                         hover:opacity-90 transition-opacity`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
