export const isValidEmail      = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim())
export const isValidPassword   = v => String(v).length >= 6
export const isValidCNIC       = v => /^\d{13}$/.test(String(v).trim())
export const isValidRollNumber = v => /^[A-Za-z0-9-]{2,20}$/.test(String(v).trim())

export function validateStudentRow(row, index) {
  const errors = []
  if (!row.name || row.name.trim().length < 2)
    errors.push(`Row ${index + 1}: Name required (min 2 chars)`)
  if (!row.cnic || !isValidCNIC(String(row.cnic)))
    errors.push(`Row ${index + 1}: CNIC must be exactly 13 digits`)
  if (!row.roll_number || !isValidRollNumber(String(row.roll_number)))
    errors.push(`Row ${index + 1}: Invalid roll number`)
  return errors
}
