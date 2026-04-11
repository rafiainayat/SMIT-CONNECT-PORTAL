/**
 * Validation Utilities
 * 
 * PRODUCTION SECURITY NOTE:
 * - These are FOR CLIENT-SIDE UX only
 * - ALWAYS validate server-side in Supabase functions
 * - Never trust client validation for security
 */

import { VALIDATION } from './constants'

/**
 * Validate CNIC format
 * @param {string} cnic - CNIC in format: XXXXX-XXXXXXX-X
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateCNIC = (cnic) => {
  if (!cnic || cnic.trim().length === 0) {
    return { isValid: false, error: 'CNIC is required' }
  }

  if (cnic.length !== VALIDATION.CNIC.LENGTH) {
    return { isValid: false, error: VALIDATION.CNIC.MESSAGE }
  }

  if (!VALIDATION.CNIC.REGEX.test(cnic)) {
    return { isValid: false, error: VALIDATION.CNIC.MESSAGE }
  }

  // checksum validation (Luhn algorithm for Pakistani CNICs)
  const digits = cnic.replace(/-/g, '')
  if (!validateCNICChecksum(digits)) {
    return { isValid: false, error: 'Invalid CNIC checksum' }
  }

  return { isValid: true, error: null }
}

/**
 * Validate CNIC checksum using Luhn algorithm
 * @param {string} cnic - CNIC without hyphens
 * @returns {boolean}
 */
const validateCNICChecksum = (cnic) => {
  const digits = cnic.slice(0, -1) // All digits except last
  const checksum = parseInt(cnic[cnic.length - 1])
  
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let digit = parseInt(digits[i])
    if ((digits.length - i) % 2 === 0) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }

  const expected = (10 - (sum % 10)) % 10
  return checksum === expected
}

/**
 * Validate email
 * @param {string} email
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' }
  }

  if (!VALIDATION.EMAIL.REGEX.test(email)) {
    return { isValid: false, error: VALIDATION.EMAIL.MESSAGE }
  }

  return { isValid: true, error: null }
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {object} { isValid: boolean, error: string, strength: 'weak' | 'medium' | 'strong' }
 */
export const validatePassword = (password) => {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Password is required', strength: 'weak' }
  }

  if (password.length < VALIDATION.PASSWORD.MIN_LENGTH) {
    return {
      isValid: false,
      error: VALIDATION.PASSWORD.MESSAGE,
      strength: 'weak',
    }
  }

  // Calculate password strength
  let strength = 'weak'
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*]/.test(password)
  const strengthScore = [hasUppercase, hasLowercase, hasNumbers, hasSpecial].filter(Boolean).length

  if (strengthScore >= 3) strength = 'strong'
  else if (strengthScore === 2) strength = 'medium'

  return { isValid: true, error: null, strength }
}

/**
 * Validate roll number format (e.g., "AB-1234")
 * @param {string} rollNumber
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateRollNumber = (rollNumber) => {
  if (!rollNumber || rollNumber.trim().length === 0) {
    return { isValid: false, error: 'Roll number is required' }
  }

  if (!VALIDATION.ROLL_NUMBER.REGEX.test(rollNumber.toUpperCase())) {
    return { isValid: false, error: VALIDATION.ROLL_NUMBER.MESSAGE }
  }

  return { isValid: true, error: null }
}

/**
 * Validate required field
 * @param {any} value
 * @param {string} fieldName
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (value === null || value === undefined || value.toString().trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` }
  }

  return { isValid: true, error: null }
}

/**
 * Validate min length
 * @param {string} value
 * @param {number} minLength
 * @param {string} fieldName
 * @returns {object}
 */
export const validateMinLength = (value, minLength, fieldName = 'This field') => {
  if (!value || value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    }
  }

  return { isValid: true, error: null }
}

/**
 * Validate date range (end date must be after start date)
 * @param {Date | string} startDate
 * @param {Date | string} endDate
 * @returns {object}
 */
export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (end < start) {
    return { isValid: false, error: 'End date must be after start date' }
  }

  return { isValid: true, error: null }
}

/**
 * Validate file size
 * @param {File} file
 * @param {number} maxSizeMB
 * @returns {object}
 */
export const validateFileSize = (file, maxSizeMB = 5) => {
  if (!file) {
    return { isValid: false, error: 'File is required' }
  }

  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > maxSizeMB) {
    return { isValid: false, error: `File must be under ${maxSizeMB}MB` }
  }

  return { isValid: true, error: null }
}

/**
 * Validate file type
 * @param {File} file
 * @param {string[]} allowedTypes - e.g., ['image/jpeg', 'image/png']
 * @returns {object}
 */
export const validateFileType = (file, allowedTypes = []) => {
  if (!file) {
    return { isValid: false, error: 'File is required' }
  }

  if (!allowedTypes.includes(file.type)) {
    const formats = allowedTypes.map(t => t.split('/')[1]).join(', ')
    return { isValid: false, error: `Only ${formats} files are allowed` }
  }

  return { isValid: true, error: null }
}
