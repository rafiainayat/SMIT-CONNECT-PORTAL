import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, profile: null, loading: true },
  reducers: {
    setUser:    (s, a) => { s.user = a.payload.user; s.profile = a.payload.profile; s.loading = false },
    clearUser:  (s)    => { s.user = null; s.profile = null; s.loading = false },
    setLoading: (s, a) => { s.loading = a.payload },
  },
})
export const { setUser, clearUser, setLoading } = authSlice.actions
export const selectUser        = s => s.auth.user
export const selectProfile     = s => s.auth.profile
export const selectRole        = s => s.auth.profile?.role
export const selectAuthLoading = s => s.auth.loading
export default authSlice.reducer