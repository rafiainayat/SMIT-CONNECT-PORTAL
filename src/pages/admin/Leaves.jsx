import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { fetchAllLeaves, updateLeaveStatus } from '../../services/adminService'
import { setAllLeaves, patchLeaveStatus, selectAllLeaves } from '../../features/leaves/leavesSlice'
import { formatDate } from '../../utils/formatters'
import { LEAVE_STATUS } from '../../utils/constants'
import { PageHeader, SearchInput } from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

export default function AdminLeaves() {
  const dispatch  = useDispatch()
  const leaves    = useSelector(selectAllLeaves)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')
  const [selected, setSelected]   = useState(null)
  const [acting, setActing]       = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { dispatch(setAllLeaves(await fetchAllLeaves())) }
    catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }, [dispatch])

  useEffect(() => { load() }, [load])

  const handleAction = async (id, status) => {
    setActing(true)
    const tid = toast.loading(`${status === 'approved' ? 'Approving' : 'Rejecting'} leave…`)
    try {
      await updateLeaveStatus(id, status)
      dispatch(patchLeaveStatus({ id, status }))
      toast.success(`Leave ${status === 'approved' ? 'approved ✅' : 'rejected ❌'}!`, { id: tid })
      setSelected(null)
    } catch (err) { toast.error(err.message, { id: tid }) }
    finally { setActing(false) }
  }

  const filtered = leaves.filter(l => {
    const matchSearch =
      l.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.users?.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
      l.reason?.toLowerCase().includes(search.toLowerCase())
    return matchSearch && (filter === 'all' || l.status === filter)
  })

  const pendingCount = leaves.filter(l => l.status === 'pending').length
  const counts = { all: leaves.length, pending: leaves.filter(l=>l.status==='pending').length, approved: leaves.filter(l=>l.status==='approved').length, rejected: leaves.filter(l=>l.status==='rejected').length }

  const columns = [
    {
      key: 'users', label: 'Student',
      render: user => (
        <div>
          <p className="font-bold text-gray-900 text-sm">{user?.name ?? '—'}</p>
          <p className="text-xs text-gray-400 font-medium">{user?.roll_number}</p>
        </div>
      ),
    },
    { key: 'reason', label: 'Reason', render: v => <span className="text-sm text-gray-600 font-medium line-clamp-1 max-w-[180px] block">{v}</span> },
    {
      key: 'start_date', label: 'Duration', className: 'hidden md:table-cell',
      render: (v, row) => <span className="text-xs text-gray-500 font-medium">{formatDate(v)} → {formatDate(row.end_date)}</span>,
    },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    {
      key: 'actions', label: '', className: 'text-right w-20',
      render: (_, row) => (
        <button onClick={() => setSelected(row)}
          className="text-xs font-bold text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-xl hover:bg-primary-50 transition-all">
          Review →
        </button>
      ),
    },
  ]

  return (
    <div className="page-wrap">
      <PageHeader
        title="Leave Requests"
        subtitle={pendingCount > 0 ? `${pendingCount} pending request${pendingCount > 1 ? 's' : ''} need attention` : 'All caught up! ✅'}
      />

      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-3 mb-6">
          <span className="text-2xl">⏳</span>
          <div>
            <p className="font-bold text-amber-800 text-sm">{pendingCount} leave request{pendingCount > 1 ? 's' : ''} awaiting review</p>
            <p className="text-xs text-amber-600 font-medium mt-0.5">Approve or reject from the table below.</p>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, roll no. or reason…" className="w-full sm:w-72" />
          <div className="flex gap-2 flex-wrap">
            {['all', ...Object.values(LEAVE_STATUS)].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize flex items-center gap-1.5
                  ${filter === s ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s} <span className={`text-[10px] ${filter===s?'opacity-80':'text-gray-400'}`}>({counts[s]??0})</span>
              </button>
            ))}
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No leave requests match your filter." />
      </div>

      {/* Review modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Review Leave Request" size="md">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                  {selected.users?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selected.users?.name}</p>
                  <p className="text-xs text-gray-400 font-medium">{selected.users?.roll_number} · {selected.users?.cnic}</p>
                </div>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Reason</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 font-medium">{selected.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[['From', selected.start_date], ['To', selected.end_date]].map(([label, date]) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-sm font-bold text-gray-800">{formatDate(date)}</p>
                </div>
              ))}
            </div>

            {selected.start_date && selected.end_date && (
              <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-center">
                <p className="text-sm font-bold text-primary-700">
                  📅 {Math.ceil((new Date(selected.end_date) - new Date(selected.start_date)) / (1000*60*60*24)) + 1} day(s) of leave
                </p>
              </div>
            )}

            {selected.image_url && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Attachment</p>
                <a href={selected.image_url} target="_blank" rel="noopener noreferrer">
                  <img src={selected.image_url} alt="Leave attachment" className="w-full max-h-52 object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-opacity" />
                  <p className="text-xs text-primary-600 font-bold mt-1.5">Open full size ↗</p>
                </a>
              </div>
            )}

            {selected.status === LEAVE_STATUS.PENDING ? (
              <div className="flex gap-3 pt-1">
                <button onClick={() => handleAction(selected.id, LEAVE_STATUS.REJECTED)} disabled={acting} className="btn-danger flex-1">
                  {acting ? <Spinner size="sm" /> : '❌ Reject'}
                </button>
                <button onClick={() => handleAction(selected.id, LEAVE_STATUS.APPROVED)} disabled={acting} className="btn-primary flex-[2]">
                  {acting ? <Spinner size="sm" /> : '✅ Approve Leave'}
                </button>
              </div>
            ) : (
              <div className={`rounded-xl p-4 text-center font-bold text-sm border
                ${selected.status==='approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                {selected.status==='approved' ? '✅ This leave was approved.' : '❌ This leave was rejected.'}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}