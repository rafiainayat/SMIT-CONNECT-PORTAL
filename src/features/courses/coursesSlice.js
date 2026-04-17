import { createSlice } from '@reduxjs/toolkit'

const coursesSlice = createSlice({
  name: 'courses',
  initialState: { list: [], loading: false },
  reducers: {
    setCourses: (s, a) => { s.list = a.payload; s.loading = false },
    addCourse:  (s, a) => { s.list.unshift(a.payload) },
    editCourse: (s, a) => { const i = s.list.findIndex(c => c.id === a.payload.id); if (i !== -1) s.list[i] = a.payload },
    dropCourse: (s, a) => { s.list = s.list.filter(c => c.id !== a.payload) },
    setLoading: (s, a) => { s.loading = a.payload },
  },
})
export const { setCourses, addCourse, editCourse, dropCourse } = coursesSlice.actions
export const selectCourses        = s => s.courses.list
export const selectCoursesLoading = s => s.courses.loading
export default coursesSlice.reducer