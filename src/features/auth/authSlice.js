import { createSlice } from '@reduxjs/toolkit'

/**
 * Auth Redux Slice
 * 
 * RESPONSIBILITY: Global auth state management
 * - Current user session
 * - User profile (role, CNIC, roll number, etc.)
 * - Auth loading state
 * - Auth errors
 * 
 * DESIGN PRINCIPLES:
 * - Minimal state in Redux (only what needs to be shared across components)
 * - Session data from Supabase handled in context/service layer
 * - No sensitive tokens stored (Supabase handles JWT automatically)
 */

const initialState = {
  user: null,           // Supabase user object { id, email, ... }
  profile: null,        // User profile { id, name, cnic, role, ... }
  loading: true,        // Initial auth check in progress
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, profile } = action.payload
      state.user = user
      state.profile = profile
      state.loading = false
      state.error = null
    },
    clearUser: (state) => {
      state.user = null
      state.profile = null
      state.loading = false
      state.error = null
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload
    },
    setAuthError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { setUser, clearUser, setAuthLoading, setAuthError } = authSlice.actions

// Selectors - BEST PRACTICE: Use selectors for decoupled state access
export const selectUser = (state) => state.auth.user
export const selectProfile = (state) => state.auth.profile
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError = (state) => state.auth.error
export const selectUserRole = (state) => state.auth.profile?.role
export const selectIsAuthenticated = (state) => !!state.auth.user

export default authSlice.reducer
