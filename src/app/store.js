import { configureStore } from '@reduxjs/toolkit'
import authReducer    from '../features/auth/authSlice'
import coursesReducer from '../features/courses/coursesSlice'
import leavesReducer  from '../features/leaves/leavesSlice'

export const store = configureStore({
  reducer: { auth: authReducer, courses: coursesReducer, leaves: leavesReducer },
  middleware: g => g({ serializableCheck: false }),
})