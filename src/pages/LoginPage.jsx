import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { loginUser } from '../services/authService'
import { loginUser, logoutUser } from '../services/authService'
import { setUser } from '../features/auth/authSlice'
import { ROUTES, ROLES } from '../utils/constants'
import { isValidEmail } from '../utils/validators'
import AuthLayout from '../components/layout/AuthLayout'
import FormInput from '../components/ui/FormInput'
import Spinner from '../components/ui/Spinner'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [role, setRole]       = useState('student')   // 'student' | 'admin'
  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!isValidEmail(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Min 6 characters'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || loading) return
    setLoading(true)
    const toastId = toast.loading(`Signing in as ${role}…`)
    try {
      const { user, profile } = await loginUser(form)

      // Role mismatch check
      if (profile.role !== role) {
        await import('../services/authService').then(m => m.logoutUser())
        await logoutUser()
        toast.error(`This account is not an ${role} account.`, { id: toastId })
        setLoading(false)
        return
      }

      dispatch(setUser({ user, profile }))
      toast.success(`Welcome back, ${profile.name}! 👋`, { id: toastId })
      navigate(profile.role === ROLES.ADMIN ? ROUTES.ADMIN.DASHBOARD : ROUTES.STUDENT.DASHBOARD, { replace: true })
    } catch (err) {
      toast.error(err.message, { id: toastId })
      setErrors({ general: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your SMIT Connect account">

      {/* ── Role toggle ── */}
      <div className="flex p-1 bg-gray-100 rounded-2xl mb-8 gap-1">
        {[
          { id: 'student', label: '🎓 Student' },
          { id: 'admin',   label: '🛡 Admin'   },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => { setRole(id); setErrors({}) }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
              ${role === id
                ? 'bg-white text-primary-700 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Role info banner */}
      <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium border transition-all
        ${role === 'admin'
          ? 'bg-purple-50 text-purple-700 border-purple-200'
          : 'bg-blue-50 text-blue-700 border-blue-200'
        }`}
      >
        {role === 'admin'
          ? '🛡 Admin login — full system access'
          : '🎓 Student login — manage your courses & leaves'}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
            <span className="text-red-500 mt-0.5">⚠</span> {errors.general}
          </div>
        )}

        <FormInput id="email" name="email" type="email" label="Email address"
          placeholder="you@example.com" value={form.email} onChange={handleChange}
          error={errors.email} autoComplete="email" required />

        <FormInput id="password" name="password" type={showPass ? 'text' : 'password'}
          label="Password" placeholder="••••••••" value={form.password}
          onChange={handleChange} error={errors.password} autoComplete="current-password" required
          rightElement={
            <button type="button" onClick={() => setShowPass(p => !p)}
              className="text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors">
              {showPass ? 'Hide' : 'Show'}
            </button>
          }
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full h-11 text-base">
          {loading ? <><Spinner size="sm" /> Signing in…</> : `Sign in as ${role === 'admin' ? 'Admin' : 'Student'}`}
        </button>

        {role === 'student' && (
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to={ROUTES.SIGNUP} className="text-primary-600 font-semibold hover:text-primary-700">
              Sign up
            </Link>
          </p>
        )}
      </form>
    </AuthLayout>
  )
}