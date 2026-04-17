import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { selectProfile } from '../../features/auth/authSlice'
import { fetchMyApplications } from '../../services/courseService'
import { fetchMyLeaves } from '../../services/leaveService'
import StatusBadge from '../../components/ui/StatusBadge'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../utils/formatters'
import { ROUTES } from '../../utils/constants'

const StatCard = ({ emoji, label, value, colorText, borderColor }) => (
  <div className={`card border-l-4 ${borderColor} flex items-center gap-4 py-5`}>
    <span className="text-3xl">{emoji}</span>
    <div>
      <p className={`text-3xl font-extrabold ${colorText} tracking-tight leading-none`}>{value ?? 0}</p>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  </div>
)

export default function StudentDashboard() {
  const profile = useSelector(selectProfile)
  const [applications, setApplications] = useState([])
  const [leaves, setLeaves]             = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    Promise.all([fetchMyApplications(profile.id), fetchMyLeaves(profile.id)])
      .then(([apps, lvs]) => { setApplications(apps); setLeaves(lvs) })
      .catch(() => toast.error('Failed to load your data.'))
      .finally(() => setLoading(false))
  }, [profile?.id])

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const stats = {
    totalApps:     applications.length,
    pendingLeaves: leaves.filter(l => l.status === 'pending').length,
    approved:      leaves.filter(l => l.status === 'approved').length,
  }

  return (
    <div className="page-wrap">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          {greeting}, {profile?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Roll No: <span className="font-bold text-gray-700">{profile?.roll_number || 'Not assigned'}</span>
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <Spinner size="lg" className="mx-auto" />
            <p className="text-sm text-gray-400 font-medium">Loading your data…</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard emoji="📚" label="Applications"   value={stats.totalApps}     colorText="text-blue-600"    borderColor="border-blue-500"    />
            <StatCard emoji="⏳" label="Pending Leaves" value={stats.pendingLeaves} colorText="text-amber-600"   borderColor="border-amber-500"   />
            <StatCard emoji="✅" label="Approved Leaves" value={stats.approved}      colorText="text-emerald-600" borderColor="border-emerald-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Applications */}
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-extrabold text-gray-900">My Applications</h2>
                  {applications.filter(a=>a.status==='pending').length > 0 && (
                    <p className="text-xs text-amber-600 font-bold mt-0.5">
                      {applications.filter(a=>a.status==='pending').length} pending review
                    </p>
                  )}
                </div>
                <Link to={ROUTES.COURSES} className="text-sm font-bold text-primary-600 hover:text-primary-700">Browse →</Link>
              </div>
              {applications.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-3">📚</div>
                  <p className="text-sm text-gray-500 font-semibold">No applications yet.</p>
                  <Link to={ROUTES.COURSES} className="text-sm text-primary-600 font-bold mt-2 inline-block">Browse courses →</Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {applications.slice(0, 5).map(app => (
                    <div key={app.id} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="min-w-0 mr-3">
                        <p className="text-sm font-bold text-gray-900 truncate">{app.courses?.name}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">Applied {formatDate(app.created_at)}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                  ))}
                  {applications.length > 5 && <p className="text-xs text-center text-gray-400 font-semibold">+ {applications.length - 5} more</p>}
                </div>
              )}
            </div>

            {/* Leaves */}
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-extrabold text-gray-900">My Leave Requests</h2>
                  {leaves.length > 0 && <p className="text-xs text-gray-400 font-semibold mt-0.5">{leaves.length} total</p>}
                </div>
                <Link to={ROUTES.STUDENT.LEAVES} className="text-sm font-bold text-primary-600 hover:text-primary-700">
                  {leaves.length > 0 ? 'View all →' : 'Submit →'}
                </Link>
              </div>
              {leaves.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-3">📅</div>
                  <p className="text-sm text-gray-500 font-semibold">No leave requests yet.</p>
                  <Link to={ROUTES.STUDENT.LEAVES} className="text-sm text-primary-600 font-bold mt-2 inline-block">Submit your first leave →</Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {leaves.slice(0, 5).map(leave => (
                    <div key={leave.id} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm font-bold text-gray-900 truncate">{leave.reason}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{formatDate(leave.start_date)} → {formatDate(leave.end_date)}</p>
                      </div>
                      <StatusBadge status={leave.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CTA banner */}
          <div className="bg-gradient-to-r from-primary-700 to-primary-600 rounded-3xl p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden shadow-lg">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
            <div className="relative">
              <h3 className="font-extrabold text-white text-lg tracking-tight">Ready to apply for a course? 🚀</h3>
              <p className="text-primary-200 text-sm mt-1 font-medium">Browse all open courses and submit your application instantly.</p>
            </div>
            <Link to={ROUTES.COURSES}
              className="flex-shrink-0 relative bg-white text-primary-700 font-extrabold text-sm px-6 py-3 rounded-2xl hover:bg-primary-50 transition-colors shadow-sm">
              Browse Courses →
            </Link>
          </div>
        </>
      )}
    </div>
  )
}