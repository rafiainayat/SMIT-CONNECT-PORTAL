import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser, selectRole } from '../features/auth/authSlice'
import { ROUTES, ROLES } from '../utils/constants'

const FEATURES = [
  { icon: '📚', title: 'Course Management',    desc: 'Browse and apply for open courses. Track application status in real time.' },
  { icon: '📅', title: 'Leave Requests',       desc: 'Submit leave with date range and supporting documents instantly.' },
  { icon: '🛡', title: 'Role-Based Access',    desc: 'Secure, isolated dashboards for students and administrators.' },
  { icon: '📊', title: 'Live Statistics',      desc: 'Admin dashboard with real-time counts and status tracking.' },
  { icon: '📂', title: 'Bulk Student Upload',  desc: 'Upload students via Excel with validation preview.' },
  { icon: '🔔', title: 'Toast Notifications', desc: 'Instant feedback on every action — success, error, and loading.' },
]

const STATS = [
  { value: '500+', label: 'Students Enrolled' },
  { value: '50+',  label: 'Courses Available' },
  { value: '99%',  label: 'Uptime Reliability' },
  { value: '24/7', label: 'Portal Access' },
]

export default function HomePage() {
  const user = useSelector(selectUser)
  const role = useSelector(selectRole)
  const dash = role === ROLES.ADMIN ? ROUTES.ADMIN.DASHBOARD : ROUTES.STUDENT.DASHBOARD

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-sm">🎓</span>
            </div>
            <span className="font-bold text-gray-900 tracking-tight">SMIT Connect</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to={ROUTES.COURSES}
              className="text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors hidden sm:block">
              Courses
            </Link>
            {user ? (
              <Link to={dash} className="btn-primary text-sm py-2">Dashboard →</Link>
            ) : (
              <>
                <Link to={ROUTES.LOGIN}  className="btn-secondary text-sm py-2 hidden xs:flex">Sign in</Link>
                <Link to={ROUTES.SIGNUP} className="btn-primary  text-sm py-2">Get started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-primary-50/80 via-white to-white pt-20 pb-28 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-primary-200 rounded-full px-4 py-1.5 text-xs font-bold text-primary-700 mb-6 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Saylani Mass IT Training — Student Portal
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.08] tracking-tight mb-5">
            Everything your institution<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">
              needs, in one place
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            A unified portal for admissions, course management, leave tracking, and admin control — built for scale.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <Link to={dash} className="btn-primary text-base py-3 px-8 shadow-lg">Open Dashboard →</Link>
            ) : (
              <>
                <Link to={ROUTES.SIGNUP} className="btn-primary  text-base py-3 px-8 shadow-lg">Start for free →</Link>
                <Link to={ROUTES.COURSES} className="btn-secondary text-base py-3 px-8">Browse courses</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 mb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="card text-center py-6 hover:shadow-card-md transition-all duration-200">
              <p className="text-3xl font-extrabold text-primary-600 tracking-tight">{value}</p>
              <p className="text-sm text-gray-500 font-semibold mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Built for real workflows</h2>
          <p className="text-gray-500 mt-3 font-medium max-w-xl mx-auto">
            Every feature is connected — from signup to leave approval.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="card hover:shadow-card-md group cursor-default transition-all duration-200 p-7">
              <span className="text-3xl mb-4 block">{icon}</span>
              <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-20">
        <div className="bg-gradient-to-r from-primary-700 to-primary-600 rounded-3xl p-10 text-center shadow-lg relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-primary-200 mb-7 font-medium">
              Join thousands of students managing their academic journey with SMIT Connect.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {user ? (
                <Link to={dash}
                  className="bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors text-sm inline-block">
                  Open Dashboard →
                </Link>
              ) : (
                <>
                  <Link to={ROUTES.SIGNUP}
                    className="bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors text-sm inline-block">
                    Create account →
                  </Link>
                  <Link to={ROUTES.LOGIN}
                    className="border-2 border-white/30 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm inline-block">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs">🎓</span>
            </div>
            <span className="text-sm font-bold text-gray-700">SMIT Connect</span>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            © {new Date().getFullYear()} SMIT Connect Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}