/**
 * AdminLayout Component
 * 
 * Sidebar navigation for admin dashboard
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { selectProfile, clearUser } from '../../features/auth/authSlice'
import { logoutUser } from '../../services/authService'
import { ROUTES } from '../../utils/constants'
import { getInitials } from '../../utils/formatters'
import Spinner from '../ui/Spinner'
import toast from 'react-hot-toast'

const ADMIN_MENU = [
  { label: 'Dashboard', path: ROUTES.ADMIN.DASHBOARD, icon: '📊' },
  { label: 'Students', path: ROUTES.ADMIN.STUDENTS, icon: '👥' },
  { label: 'Courses', path: ROUTES.ADMIN.COURSES, icon: '📚' },
  { label: 'Leaves', path: ROUTES.ADMIN.LEAVES, icon: '📅' },
  { label: 'Settings', path: ROUTES.ADMIN.SETTINGS, icon: '⚙️' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const profile = useSelector(selectProfile)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logoutUser()
      dispatch(clearUser())
      toast.success('Logged out successfully')
      navigate(ROUTES.HOME)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoggingOut(false)
    }
  }

  const isActive = (path) => window.location.pathname === path

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`fixed md:relative w-64 h-screen bg-gray-900 text-white transform transition-transform md:translate-x-0 z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Close button (mobile) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-bold text-lg">SMIT Admin</span>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1 flex-1 overflow-y-auto">
          {ADMIN_MENU.map(item => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path)
                setSidebarOpen(false)
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 text-sm font-medium ${
                isActive(item.path)
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-gray-800 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
              {getInitials(profile?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.name}</p>
              <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            {loggingOut ? <Spinner size="sm" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>}
            {loggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Top Bar (Mobile toggle) */}
        <header className="md:hidden bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-gray-900">SMIT Connect</span>
          <div className="w-6" /> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <div className="bg-gray-50 min-h-screen p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
