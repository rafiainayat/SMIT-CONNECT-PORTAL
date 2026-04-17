import { useState } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { selectProfile } from '../../features/auth/authSlice'
import { sendPasswordReset } from '../../services/authService'
import { PageHeader } from '../../components/ui/PageHeader'
import Spinner from '../../components/ui/Spinner'

export default function AdminSettings() {
  const profile = useSelector(selectProfile)
  const [resetting, setResetting] = useState(false)
  const [resetDone, setResetDone] = useState(false)
  const initials = profile?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'AD'

  const handleReset = async () => {
    setResetting(true)
    const tid = toast.loading('Sending password reset email…')
    try {
      await sendPasswordReset(profile.email)
      setResetDone(true)
      toast.success('Password reset email sent! Check your inbox. 📧', { id: tid })
    } catch (err) { toast.error(err.message, { id: tid }) }
    finally { setResetting(false) }
  }

  const INFO = [
    { label: 'Full Name',    value: profile?.name },
    { label: 'Email',        value: profile?.email },
    { label: 'Role',         value: 'Administrator' },
    { label: 'Account ID',   value: profile?.id?.slice(0,8)+'…' },
    { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US',{month:'long',year:'numeric'}) : '—' },
  ]

  return (
    <div className="page-wrap max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your admin account" />

      {/* Profile card */}
      <div className="card mb-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl font-extrabold flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-lg font-extrabold text-gray-900 tracking-tight">{profile?.name}</p>
            <p className="text-sm text-gray-500 font-medium">{profile?.email}</p>
            <span className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              🛡 Administrator
            </span>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-5 space-y-3">
          {INFO.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm font-bold text-gray-400">{label}</span>
              <span className="text-sm font-semibold text-gray-900">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Password reset */}
      <div className="card mb-5">
        <h2 className="text-sm font-extrabold text-gray-700 uppercase tracking-widest mb-1">Security</h2>
        <p className="text-sm text-gray-500 font-medium mb-4">
          Send a password reset link to <strong>{profile?.email}</strong>
        </p>
        {resetDone ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 font-bold">
            ✅ Reset link sent! Check your inbox.
          </div>
        ) : (
          <button onClick={handleReset} disabled={resetting} className="btn-secondary">
            {resetting ? <><Spinner size="sm" /> Sending…</> : '📧 Send Password Reset Email'}
          </button>
        )}
      </div>

      {/* System info */}
      <div className="card mb-5 bg-gray-50 border-gray-200">
        <h2 className="text-sm font-extrabold text-gray-700 uppercase tracking-widest mb-4">System Info</h2>
        <div className="space-y-2">
          {[
            { label: 'Portal Version', value: 'v1.0.0' },
            { label: 'Tech Stack',     value: 'React + Supabase + Redux' },
            { label: 'Database',       value: 'PostgreSQL (Supabase)' },
            { label: 'Auth Provider',  value: 'Supabase Auth' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
              <span className="text-xs font-bold text-gray-700 bg-white px-3 py-1 rounded-lg border border-gray-200">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card border-red-100 bg-red-50/30">
        <h2 className="text-sm font-extrabold text-red-600 uppercase tracking-widest mb-1">Danger Zone</h2>
        <p className="text-sm text-gray-500 font-medium mb-4">Contact your system administrator for destructive actions.</p>
        <button onClick={() => toast.error('Contact your system admin to request portal deletion.')} className="btn-danger text-sm opacity-70 hover:opacity-100">
          Request Portal Deletion
        </button>
      </div>
    </div>
  )
}