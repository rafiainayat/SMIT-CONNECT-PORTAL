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
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const [role, setRole]         = useState('student')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors]     = useState({})
  const [form, setForm]         = useState({ name:'', email:'', password:'', confirmPassword:'', adminCode:'' })

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name || form.name.trim().length < 2) e.name = 'Full name required (min 2 chars)'
    if (!form.email)                  e.email           = 'Email is required'
    else if (!isValidEmail(form.email)) e.email         = 'Invalid email address'
    if (!form.password)               e.password        = 'Password is required'
    else if (!isValidPassword(form.password)) e.password= 'Min 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (role === 'admin' && !form.adminCode) e.adminCode = 'Admin access code is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate() || loading) return
    setLoading(true)
    const tid = toast.loading('Creating your account…')
    try {
      const fn = role === 'admin' ? signupAdmin : signupStudent
      const { user, profile } = await fn({ name: form.name, email: form.email, password: form.password, adminCode: form.adminCode })
      dispatch(setUser({ user, profile }))
      toast.success(`Account created! Welcome, ${profile.name} 🎉`, { id: tid })
      navigate(profile.role === 'admin' ? ROUTES.ADMIN.DASHBOARD : ROUTES.STUDENT.DASHBOARD, { replace: true })
    } catch (err) {
      toast.error(err.message, { id: tid })
      setErrors({ general: err.message })
    } finally { setLoading(false) }
  }

  return (
    <AuthLayout title="Create an account" subtitle="Join SMIT Connect Portal today">
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

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">⚠ {errors.general}</div>
        )}

        <FormInput id="name" name="name" label="Full name" placeholder="Muhammad Ali"
          value={form.name} onChange={handleChange} error={errors.name} required
          leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        />
        <FormInput id="email" name="email" type="email" label="Email address" placeholder="you@example.com"
          value={form.email} onChange={handleChange} error={errors.email} required
          leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>}
        />
        <FormInput id="password" name="password" type={showPass ? 'text' : 'password'}
          label="Password" placeholder="Min 6 characters" value={form.password}
          onChange={handleChange} error={errors.password} required hint="At least 6 characters"
          leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
          rightElement={<button type="button" onClick={() => setShowPass(p => !p)} className="text-xs font-semibold text-gray-400 hover:text-primary-600">{showPass ? 'Hide' : 'Show'}</button>}
        />
        <FormInput id="confirmPassword" name="confirmPassword" type="password"
          label="Confirm password" placeholder="Repeat password"
          value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required
        />

        {role === 'admin' && (
          <FormInput id="adminCode" name="adminCode" label="Admin Access Code"
            placeholder="Enter admin code (default: SMIT2024)"
            value={form.adminCode} onChange={handleChange} error={errors.adminCode} required
            hint="Set in your .env as VITE_ADMIN_CODE"
            leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          />
        )}

        <button type="submit" disabled={loading}
          className={`btn-primary w-full h-12 text-sm font-bold mt-1 ${role === 'admin' ? '!bg-purple-600 hover:!bg-purple-700' : ''}`}>
          {loading ? <><Spinner size="sm" /> Creating account…</> : `Create ${role === 'admin' ? 'Admin 🛡' : 'Student 🎓'} Account`}
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-primary-600 font-bold hover:text-primary-700">Sign in →</Link>
        </p>
      </form>
    </AuthLayout>
  )
}