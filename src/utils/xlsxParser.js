import * as XLSX from 'xlsx'
import { validateStudentRow } from './validators'

export function parseStudentExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const wb    = XLSX.read(new Uint8Array(e.target.result), { type: 'array' })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        if (!sheet) return reject(new Error('Excel has no sheets.'))
        const rows = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: '' })
        if (!rows.length)  return reject(new Error('Sheet is empty.'))
        if (rows.length > 500) return reject(new Error('Max 500 rows per upload.'))
        const norm = rows.map(row => {
          const out = {}
          Object.keys(row).forEach(k => {
            out[k.trim().toLowerCase().replace(/\s+/g, '_')] = String(row[k]).trim()
          })
          return out
        })
        const missing = ['name', 'cnic', 'roll_number'].filter(c => !(c in (norm[0] || {})))
        if (missing.length) return reject(new Error(`Missing columns: ${missing.join(', ')}`))
        const valid = [], errors = []
        norm.forEach((row, i) => {
          const errs = validateStudentRow(row, i)
          if (errs.length) errors.push(...errs)
          else valid.push({ name: row.name, cnic: row.cnic, roll_number: row.roll_number, role: 'student' })
        })
        const cnics = valid.map(r => r.cnic)
        const dupes = cnics.filter((c, i) => cnics.indexOf(c) !== i)
        if (dupes.length) errors.push(`Duplicate CNICs: ${[...new Set(dupes)].join(', ')}`)
        resolve({ valid, errors })
      } catch { reject(new Error('Failed to parse. Upload a valid .xlsx file.')) }
    }
    reader.onerror = () => reject(new Error('Could not read the file.'))
    reader.readAsArrayBuffer(file)
  })
}