/**
 * Authentication Service
 * 
 * RESPONSIBILITY: All auth-related Supabase operations
 * - Signup
 * - Login
 * - Logout
 * - Password reset
 * - Token management (handled by Supabase)
 * 
 * SECURITY:
 * - Supabase handles JWT tokens securely
 * - Passwords never transmitted as plain text (HTTPS/TLS)
 * - Sessions stored securely in localStorage (browser default)
 */

import { supabase } from './supabase'

/**
 * Sign up new student
 * 
 * PROCESS:
 * 1. Create auth user via Supabase Auth
 * 2. Create user profile in users table with student role
 */
export const signupStudent = async (name, email, password, cnic = '', rollNumber = '') => {
  try {
    // Create auth user (profile auto-created by trigger)
    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    })

    if (signupError) {
      console.error('Signup error:', signupError)
      if (signupError.message.includes('already registered') || signupError.status === 422) {
        throw new Error('This email is already registered. Please login with this email or use a different one to sign up.')
      }
      throw signupError
    }
    
    if (!authData.user) throw new Error('Failed to create auth user')

    // Wait for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 500))

    // Update profile with CNIC and Roll Number if provided
    if (cnic || rollNumber) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          cnic: cnic || null,
          roll_number: rollNumber || null,
        })
        .eq('id', authData.user.id)
      
      if (updateError) {
        console.warn('Could not update CNIC/Roll Number:', updateError)
      }
    }

    // Use database function to ensure profile exists and fetch it
    const { data: profile, error: profileError } = await supabase
      .rpc('ensure_user_profile', {
        p_id: authData.user.id,
        p_name: name,
        p_email: email,
      })

    if (profileError) {
      console.warn('Could not fetch profile:', profileError)
    }

    return {
      user: authData.user,
      session: authData.session,
      profile: profile || {
        id: authData.user.id,
        name: name,
        email: email,
        cnic: cnic || null,
        roll_number: rollNumber || null,
        role: 'student',
      },
    }
  } catch (error) {
    throw new Error(error.message || 'Signup failed. Please try again.')
  }
}

/**
 * Login user (student or admin)
 */
export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    if (!data.user) throw new Error('Login failed')

    // Use database function to fetch profile (bypasses RLS)
    const { data: profile, error: profileError } = await supabase
      .rpc('get_my_profile')

    if (profileError) {
      console.warn('Could not fetch profile:', profileError)
    }

    return {
      user: data.user,
      session: data.session,
      profile: profile,
    }
  } catch (error) {
    throw new Error(error.message || 'Login failed. Check email and password.')
  }
}

/**
 * Logout user
 */
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    throw new Error(error.message || 'Logout failed')
  }
}

/**
 * Request password reset
 */
export const requestPasswordReset = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error

    return { success: true }
  } catch (error) {
    throw new Error(error.message || 'Password reset request failed')
  }
}

/**
 * Update password
 */
export const updatePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error

    return { success: true }
  } catch (error) {
    throw new Error(error.message || 'Password update failed')
  }
}

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  } catch (error) {
    console.error('Session check error:', error)
    return null
  }
}

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}
