import { createSlice } from '@reduxjs/toolkit'

/**
 * Leaves Redux Slice
 * 
 * RESPONSIBILITY:
 * - All leave requests (admin view)
 * - User's leave requests (student view)
 * - Leave request submission
 * - Leave status tracking
 */

const initialState = {
  allLeaves: [],          // For admin view - all leaves
  myLeaves: [],           // For student view - user's leaves only
  loading: false,
  error: null,
  filters: {
    statusFilter: 'all',  // pending, approved, rejected, all
    userFilter: null,     // For admin filtering by user
  },
}

const leavesSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    // Set all leaves (admin only)
    setAllLeaves: (state, action) => {
      state.allLeaves = action.payload
      state.error = null
    },

    // Set user's leaves (student only)
    setMyLeaves: (state, action) => {
      state.myLeaves = action.payload
      state.error = null
    },

    // Add new leave (student submits)
    addLeave: (state, action) => {
      state.myLeaves.unshift(action.payload) // Add to front
    },

    // Update leave status (admin approves/rejects)
    updateLeaveStatus: (state, action) => {
      const { leaveId, status } = action.payload
      
      // Update in allLeaves
      const allLeave = state.allLeaves.find(l => l.id === leaveId)
      if (allLeave) allLeave.status = status

      // Update in myLeaves if it's the user's
      const myLeave = state.myLeaves.find(l => l.id === leaveId)
      if (myLeave) myLeave.status = status
    },

    // Set loading state
    setLeavesLoading: (state, action) => {
      state.loading = action.payload
    },

    // Set error
    setLeavesError: (state, action) => {
      state.error = action.payload
    },

    // Update filters
    setStatusFilter: (state, action) => {
      state.filters.statusFilter = action.payload
    },

    setUserFilter: (state, action) => {
      state.filters.userFilter = action.payload
    },

    // Clear error
    clearLeavesError: (state) => {
      state.error = null
    },
  },
})

export const {
  setAllLeaves,
  setMyLeaves,
  addLeave,
  updateLeaveStatus,
  setLeavesLoading,
  setLeavesError,
  setStatusFilter,
  setUserFilter,
  clearLeavesError,
} = leavesSlice.actions

// Selectors
export const selectAllLeaves = (state) => state.leaves.allLeaves
export const selectMyLeaves = (state) => state.leaves.myLeaves
export const selectLeavesLoading = (state) => state.leaves.loading
export const selectLeavesError = (state) => state.leaves.error
export const selectLeavesFilters = (state) => state.leaves.filters
export const selectPendingLeavesCount = (state) =>
  state.leaves.allLeaves.filter(l => l.status === 'pending').length

export default leavesSlice.reducer
