export const ROLES = { ADMIN: 'admin', STUDENT: 'student' }
export const COURSE_STATUS = { OPEN: 'open', CLOSED: 'closed' }
export const LEAVE_STATUS  = { PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected' }
export const ROUTES = {
  HOME: '/', LOGIN: '/login', SIGNUP: '/signup', COURSES: '/courses',
  STUDENT: { DASHBOARD: '/student/dashboard', LEAVES: '/student/leaves' },
  ADMIN:   { DASHBOARD: '/admin/dashboard', STUDENTS: '/admin/students',
             COURSES: '/admin/courses', LEAVES: '/admin/leaves', SETTINGS: '/admin/settings' },
}