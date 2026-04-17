import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { selectProfile, clearUser } from '../../features/auth/authSlice'
import { logoutUser } from '../../services/authService'
import { ROUTES } from '../../utils/constants'
import Spinner from '../ui/Spinner'

const NAV = [
  { to: ROUTES.ADMIN.DASHBOARD, label: 'Dashboard', icon: '🏠' },
  { to: ROUTES.ADMIN.STUDENTS,  label: 'Students',  icon: '👥' },
  { to: ROUTES.ADMIN.COURSES,   label: 'Courses',   icon: '📚' },
  { to: ROUTES.ADMIN.LEAVES,    label: 'Leaves',    icon: '📅' },
  { to: ROUTES.ADMIN.SETTINGS,  label: 'Settings',  icon: '⚙️' },
]

function SidebarInner({ profile, onClose, onLogout, loggingOut }) {
  const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD'
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-[68px] border-b border-gray-100 flex-shrink-0">
        <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-white text-lg">🎓</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-none">SMIT Connect</p>
          <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-3 mb-3">Navigation</p>
        {NAV.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
              ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`
            }>
            <span className="text-base flex-shrink-0">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Profile + logout */}
      <div className="flex-shrink-0 p-3 border-t border-gray-100 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate leading-none">{profile?.name}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{profile?.email}</p>
          </div>
          <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 flex-shrink-0">Admin</span>
        </div>
        <button onClick={onLogout} disabled={loggingOut}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50">
          {loggingOut ? <Spinner size="sm" /> : <span>🚪</span>}
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const profile   = useSelector(selectProfile)
  const [open, setOpen]          = useState(false)
  const [loggingOut, setLogging] = useState(false)

  const handleLogout = async () => {
    setLogging(true)
    const tid = toast.loading('Signing out…')
    try {
      await logoutUser()
      dispatch(clearUser())
      toast.success('Signed out successfully!', { id: tid })
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (err) { toast.error(err.message, { id: tid }) }
    finally { setLogging(false) }
  }

  const initials     = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD'
  const currentPage  = NAV.find(n => location.pathname === n.to)?.label || 'Admin Panel'

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 flex-shrink-0" style={{ boxShadow: '2px 0 20px -5px rgb(0 0 0/.08)' }}>
        <SidebarInner profile={profile} onClose={() => {}} onLogout={handleLogout} loggingOut={loggingOut} />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
          <aside className="relative w-72 bg-white shadow-modal flex flex-col z-10 animate-slide-down">
            <SidebarInner profile={profile} onClose={() => setOpen(false)} onLogout={handleLogout} loggingOut={loggingOut} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-[68px] bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <p className="text-base font-bold text-gray-900 leading-none">{currentPage}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5 hidden sm:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={handleLogout} disabled={loggingOut}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-50">
              {loggingOut ? <Spinner size="sm" /> : '🚪'}
              <span className="hidden md:inline">{loggingOut ? 'Signing out…' : 'Sign out'}</span>
            </button>
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none">{profile?.name?.split(' ')[0]}</p>
                <p className="text-xs text-gray-400 mt-0.5">Administrator</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  )
}