const CFG = {
  open:     { label: 'Open',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  closed:   { label: 'Closed',   cls: 'bg-gray-100   text-gray-600   border-gray-200',    dot: 'bg-gray-400'   },
  pending:  { label: 'Pending',  cls: 'bg-amber-50   text-amber-700  border-amber-200',   dot: 'bg-amber-500'  },
  approved: { label: 'Approved', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', cls: 'bg-red-50     text-red-700    border-red-200',     dot: 'bg-red-500'    },
  admin:    { label: 'Admin',    cls: 'bg-purple-50  text-purple-700 border-purple-200',  dot: 'bg-purple-500' },
  student:  { label: 'Student',  cls: 'bg-blue-50    text-blue-700   border-blue-200',    dot: 'bg-blue-500'   },
}

export default function StatusBadge({ status, className = '' }) {
  const key = status?.toLowerCase()
  const { label, cls, dot } = CFG[key] ?? { label: status, cls: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cls} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  )
}