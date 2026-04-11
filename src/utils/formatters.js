/**
 * Formatter Utilities
 * 
 * RESPONSIBILITY: Data formatting and transformation
 * - Date formatting
 * - Currency formatting
 * - Text truncation
 * - etc.
 */

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'full'
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return ''

  const d = new Date(date)
  
  const options = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  }

  return d.toLocaleDateString('en-PK', options[format] || options.short)
}

/**
 * Format date and time
 * @param {string|Date} date
 * @returns {string} e.g., "3 Jan 2024, 2:30 PM"
 */
export const formatDateTime = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  return d.toLocaleDateString('en-PK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ', ' + d.toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string|Date} date
 * @returns {string}
 */
export const getRelativeTime = (date) => {
  if (!date) return ''

  const now = new Date()
  const d = new Date(date)
  const diff = Math.floor((now - d) / 1000) // Difference in seconds

  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
  
  return formatDate(d)
}

/**
 * Get time of day greeting
 * @returns {string} "Good morning" / "Good afternoon" / "Good evening"
 */
export const getGreeting = () => {
  const hour = new Date().getHours()
  
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} length
 * @returns {string}
 */
export const truncate = (text, length = 50) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Capitalize first letter
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert text to URL-friendly slug
 * @param {string} text
 * @returns {string}
 */
export const slugify = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Extract initials from name
 * @param {string} name - Full name
 * @returns {string} e.g., "AH" from "Ahmad Hassan"
 */
export const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(word => word.length > 0)
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('')
}

/**
 * Format file size
 * @param {number} bytes
 * @returns {string} e.g., "2.5 MB"
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format currency (Pakistani Rupees)
 * @param {number} amount
 * @returns {string} e.g., "Rs. 5,000"
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '—'
  
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
  }).format(amount)
}
