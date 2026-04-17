import { Link } from 'react-router-dom'
import { ROUTES } from '../../utils/constants'

const FEATURES = [
  'Apply for courses in one place',
  'Track leave requests and approvals',
  'Secure student and admin access',
]

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="hidden lg:flex lg:w-[44%] xl:w-[42%]">
          <div className="flex w-full flex-col justify-between bg-slate-900 px-10 py-12 text-white xl:px-14">
            <div>
              <Link to={ROUTES.HOME} className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                  <span className="text-sm font-bold tracking-[0.18em]">SC</span>
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight">SMIT Connect</p>
                  <p className="text-sm text-slate-300">Student Management Portal</p>
                </div>
              </Link>
            </div>

            <div className="max-w-md">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
                Saylani Mass IT Training
              </p>
              <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">
                A clear place to manage courses, applications, and student activity.
              </h1>
              <p className="mt-5 max-w-sm text-base leading-7 text-slate-300">
                Sign in or create your account to continue with SMIT Connect.
              </p>
              <div className="mt-10 space-y-3">
                {FEATURES.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Copyright {new Date().getFullYear()} SMIT Connect Portal
            </p>
          </div>
        </aside>

        <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link to={ROUTES.HOME} className="inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-600 text-sm font-bold tracking-[0.18em] text-white">
                  SC
                </div>
                <div>
                  <p className="font-semibold tracking-tight text-gray-900">SMIT Connect</p>
                  <p className="text-sm text-gray-500">Student Management Portal</p>
                </div>
              </Link>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-7 shadow-card sm:p-8">
              <div className="mb-7">
                <h2 className="text-3xl font-semibold tracking-tight text-gray-900">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">{subtitle}</p>
              </div>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
