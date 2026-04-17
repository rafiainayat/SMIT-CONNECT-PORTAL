import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { selectProfile, clearUser } from '../../features/auth/authSlice'
import { logoutUser } from '../../services/authService'
import { ROUTES } from '../../utils/constants'
import Spinner from '../ui/Spinner'

const NAV = [
  { to: ROUTES.STUDENT.DASHBOARD, label: 'Dashboard', icon: '🏠' },
  { to: ROUTES.COURSES,           label: 'Courses',   icon: '📚' },
  { to: ROUTES.STUDENT.LEAVES,    label: 'My Leaves', icon: '📅' },
]

export default function StudentLayout() {
  const dispatch     = useDispatch()
  const navigate     = useNavigate()
  const profile      = useSelector(selectProfile)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'ST'

  const handleLogout = async () => {
    setLoggingOut(true)
    const tid = toast.loading('Signing out…')
    try {
      await logoutUser()
      dispatch(clearUser())
      toast.success('Signed out successfully!', { id: tid })
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (err) { toast.error(err.message, { id: tid }) }
    finally { setLoggingOut(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={ROUTES.STUDENT.DASHBOARD} className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary-700 transition-colors">
                <span className="text-white text-sm">🎓</span>
              </div>
              <span className="font-bold text-gray-900 tracking-tight">SMIT Connect</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map(({ to, label, icon }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                    ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`
                  }>
                  <span>{icon}</span>{label}
                </NavLink>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-gray-900 leading-none">{profile?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{profile?.roll_number || 'Student'}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {initials}
                </div>
              </div>
              <button onClick={handleLogout} disabled={loggingOut}
                className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-50">
                {loggingOut ? <Spinner size="sm" /> : '🚪'}
                <span className="hidden lg:inline">{loggingOut ? 'Signing out…' : 'Sign out'}</span>
              </button>

              {/* Mobile hamburger */}
              <button onClick={() => setMenuOpen(p => !p)}
                className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 animate-slide-down">
            <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-xl mb-2">
              <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{profile?.name}</p>
                <p className="text-xs text-gray-400">{profile?.roll_number || 'Student'}</p>
              </div>
            </div>
            {NAV.map(({ to, label, icon }) => (
              <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`
                }>
                <span>{icon}</span>{label}
              </NavLink>
            ))}
            <button onClick={handleLogout} disabled={loggingOut}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all mt-1">
              {loggingOut ? <Spinner size="sm" /> : '🚪'}
              Sign out
            </button>
          </div>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="border-t border-gray-100 bg-white py-4">
        <p className="text-center text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} SMIT Connect Portal
        </p>
      </footer>
    </div>
  )
}