import Spinner from './Spinner'

export default function DataTable({ columns, data, loading, emptyMessage = 'No records found.' }) {
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Spinner size="lg" /><p className="text-sm text-gray-400 font-medium">Loading…</p>
    </div>
  )
  if (!data?.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="text-5xl mb-3">📭</div>
      <p className="text-sm font-semibold text-gray-500">{emptyMessage}</p>
    </div>
  )
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            {columns.map(col => (
              <th key={col.key} className={`text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest ${col.className ?? ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, i) => (
            <tr key={row.id ?? i} className="hover:bg-blue-50/30 transition-colors">
              {columns.map(col => (
                <td key={col.key} className={`px-4 py-4 text-gray-700 ${col.className ?? ''}`}>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}