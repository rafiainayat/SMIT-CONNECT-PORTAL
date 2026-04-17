import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
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
  const [role, setRole] = useState('student')
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.email) nextErrors.email = 'Email is required'
    else if (!isValidEmail(form.email)) nextErrors.email = 'Enter a valid email'
    if (!form.password) nextErrors.password = 'Password is required'
    else if (form.password.length < 6) nextErrors.password = 'Min 6 characters'
    setErrors(nextErrors)
    return !Object.keys(nextErrors).length
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate() || loading) return

    setLoading(true)
    const toastId = toast.loading(`Signing in as ${role === 'admin' ? 'Admin' : 'Student'}...`)

    try {
      const { user, profile } = await loginUser(form)

      if (profile.role !== role) {
        await logoutUser()
        toast.error(`This account is not a${role === 'admin' ? 'n admin' : ' student'} account.`, { id: toastId })
        setLoading(false)
        return
      }

      dispatch(setUser({ user, profile }))
      toast.success(`Welcome back, ${profile.name}!`, { id: toastId })
      navigate(profile.role === ROLES.ADMIN ? ROUTES.ADMIN.DASHBOARD : ROUTES.STUDENT.DASHBOARD, { replace: true })
    } catch (error) {
      toast.error(error.message, { id: toastId })
      setErrors({ general: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your SMIT Connect account.">
      <div className="mb-6 flex rounded-2xl bg-gray-100 p-1">
        {[
          { id: 'student', label: 'Student' },
          { id: 'admin', label: 'Admin' },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setRole(id)
              setErrors({})
            }}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              role === id ? 'border border-gray-200 bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
          role === 'admin' ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-sky-200 bg-sky-50 text-sky-700'
        }`}
      >
        {role === 'admin' ? 'Admin access for portal management.' : 'Student access for courses and leave requests.'}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {errors.general && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        <FormInput
          id="email"
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          required
        />

        <FormInput
          id="password"
          name="password"
          type={showPass ? 'text' : 'password'}
          label="Password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
          required
          rightElement={(
            <button
              type="button"
              onClick={() => setShowPass((prev) => !prev)}
              className="text-xs font-medium text-gray-400 transition-colors hover:text-gray-600"
            >
              {showPass ? 'Hide' : 'Show'}
            </button>
          )}
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => toast('Enter your email and contact admin if you need a reset.')}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Forgot password?
          </button>
        </div>

        <button type="submit" disabled={loading} className="btn-primary h-11 w-full text-base">
          {loading ? <><Spinner size="sm" /> Signing in...</> : `Sign in as ${role === 'admin' ? 'Admin' : 'Student'}`}
        </button>

        {role === 'student' && (
          <p className="text-center text-sm text-gray-500">
            Do not have an account?{' '}
            <Link to={ROUTES.SIGNUP} className="font-semibold text-primary-600 hover:text-primary-700">
              Sign up
            </Link>
          </p>
        )}
      </form>
    </AuthLayout>
  )
}
