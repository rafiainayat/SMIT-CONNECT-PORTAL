import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectProfile } from '../../features/auth/authSlice'
import { fetchMyApplications } from '../../services/courseService'
import { fetchMyLeaves } from '../../services/leaveService'
import StatusBadge from '../../components/ui/StatusBadge'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../utils/formatters'
import { ROUTES } from '../../utils/constants'

const QuickStatCard = ({ label, value, color, icon }) => (
  <div className={`card border-l-4 ${color} flex items-center gap-4`}>
    <div className="flex-1">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
    </div>
    <div className="text-gray-300">{icon}</div>
  </div>
)

export default function StudentDashboard() {
  const profile = useSelector(selectProfile)

  const [applications, setApplications] = useState([])
  const [leaves, setLeaves]             = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (!profile?.id) return

    Promise.all([
      fetchMyApplications(profile.id),
      fetchMyLeaves(profile.id),
    ])
      .then(([apps, lvs]) => {
        setApplications(apps)
        setLeaves(lvs)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [profile?.id])

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const pendingLeaves    = leaves.filter(l => l.status === 'pending').length
  const approvedLeaves   = leaves.filter(l => l.status === 'approved').length
  const pendingApps      = applications.filter(a => a.status === 'pending').length
  const recentLeaves     = leaves.slice(0, 4)
  const recentApps       = applications.slice(0, 4)

  return (
    <div className="page-container">
      {/* Show loading if profile not loaded yet */}
      {!profile?.id ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="text-gray-500 mt-4">Loading your profile...</p>
        </div>
      ) : (
      <>

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gray-400 font-medium">
          {new Date().toLocaleDateString('en-PK', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">
          {greeting}, {profile?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Roll No. <span className="font-medium text-gray-700">{profile?.roll_number}</span>
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <QuickStatCard
              label="Course Applications"
              value={applications.length}
              color="border-blue-500"
              icon={
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            />
            <QuickStatCard
              label="Pending Leaves"
              value={pendingLeaves}
              color="border-amber-500"
              icon={
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <QuickStatCard
              label="Approved Leaves"
              value={approvedLeaves}
              color="border-green-500"
              icon={
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Applications */}
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">My Applications</h2>
                  {pendingApps > 0 && (
                    <p className="text-xs text-amber-600 mt-0.5">{pendingApps} pending review</p>
                  )}
                </div>
                <Link
                  to={ROUTES.COURSES}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Browse courses →
                </Link>
              </div>

              {recentApps.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">No applications yet.</p>
                  <Link to={ROUTES.COURSES} className="text-sm text-primary-600 font-medium mt-1 inline-block">
                    Browse available courses →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentApps.map(app => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{app.courses?.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Applied {formatDate(app.created_at)}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Leaves */}
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">My Leave Requests</h2>
                  {leaves.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">{leaves.length} total submitted</p>
                  )}
                </div>
                <Link
                  to={ROUTES.STUDENT.LEAVES}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {leaves.length > 0 ? 'View all →' : 'Submit leave →'}
                </Link>
              </div>

              {recentLeaves.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">No leave requests yet.</p>
                  <Link to={ROUTES.STUDENT.LEAVES} className="text-sm text-primary-600 font-medium mt-1 inline-block">
                    Submit your first leave →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentLeaves.map(leave => (
                    <div
                      key={leave.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm font-medium text-gray-900 truncate">{leave.reason}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
                        </p>
                      </div>
                      <StatusBadge status={leave.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick action CTA */}
          <div className="mt-6 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Ready to apply for a course?</h3>
              <p className="text-primary-200 text-sm mt-0.5">
                Browse all available courses and submit your application instantly.
              </p>
            </div>
            <Link
              to={ROUTES.COURSES}
              className="flex-shrink-0 bg-white text-primary-700 font-semibold text-sm px-5 py-2.5
                         rounded-xl hover:bg-primary-50 transition-colors"
            >
              Browse Courses →
            </Link>
          </div>
        </>
      )}
      </>
      )}
    </div>
  )
}
