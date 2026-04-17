import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { selectUser, selectProfile } from '../features/auth/authSlice'
import { fetchOpenCourses, fetchAllCoursesPublic, applyForCourse, fetchMyApplications } from '../services/courseService'
import { ROUTES, ROLES } from '../utils/constants'
import { formatDate } from '../utils/formatters'
import StatusBadge from '../components/ui/StatusBadge'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import { SearchInput } from '../components/ui/PageHeader'

export default function CoursesPage() {
  const user    = useSelector(selectUser)
  const profile = useSelector(selectProfile)

  const [courses, setCourses]     = useState([])
  const [myAppIds, setMyAppIds]   = useState(new Set())
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')
  const [applyTarget, setApply]   = useState(null)
  const [applying, setApplying]   = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const isAdmin = profile?.role === ROLES.ADMIN
        const data    = isAdmin ? await fetchAllCoursesPublic() : await fetchOpenCourses()
        setCourses(data)
        if (user && profile?.role === ROLES.STUDENT) {
          const apps = await fetchMyApplications(user.id)
          setMyAppIds(new Set(apps.map(a => a.course_id)))
        }
      } catch { toast.error('Failed to load courses.') }
      finally { setLoading(false) }
    }
    load()
  }, [user, profile])

  const handleApply = async () => {
    if (!applyTarget || applying) return
    if (!user) { toast.error('Please sign in to apply.'); return }
    setApplying(true)
    const tid = toast.loading(`Applying for "${applyTarget.name}"…`)
    try {
      await applyForCourse(user.id, applyTarget.id)
      setMyAppIds(prev => new Set([...prev, applyTarget.id]))
      toast.success(`Applied for "${applyTarget.name}" successfully! 🎉`, { id: tid })
      setApply(null)
    } catch (err) { toast.error(err.message, { id: tid }) }
    finally { setApplying(false) }
  }

  const filtered = courses.filter(c => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || c.status === filter
    return matchSearch && matchFilter
  })

  const isStudent   = profile?.role === ROLES.STUDENT
  const hasApplied  = id => myAppIds.has(id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">🎓</span>
            </div>
            <span className="font-bold text-gray-900">SMIT Connect</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to={profile?.role === ROLES.ADMIN ? ROUTES.ADMIN.DASHBOARD : ROUTES.STUDENT.DASHBOARD}
                className="btn-primary text-sm py-2">Dashboard →</Link>
            ) : (
              <>
                <Link to={ROUTES.LOGIN}  className="btn-secondary text-sm py-2 hidden sm:flex">Sign in</Link>
                <Link to={ROUTES.SIGNUP} className="btn-primary  text-sm py-2">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Available Courses</h1>
              <p className="text-gray-500 mt-1 font-medium text-sm">
                {loading ? 'Loading…' : `${courses.length} course${courses.length !== 1 ? 's' : ''} total`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <SearchInput value={search} onChange={setSearch} placeholder="Search courses…" className="w-full sm:w-64" />
              <div className="flex gap-2">
                {['all', 'open', 'closed'].map(s => (
                  <button key={s} onClick={() => setFilter(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize flex-shrink-0
                      ${filter === s ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <Spinner size="lg" />
            <p className="text-sm text-gray-400 font-medium">Loading courses…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-28">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 font-bold text-lg">No courses found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(course => {
              const applied = hasApplied(course.id)
              const closed  = course.status === 'closed'
              return (
                <div key={course.id}
                  className={`bg-white rounded-2xl border shadow-card overflow-hidden flex flex-col transition-all duration-200
                    ${!closed ? 'hover:shadow-card-md hover:-translate-y-0.5' : 'opacity-75'}`}>
                  <div className={`h-1.5 w-full ${closed ? 'bg-gray-200' : 'bg-gradient-to-r from-primary-500 to-primary-600'}`} />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <StatusBadge status={course.status} />
                      {applied && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex-shrink-0">
                          ✓ Applied
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 flex-1">{course.name}</h3>
                    <p className="text-xs text-gray-400 font-medium mb-4">Added {formatDate(course.created_at)}</p>

                    {!user ? (
                      <Link to={ROUTES.LOGIN} className="btn-secondary w-full text-xs justify-center py-2">Sign in to apply</Link>
                    ) : !isStudent ? (
                      <p className="text-xs text-gray-400 text-center py-2">Admin view only</p>
                    ) : applied ? (
                      <button disabled className="btn-secondary w-full text-xs justify-center py-2 opacity-60 cursor-not-allowed">✓ Already Applied</button>
                    ) : closed ? (
                      <button disabled className="btn-secondary w-full text-xs justify-center py-2 opacity-50 cursor-not-allowed">Applications Closed</button>
                    ) : (
                      <button onClick={() => setApply(course)} className="btn-primary w-full text-xs justify-center py-2">Apply Now →</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Apply confirmation modal */}
      <Modal isOpen={!!applyTarget} onClose={() => setApply(null)} title="Confirm Application" size="sm">
        {applyTarget && (
          <div className="space-y-5">
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">📚</div>
              <p className="font-bold text-gray-900 text-base">{applyTarget.name}</p>
              <div className="mt-2"><StatusBadge status={applyTarget.status} /></div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p className="text-xs text-amber-700 font-semibold text-center">
                ⚠ Applications cannot be withdrawn once submitted. Please confirm.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setApply(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleApply} disabled={applying} className="btn-primary flex-[2]">
                {applying ? <><Spinner size="sm" /> Submitting…</> : 'Confirm & Apply 🎉'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}