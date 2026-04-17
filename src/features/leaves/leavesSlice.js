import { createSlice } from '@reduxjs/toolkit'

const leavesSlice = createSlice({
  name: 'leaves',
  initialState: { myLeaves: [], allLeaves: [], loading: false },
  reducers: {
    setMyLeaves:       (s, a) => { s.myLeaves = a.payload; s.loading = false },
    setAllLeaves:      (s, a) => { s.allLeaves = a.payload; s.loading = false },
    addLeave:          (s, a) => { s.myLeaves.unshift(a.payload) },
    patchLeaveStatus:  (s, a) => { const l = s.allLeaves.find(x => x.id === a.payload.id); if (l) l.status = a.payload.status },
  },
})
export const { setMyLeaves, setAllLeaves, addLeave, patchLeaveStatus } = leavesSlice.actions
export const selectMyLeaves  = s => s.leaves.myLeaves
export const selectAllLeaves = s => s.leaves.allLeaves
export default leavesSlice.reducer