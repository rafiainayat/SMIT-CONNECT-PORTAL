import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { selectUser, selectProfile } from '../features/auth/authSlice'
import { fetchOpenCourses, fetchAllCourses, applyForCourse, fetchMyApplications } from '../services/courseService'
import { ROUTES, ROLES } from '../utils/constants'
import StatusBadge from '../components/ui/StatusBadge'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import SearchInput from '../components/ui/SearchInput'

export default function CoursesPage() {
  const user    = useSelector(selectUser)
  const profile = useSelector(selectProfile)

  const [courses, setCourses]         = useState([])
  const [myAppIds, setMyAppIds]       = useState(new Set())
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [applyTarget, setApplyTarget] = useState(null)
  const [applying, setApplying]       = useState(false)
  const [filterStatus, setFilter]     = useState('all')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const isAdmin    = profile?.role === ROLES.ADMIN
        const coursesData = isAdmin
          ? await fetchAllCourses()
          : await fetchOpenCourses()

        if (user && profile?.role === ROLES.STUDENT) {
          const apps = await fetchMyApplications(user.id)
          setMyAppIds(new Set(apps.map(a => a.course_id)))
        }

        setCourses(coursesData)
      } catch (err) {
        toast.error('Failed to load courses.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, profile])

  const handleApply = async () => {
    if (!applyTarget || applying) return

    if (!user) {
      toast.error('Please sign in to apply for a course.')
      return
    }

    setApplying(true)
    try {
      await applyForCourse(user.id, applyTarget.id)
      setMyAppIds(prev => new Set([...prev, applyTarget.id]))
      toast.success(`Applied for "${applyTarget.name}" successfully!`)
      setApplyTarget(null)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setApplying(false)
    }
  }

  const filtered = courses.filter(c => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filterStatus === 'all' || c.status === filterStatus
    return matchSearch && matchFilter
  })

  const isStudent   = profile?.role === ROLES.STUDENT
  const alreadyApplied = (courseId) => myAppIds.has(courseId)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">SMIT Connect</span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={profile?.role === ROLES.ADMIN ? ROUTES.ADMIN.DASHBOARD : ROUTES.STUDENT.DASHBOARD}
                className="btn-primary text-sm py-2"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to={ROUTES.LOGIN}  className="btn-secondary text-sm py-2">Sign in</Link>
                <Link to={ROUTES.SIGNUP} className="btn-primary  text-sm py-2">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Available Courses</h1>
          <p className="text-gray-500 mt-2">
            {loading
              ? 'Loading courses…'
              : `${courses.length} course${courses.length !== 1 ? 's' : ''} available`
            }
          </p>

          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search courses by name…"
            />
            <div className="flex gap-2">
              {['all', 'open', 'closed'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize
                    ${filterStatus === s
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-3">
              <Spinner size="lg" className="mx-auto" />
              <p className="text-sm text-gray-400">Loading courses…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No courses found.</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(course => {
              const applied = alreadyApplied(course.id)
              const closed  = course.status === 'closed'

              return (
                <div
                  key={course.id}
                  className={`
                    bg-white rounded-2xl border shadow-card transition-all duration-200 overflow-hidden
                    ${closed ? 'opacity-75' : 'hover:shadow-card-hover hover:-translate-y-0.5'}
                  `}
                >
                  {/* Card color bar */}
                  <div className={`h-1.5 w-full ${closed ? 'bg-gray-200' : 'bg-gradient-to-r from-primary-500 to-primary-600'}`} />

                  <div className="p-6">
                    {/* Status badge */}
                    <div className="flex items-start justify-between mb-4">
                      <StatusBadge status={course.status} />
                      {applied && (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Applied
                        </span>
                      )}
                    </div>

                    {/* Course name */}
                    <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2">
                      {course.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Added {new Date(course.created_at).toLocaleDateString('en-PK', {
                        month: 'short', year: 'numeric'
                      })}
                    </p>

                    {/* Action button */}
                    <div className="mt-5">
                      {!user ? (
                        <Link
                          to={ROUTES.LOGIN}
                          className="btn-secondary w-full text-sm justify-center"
                        >
                          Sign in to apply
                        </Link>
                      ) : !isStudent ? (
                        <div className="text-xs text-gray-400 text-center py-2">
                          Admin view — manage in
                          <Link to={ROUTES.ADMIN.COURSES} className="text-primary-600 ml-1 font-medium">
                            Admin Panel
                          </Link>
                        </div>
                      ) : applied ? (
                        <button disabled className="btn-secondary w-full text-sm justify-center opacity-60 cursor-not-allowed">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Already Applied
                        </button>
                      ) : closed ? (
                        <button disabled className="btn-secondary w-full text-sm justify-center opacity-50 cursor-not-allowed">
                          Applications Closed
                        </button>
                      ) : (
                        <button
                          onClick={() => setApplyTarget(course)}
                          className="btn-primary w-full text-sm justify-center"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Apply Confirmation Modal ── */}
      <Modal
        isOpen={!!applyTarget}
        onClose={() => setApplyTarget(null)}
        title="Confirm Application"
        size="sm"
      >
        {applyTarget && (
          <div className="space-y-5">
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="font-semibold text-gray-900 text-base">{applyTarget.name}</p>
              <StatusBadge status={applyTarget.status} className="mt-2" />
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs text-amber-700 text-center">
                Applications cannot be withdrawn after submission. Confirm you want to apply.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setApplyTarget(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="btn-primary flex-[2]"
              >
                {applying ? <><Spinner size="sm" /> Submitting…</> : 'Confirm Application'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
