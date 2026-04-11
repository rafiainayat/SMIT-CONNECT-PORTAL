import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import coursesReducer from '../features/courses/coursesSlice'
import leavesReducer from '../features/leaves/leavesSlice'

/**
 * Redux Store Configuration
 * 
 * PRODUCTION-LEVEL ARCHITECTURE:
 * - Slice-based feature organization
 * - Middleware for error handling
 * - Thunk support for async operations (built-in)
 * - DevTools enabled for development
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    leaves: leavesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore specific action types that contain unserializable values (like Date objects)
        ignoredActions: ['auth/setUser'],
        ignoredPaths: ['auth.user'],
      },
    }),
  devTools: import.meta.env.MODE === 'development',
})

export default store
