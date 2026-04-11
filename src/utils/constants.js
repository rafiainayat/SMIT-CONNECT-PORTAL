/**
 * Application Constants
 * 
 * BEST PRACTICE: Centralize all constants
 * - Avoids magic strings throughout codebase
 * - Single source of truth
 * - Easy to update across entire app
 * - Type consistency
 */

// User Roles
export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
}

// Route Constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  COURSES: '/courses',
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    LEAVES: '/student/leaves',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    STUDENTS: '/admin/students',
    COURSES: '/admin/courses',
    LEAVES: '/admin/leaves',
    SETTINGS: '/admin/settings',
  },
}

// Application Status
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
}

// Course Status
export const COURSE_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  UPCOMING: 'upcoming',
}

// Leave Status
export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

// Validation Rules
export const VALIDATION = {
  CNIC: {
    LENGTH: 13,
    REGEX: /^\d{5}-\d{7}-\d{1}$/, // Format: XXXXX-XXXXXXX-X
    MESSAGE: 'CNIC must be in format: XXXXX-XXXXXXX-X',
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MESSAGE: 'Password must be at least 6 characters',
  },
  ROLL_NUMBER: {
    REGEX: /^[A-Z]{2}-\d{4}$/,
    MESSAGE: 'Roll number must be in format: XX-0000',
  },
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address',
  },
}

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
}

// Pagination
export const PAGINATION = {
  ITEMS_PER_PAGE: 10,
  DEFAULT_PAGE: 1,
}

// UI Theme Colors
export const COLORS = {
  PRIMARY: '#2563eb',   // Blue
  SUCCESS: '#10b981',   // Green
  WARNING: '#f59e0b',   // Amber
  ERROR: '#ef4444',     // Red
  GRAY: '#6b7280',
}

// Status Badge Styles
export const STATUS_BADGE_STYLES = {
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  approved: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  open: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  closed: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
  withdrawn: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
}
