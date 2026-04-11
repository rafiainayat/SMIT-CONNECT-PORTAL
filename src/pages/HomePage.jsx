import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser, selectProfile } from '../features/auth/authSlice'
import { ROUTES, ROLES } from '../utils/constants'
import StatusBadge from '../components/ui/StatusBadge'

export default function HomePage() {
  const user = useSelector(selectUser)
  const profile = useSelector(selectProfile)

  // Sample courses for preview
  const sampleCourses = [
    { id: 1, name: 'Web Development Fundamentals', status: 'open' },
    { id: 2, name: 'React Advanced Patterns', status: 'open' },
    { id: 3, name: 'Database Design & Optimization', status: 'closed' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ========== NAVBAR ========== */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-bold text-lg text-slate-900">SMIT Connect</span>
            </div>

            {/* Nav Links - Right Side */}
            <div className="flex items-center gap-4">
              <Link to={ROUTES.COURSES} className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
                Courses
              </Link>
              {user ? (
                <>
                  <span className="text-sm text-slate-600 hidden sm:inline">
                    Welcome, {profile?.name}
                  </span>
                  <Link
                    to={profile?.role === ROLES.ADMIN ? ROUTES.ADMIN.DASHBOARD : ROUTES.STUDENT.DASHBOARD}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link to={ROUTES.LOGIN} className="px-4 py-2 text-slate-700 hover:text-blue-600 transition-colors text-sm">
                    Sign in
                  </Link>
                  <Link to={ROUTES.SIGNUP} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ========== HERO SECTION ========== */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Empowering Students Through Smart Learning
            </h1>
            <p className="text-lg sm:text-xl text-blue-100">
              Apply for courses, manage leaves, and track your progress — all in one place. Designed for students, built by professionals.
            </p>

            {!user ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Link
                  to={ROUTES.COURSES}
                  className="w-full sm:w-auto px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 text-center"
                >
                  Explore Courses
                </Link>
                <Link
                  to={ROUTES.SIGNUP}
                  className="w-full sm:w-auto px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors duration-200 text-center"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <p className="text-blue-100">
                Welcome back! Head to your{' '}
                <Link
                  to={profile?.role === ROLES.ADMIN ? ROUTES.ADMIN.DASHBOARD : ROUTES.STUDENT.DASHBOARD}
                  className="underline hover:text-white transition-colors"
                >
                  dashboard
                </Link>
                {' '}to continue.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Key Features</h2>
            <p className="mt-4 text-lg text-slate-600">Everything you need to manage your academic journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '📚',
                title: 'Course Enrollment',
                description: 'Browse and apply for courses with instant confirmations',
              },
              {
                icon: '📋',
                title: 'Leave Management',
                description: 'Submit and track leave requests with ease',
              },
              {
                icon: '⚙️',
                title: 'Admin Control',
                description: 'Powerful tools for managing students and approvals',
              },
              {
                icon: '📊',
                title: 'Track Progress',
                description: 'Monitor your academic journey in real-time',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COURSES PREVIEW SECTION ========== */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Available Courses</h2>
            <p className="mt-4 text-lg text-slate-600">Start your learning journey today</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sampleCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex-1">{course.name}</h3>
                    <StatusBadge status={course.status} />
                  </div>
                  <p className="text-sm text-slate-600 mb-6">
                    Join this course to enhance your skills and knowledge.
                  </p>
                  <button
                    disabled={course.status === 'closed'}
                    className={`w-full py-2 rounded-lg font-medium transition-colors duration-200 ${
                      course.status === 'open'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {course.status === 'open' ? 'Apply Now' : 'Enrollment Closed'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to={ROUTES.COURSES}
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">Ready to Transform Your Learning?</h2>
            <p className="text-lg text-blue-100">
              Join thousands of students who are already taking control of their academic success.
            </p>
            {!user && (
              <Link
                to={ROUTES.SIGNUP}
                className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Create Your Account Now
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <span className="font-bold text-white">SMIT Connect</span>
              </div>
              <p className="text-sm text-slate-400">
                A modern platform empowering students to manage their academic journey efficiently.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <Link to={ROUTES.COURSES} className="hover:text-blue-400 transition-colors">
                  Browse Courses
                </Link>
                <br />
                {!user && (
                  <>
                    <Link to={ROUTES.LOGIN} className="hover:text-blue-400 transition-colors">
                      Sign In
                    </Link>
                    <br />
                    <Link to={ROUTES.SIGNUP} className="hover:text-blue-400 transition-colors">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Info */}
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <p>📧 support@smitconnect.edu</p>
                <p>📱 Available 24/7</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 SMIT Connect. All rights reserved. | Built with dedication for students.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
