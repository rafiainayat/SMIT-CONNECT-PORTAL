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
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const [role, setRole]         = useState('student')
  const [form, setForm]         = useState({ email: '', password: '' })
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = e => {
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

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate() || loading) return
    setLoading(true)
    const tid = toast.loading(`Signing in as ${role === 'admin' ? 'Admin' : 'Student'}…`)
    try {
      const { user, profile } = await loginUser(form)
      if (profile.role !== role) {
        await logoutUser()
        toast.error(`This account is not a${role === 'admin' ? 'n admin' : ' student'} account.`, { id: tid })
        setLoading(false)
        return
      }
      dispatch(setUser({ user, profile }))
      toast.success(`Welcome back, ${profile.name}! 👋`, { id: tid })
      navigate(profile.role === ROLES.ADMIN ? ROUTES.ADMIN.DASHBOARD : ROUTES.STUDENT.DASHBOARD, { replace: true })
    } catch (err) {
      toast.error(err.message, { id: tid })
      setErrors({ general: err.message })
    } finally { setLoading(false) }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your SMIT Connect account">
      {/* Role toggle */}
      <div className="flex p-1 bg-gray-100 rounded-2xl mb-7 gap-1">
        {[{ id: 'student', label: '🎓 Student' }, { id: 'admin', label: '🛡 Admin' }].map(({ id, label }) => (
          <button key={id} type="button" onClick={() => { setRole(id); setErrors({}) }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
              ${role === id ? 'bg-white text-primary-700 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Role info banner */}
      <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-semibold border
        ${role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
        {role === 'admin' ? '🛡 Admin login — full system control' : '🎓 Student — courses & leave management'}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
            ⚠ {errors.general}
          </div>
        )}

        <FormInput id="email" name="email" type="email" label="Email address"
          placeholder="you@example.com" value={form.email} onChange={handleChange}
          error={errors.email} autoComplete="email" required
          leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>}
        />

        <FormInput id="password" name="password" type={showPass ? 'text' : 'password'}
          label="Password" placeholder="••••••••" value={form.password}
          onChange={handleChange} error={errors.password} autoComplete="current-password" required
          leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
          rightElement={<button type="button" onClick={() => setShowPass(p => !p)} className="text-xs font-semibold text-gray-400 hover:text-primary-600 transition-colors">{showPass ? 'Hide' : 'Show'}</button>}
        />

        <div className="flex justify-end">
          <button type="button" onClick={() => toast('Password reset — enter your email below and contact admin.', { icon: 'ℹ️' })}
            className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
            Forgot password?
          </button>
        </div>

        <button type="submit" disabled={loading}
          className={`btn-primary w-full h-12 text-sm font-bold ${role === 'admin' ? '!bg-purple-600 hover:!bg-purple-700' : ''}`}>
          {loading ? <><Spinner size="sm" /> Signing in…</> : `Sign in as ${role === 'admin' ? 'Admin 🛡' : 'Student 🎓'}`}
        </button>

        {role === 'student' && (
          <p className="text-center text-sm text-gray-500">
            No account?{' '}
            <Link to={ROUTES.SIGNUP} className="text-primary-600 font-bold hover:text-primary-700">Create one →</Link>
          </p>
        )}
      </form>
    </AuthLayout>
  )
}