import { createSlice } from '@reduxjs/toolkit'

/**
 * Courses Redux Slice
 * 
 * RESPONSIBILITY: 
 * - All courses (public listing)
 * - User's course applications
 * - Courses loading/error states
 * 
 * WHY REDUX (not just component state)?
 * - Courses page needs to share data with Student Dashboard
 * - Admin courses management needs consistency
 * - Filters/search should persist across navigation
 */

const initialState = {
  allCourses: [],           // List of all courses
  myApplications: [],       // Current user's applications only
  loading: false,
  error: null,
  filters: {
    searchTerm: '',
    statusFilter: 'all',    // all, open, closed
  },
}

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    // Set all courses (for public listing or admin view)
    setAllCourses: (state, action) => {
      state.allCourses = action.payload
      state.error = null
    },

    // Set user's applications
    setMyApplications: (state, action) => {
      state.myApplications = action.payload
      state.error = null
    },

    // Add single application to user's list
    addApplication: (state, action) => {
      // Avoid duplicates
      if (!state.myApplications.find(a => a.course_id === action.payload.course_id)) {
        state.myApplications.push(action.payload)
      }
    },

    // Update application status (when admin approves/rejects)
    updateApplicationStatus: (state, action) => {
      const { applicationId, status } = action.payload
      const app = state.myApplications.find(a => a.id === applicationId)
      if (app) app.status = status
    },

    // Set loading state
    setCoursesLoading: (state, action) => {
      state.loading = action.payload
    },

    // Set error
    setCoursesError: (state, action) => {
      state.error = action.payload
    },

    // Update filters
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload
    },

    setStatusFilter: (state, action) => {
      state.filters.statusFilter = action.payload
    },

    // Clear error
    clearCoursesError: (state) => {
      state.error = null
    },
  },
})

export const {
  setAllCourses,
  setMyApplications,
  addApplication,
  updateApplicationStatus,
  setCoursesLoading,
  setCoursesError,
  setSearchTerm,
  setStatusFilter,
  clearCoursesError,
} = coursesSlice.actions

// Selectors
export const selectAllCourses = (state) => state.courses.allCourses
export const selectMyApplications = (state) => state.courses.myApplications
export const selectCoursesLoading = (state) => state.courses.loading
export const selectCoursesError = (state) => state.courses.error
export const selectCourseFilters = (state) => state.courses.filters
export const selectApplicationIds = (state) =>
  new Set(state.courses.myApplications.map(a => a.course_id))

export default coursesSlice.reducer
