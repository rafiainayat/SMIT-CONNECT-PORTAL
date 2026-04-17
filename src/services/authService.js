import { supabase } from './supabase'

async function getProfile(id) {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
  if (error || !data) throw new Error('Profile not found. Contact support.')
  return data
}

export async function loginUser({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error) {
    if (error.message.includes('Invalid login credentials'))
      throw new Error('Incorrect email or password.')
    throw new Error(error.message)
  }
  const profile = await getProfile(data.user.id)
  return { user: data.user, profile }
}

export async function signupStudent({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(), password,
    options: { data: { name: name.trim(), role: 'student' } },
  })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Signup failed. Try again.')
  const { data: pd, error: pe } = await supabase.rpc('ensure_user_profile', {
    p_id: data.user.id, p_name: name.trim(), p_email: email.trim(),
  })
  if (pe) throw new Error(pe.message)
  const profile = typeof pd === 'string' ? JSON.parse(pd) : pd
  return { user: data.user, profile }
}

export async function signupAdmin({ name, email, password, adminCode }) {
  const code = import.meta.env.VITE_ADMIN_CODE || 'SMIT2024'
  if (adminCode !== code) throw new Error('Invalid admin access code.')
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(), password,
    options: { data: { name: name.trim(), role: 'admin' } },
  })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Signup failed.')
  const { error: ie } = await supabase.from('users').insert({
    id: data.user.id, name: name.trim(), email: email.trim(),
    cnic: `ADM-${Date.now()}`, roll_number: `ADM-${Date.now() + 1}`, role: 'admin',
  })
  if (ie) await supabase.from('users').update({ role: 'admin', name: name.trim() }).eq('id', data.user.id)
  const profile = await getProfile(data.user.id)
  return { user: data.user, profile }
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw new Error(error.message)
}