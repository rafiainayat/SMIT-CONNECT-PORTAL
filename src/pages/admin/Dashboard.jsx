import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { selectProfile } from '../../features/auth/authSlice'
import { fetchDashboardStats } from '../../services/adminService'
import Spinner from '../../components/ui/Spinner'
import { ROUTES } from '../../utils/constants'

const CARDS = [
  { key: 'totalStudents',    label: 'Total Students',    icon: '👥', bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-100',    to: ROUTES.ADMIN.STUDENTS },
  { key: 'totalCourses',     label: 'Total Courses',     icon: '📚', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', to: ROUTES.ADMIN.COURSES  },
  { key: 'pendingLeaves',    label: 'Pending Leaves',    icon: '⏳', bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100',   to: ROUTES.ADMIN.LEAVES   },
  { key: 'totalApplications',label: 'Applications',      icon: '📝', bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-100',  to: ROUTES.ADMIN.STUDENTS },
]

const QUICK = [
  { label: 'Upload Students', to: ROUTES.ADMIN.STUDENTS, emoji: '⬆️', color: 'bg-blue-600   hover:bg-blue-700'    },
  { label: 'Add New Course',  to: ROUTES.ADMIN.COURSES,  emoji: '➕', color: 'bg-emerald-600 hover:bg-emerald-700' },
  { label: 'Review Leaves',   to: ROUTES.ADMIN.LEAVES,   emoji: '✅', color: 'bg-amber-600  hover:bg-amber-700'   },
  { label: 'Settings',        to: ROUTES.ADMIN.SETTINGS, emoji: '⚙️', color: 'bg-gray-700   hover:bg-gray-800'    },
]

export default function AdminDashboard() {
  const profile = useSelector(selectProfile)
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(() => toast.error('Failed to load stats.'))
      .finally(() => setLoading(false))
  }, [])

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="page-wrap">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {greeting}, {profile?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Here's your portal overview for today.</p>
        </div>
        <div className="self-start flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-2xl px-4 py-2.5 flex-shrink-0">
          <span className="text-lg">🛡</span>
          <div>
            <p className="text-xs font-bold text-purple-700 leading-none">Administrator</p>
            <p className="text-[11px] text-purple-400 mt-0.5 font-medium">{profile?.email}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <Spinner size="lg" className="mx-auto" />
            <p className="text-sm text-gray-400 font-medium">Loading statistics…</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {CARDS.map(({ key, label, icon, bg, text, border, to }) => (
              <Link key={key} to={to} className={`card hover:shadow-card-md group block border ${border} transition-all duration-200`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200`}>
                    {icon}
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className={`text-3xl font-extrabold ${text} tracking-tight`}>{stats?.[key] ?? 0}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Quick actions */}
            <div className="card lg:col-span-1">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">Quick Actions</h2>
              <div className="space-y-2.5">
                {QUICK.map(({ label, to, emoji, color }) => (
                  <Link key={label} to={to}
                    className={`flex items-center gap-3 ${color} text-white px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150 hover:shadow-md`}>
                    <span className="text-base">{emoji}</span>
                    {label}
                    <svg className="w-4 h-4 ml-auto opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* System overview */}
            <div className="card lg:col-span-2">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-5">System Overview</h2>
              <div className="space-y-4">
                {[
                  { label: 'Total students',          value: stats?.totalStudents ?? 0,    max: Math.max(stats?.totalStudents ?? 1, 1),      color: 'bg-blue-500' },
                  { label: 'Pending leave requests',  value: stats?.pendingLeaves ?? 0,    max: Math.max(stats?.totalApplications ?? 1, 10), color: 'bg-amber-500' },
                  { label: 'Course applications',     value: stats?.totalApplications ?? 0,max: Math.max(stats?.totalApplications ?? 1, 1),  color: 'bg-purple-500' },
                ].map(({ label, value, max, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-gray-600">{label}</span>
                      <span className="text-sm font-bold text-gray-900">{value}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all duration-700`}
                        style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-extrabold text-gray-900">{stats?.totalCourses ?? 0}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Courses</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-xl">
                  <p className="text-2xl font-extrabold text-amber-600">{stats?.pendingLeaves ?? 0}</p>
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mt-1">Need Review</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}