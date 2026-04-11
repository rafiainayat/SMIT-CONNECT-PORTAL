import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { signupFree, signupAdmin } from '../services/authService'
import { setUser } from '../features/auth/authSlice'
import { ROUTES } from '../utils/constants'
import { isValidEmail, isValidPassword } from '../utils/validators'
import AuthLayout from '../components/layout/AuthLayout'
import FormInput from '../components/ui/FormInput'
import Spinner from '../components/ui/Spinner'

export default function SignupPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [role, setRole]   = useState('student')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors]   = useState({})
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'', adminCode:'' })

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name || form.name.trim().length < 2) e.name = 'Full name required (min 2 chars)'
    if (!form.email) e.email = 'Email is required'
    else if (!isValidEmail(form.email)) e.email = 'Invalid email address'
    if (!form.password) e.password = 'Password is required'
    else if (!isValidPassword(form.password)) e.password = 'Min 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (role === 'admin' && !form.adminCode) e.adminCode = 'Admin access code is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || loading) return
    setLoading(true)
    const toastId = toast.loading('Creating your account…')
    try {
      const fn = role === 'admin' ? signupAdmin : signupFree
      const { user, profile } = await fn({
        name: form.name, email: form.email,
        password: form.password, adminCode: form.adminCode,
      })
      dispatch(setUser({ user, profile }))
      toast.success(`Account created! Welcome, ${profile.name} 🎉`, { id: toastId })
      navigate(profile.role === 'admin' ? ROUTES.ADMIN.DASHBOARD : ROUTES.STUDENT.DASHBOARD, { replace: true })
    } catch (err) {
      toast.error(err.message, { id: toastId })
      setErrors({ general: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Join SMIT Connect Portal">
      {/* Role toggle */}
      <div className="flex p-1 bg-gray-100 rounded-2xl mb-8 gap-1">
        {[
          { id: 'student', label: '🎓 Student' },
          { id: 'admin',   label: '🛡 Admin'   },
        ].map(({ id, label }) => (
          <button key={id} type="button" onClick={() => { setRole(id); setErrors({}) }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
              ${role === id ? 'bg-white text-primary-700 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            ⚠ {errors.general}
          </div>
        )}

        <FormInput id="name" name="name" label="Full name" placeholder="Muhammad Ali"
          value={form.name} onChange={handleChange} error={errors.name} required />
        <FormInput id="email" name="email" type="email" label="Email address"
          placeholder="you@example.com" value={form.email} onChange={handleChange} error={errors.email} required />
        <FormInput id="password" name="password" type={showPass ? 'text' : 'password'}
          label="Password" placeholder="Min 6 characters" value={form.password}
          onChange={handleChange} error={errors.password} required
          rightElement={
            <button type="button" onClick={() => setShowPass(p => !p)}
              className="text-xs font-medium text-gray-400 hover:text-gray-600">{showPass ? 'Hide' : 'Show'}
            </button>
          }
        />
        <FormInput id="confirmPassword" name="confirmPassword" type="password"
          label="Confirm password" placeholder="Repeat password" value={form.confirmPassword}
          onChange={handleChange} error={errors.confirmPassword} required />

        {role === 'admin' && (
          <FormInput id="adminCode" name="adminCode" label="Admin Access Code"
            placeholder="Enter admin code" value={form.adminCode}
            onChange={handleChange} error={errors.adminCode} required
            hint="Get this from your system administrator"
          />
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full h-11 mt-2 text-base">
          {loading ? <><Spinner size="sm" /> Creating account…</> : `Create ${role === 'admin' ? 'Admin' : 'Student'} Account`}
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  )
}