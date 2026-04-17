import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { signupStudent, signupAdmin } from '../services/authService'
import { setUser } from '../features/auth/authSlice'
import { ROUTES } from '../utils/constants'
import { isValidEmail, isValidPassword } from '../utils/validators'
import AuthLayout from '../components/layout/AuthLayout'
import FormInput from '../components/ui/FormInput'
import Spinner from '../components/ui/Spinner'

export default function SignupPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.name || form.name.trim().length < 2) nextErrors.name = 'Full name required (min 2 chars)'
    if (!form.email) nextErrors.email = 'Email is required'
    else if (!isValidEmail(form.email)) nextErrors.email = 'Invalid email address'
    if (!form.password) nextErrors.password = 'Password is required'
    else if (!isValidPassword(form.password)) nextErrors.password = 'Min 6 characters'
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match'
    if (role === 'admin' && !form.adminCode) nextErrors.adminCode = 'Admin access code is required'
    setErrors(nextErrors)
    return !Object.keys(nextErrors).length
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate() || loading) return

    setLoading(true)
    const toastId = toast.loading('Creating your account...')

    try {
      const signup = role === 'admin' ? signupAdmin : signupStudent
      const { user, profile } = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        adminCode: form.adminCode,
      })

      dispatch(setUser({ user, profile }))
      toast.success(`Account created for ${profile.name}.`, { id: toastId })
      navigate(profile.role === 'admin' ? ROUTES.ADMIN.DASHBOARD : ROUTES.STUDENT.DASHBOARD, { replace: true })
    } catch (error) {
      toast.error(error.message, { id: toastId })
      setErrors({ general: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Join SMIT Connect and set up your access.">
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

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.general && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        <FormInput
          id="name"
          name="name"
          label="Full name"
          placeholder="Muhammad Ali"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <FormInput
          id="email"
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <FormInput
          id="password"
          name="password"
          type={showPass ? 'text' : 'password'}
          label="Password"
          placeholder="Min 6 characters"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          required
          hint="At least 6 characters"
          rightElement={(
            <button
              type="button"
              onClick={() => setShowPass((prev) => !prev)}
              className="text-xs font-medium text-gray-400 hover:text-gray-600"
            >
              {showPass ? 'Hide' : 'Show'}
            </button>
          )}
        />

        <FormInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm password"
          placeholder="Repeat password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
        />

        {role === 'admin' && (
          <FormInput
            id="adminCode"
            name="adminCode"
            label="Admin access code"
            placeholder="Enter admin code"
            value={form.adminCode}
            onChange={handleChange}
            error={errors.adminCode}
            required
            hint="Set in .env as VITE_ADMIN_CODE"
          />
        )}

        <button type="submit" disabled={loading} className="btn-primary mt-2 h-11 w-full text-base">
          {loading ? <><Spinner size="sm" /> Creating account...</> : `Create ${role === 'admin' ? 'Admin' : 'Student'} Account`}
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-semibold text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
