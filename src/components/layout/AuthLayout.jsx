import { Link } from 'react-router-dom'
import { ROUTES } from '../../utils/constants'

const FEATURES = [
  { icon: '📚', text: 'Apply for courses in one click' },
  { icon: '📅', text: 'Submit leave with date & attachment' },
  { icon: '🛡', text: 'Role-based secure access control' },
  { icon: '📊', text: 'Real-time status tracking' },
]

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-1/2 relative bg-gradient-to-br from-primary-950 via-primary-800 to-primary-600 flex-col justify-between p-12 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -right-24 w-[500px] h-[500px] rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-10 w-48 h-48 rounded-full bg-primary-500/30" />

        {/* Logo */}
        <Link to={ROUTES.HOME} className="relative flex items-center gap-3">
          <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20">
            <span className="text-2xl">🎓</span>
          </div>
          <div>
            <p className="text-white font-bold text-xl tracking-tight leading-none">SMIT Connect</p>
            <p className="text-primary-200 text-xs font-medium mt-0.5">Student Management Portal</p>
          </div>
        </Link>

        {/* Hero */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-xs font-semibold">SMIT — Saylani Mass IT Training</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-5">
            Your academic<br />
            <span className="text-primary-200">journey starts</span><br />
            right here.
          </h1>
          <p className="text-primary-200 text-base leading-relaxed mb-8 max-w-sm">
            Manage admissions, courses, and leave requests from a single powerful platform.
          </p>
          <div className="space-y-3">
            {FEATURES.map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <span className="text-primary-100 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-primary-300 text-xs">© {new Date().getFullYear()} SMIT Connect Portal.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center bg-gray-50 px-5 py-10 sm:px-10 lg:px-16 xl:px-20">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🎓</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">SMIT Connect</span>
          </Link>
        </div>
        <div className="w-full max-w-md mx-auto">
          <div className="mb-7">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
            <p className="text-gray-500 text-sm mt-1.5 font-medium">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}