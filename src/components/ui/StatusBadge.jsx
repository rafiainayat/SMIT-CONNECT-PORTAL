/**
 * Status Badge Component
 * 
 * USAGE: Display status of entities (applications, leaves, courses)
 * STATUSES: pending, approved, rejected, open, closed, withdrawn
 */

import { STATUS_BADGE_STYLES } from '../../utils/constants'
import { capitalize } from '../../utils/formatters'

export default function StatusBadge({ status, className = '' }) {
  if (!status) return null

  const styles = STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.pending

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
        border ${styles.bg} ${styles.text} ${styles.border} ${className}
      `}
    >
      {/* Status indicator dot */}
      <span className={`w-2 h-2 rounded-full ${
        status === 'pending' ? 'bg-amber-600' :
        status === 'approved' || status === 'open' ? 'bg-green-600' :
        status === 'rejected' || status === 'closed' ? 'bg-red-600' :
        'bg-gray-600'
      }`} />
      {capitalize(status)}
    </span>
  )
}
