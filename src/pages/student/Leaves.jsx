import { useEffect, useState, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import toast from 'react-hot-toast'
import { selectProfile } from '../../features/auth/authSlice'
import { submitLeave, fetchMyLeaves } from '../../services/leaveService'
import { setMyLeaves, addLeave, selectMyLeaves } from '../../features/leaves/leavesSlice'
import { formatDate } from '../../utils/formatters'
import { LEAVE_STATUS } from '../../utils/constants'
import { PageHeader } from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

const MAX_MB = 5

export default function StudentLeaves() {
  const dispatch  = useDispatch()
  const profile   = useSelector(selectProfile)
  const leaves    = useSelector(selectMyLeaves)

  const [loading, setLoading]     = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [detail, setDetail]       = useState(null)
  const [submitting, setSubmit]   = useState(false)
  const [filterStatus, setFilter] = useState('all')
  const fileRef                   = useRef()

  const [form, setForm]   = useState({ reason:'', startDate:null, endDate:null, imageFile:null, imagePreview:null })
  const [errors, setErrs] = useState({})

  const load = useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)
    try { dispatch(setMyLeaves(await fetchMyLeaves(profile.id))) }
    catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }, [profile?.id, dispatch])

  useEffect(() => { load() }, [load])

  const handleImage = e => {
    const file = e.target.files[0]
    if (!file) return
    if (!['image/jpeg','image/png','image/jpg','image/webp'].includes(file.type)) { toast.error('Only JPG, PNG, WEBP allowed.'); return }
    if (file.size / (1024*1024) > MAX_MB) { toast.error(`Image must be under ${MAX_MB}MB.`); return }
    setForm(p => ({ ...p, imageFile: file, imagePreview: URL.createObjectURL(file) }))
    toast.success('Image attached! 📎')
  }

  const removeImage = () => {
    if (form.imagePreview) URL.revokeObjectURL(form.imagePreview)
    setForm(p => ({ ...p, imageFile: null, imagePreview: null }))
    if (fileRef.current) fileRef.current.value = ''
  }

  const resetForm = () => {
    if (form.imagePreview) URL.revokeObjectURL(form.imagePreview)
    setForm({ reason:'', startDate:null, endDate:null, imageFile:null, imagePreview:null })
    setErrs({})
    if (fileRef.current) fileRef.current.value = ''
  }

  const validate = () => {
    const e = {}
    if (!form.reason || form.reason.trim().length < 10) e.reason = 'Describe your reason (min 10 characters)'
    if (!form.startDate) e.startDate = 'Start date is required'
    if (!form.endDate)   e.endDate   = 'End date is required'
    if (form.startDate && form.endDate && form.endDate < form.startDate) e.endDate = 'End date must be after start date'
    setErrs(e); return !Object.keys(e).length
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate() || submitting) return
    setSubmit(true)
    const tid = toast.loading('Submitting leave request…')
    try {
      const newLeave = await submitLeave({
        userId: profile.id, reason: form.reason,
        startDate: form.startDate.toISOString().split('T')[0],
        endDate:   form.endDate.toISOString().split('T')[0],
        imageFile: form.imageFile,
      })
      dispatch(addLeave(newLeave))
      toast.success('Leave request submitted! 🎉', { id: tid })
      setModalOpen(false); resetForm()
    } catch (err) { toast.error(err.message, { id: tid }) }
    finally { setSubmit(false) }
  }

  const filtered = leaves.filter(l => filterStatus === 'all' || l.status === filterStatus)
  const counts   = {
    all:      leaves.length,
    pending:  leaves.filter(l=>l.status==='pending').length,
    approved: leaves.filter(l=>l.status==='approved').length,
    rejected: leaves.filter(l=>l.status==='rejected').length,
  }
  const daysCount = form.startDate && form.endDate && form.endDate >= form.startDate
    ? Math.ceil((form.endDate - form.startDate) / (1000*60*60*24)) + 1 : 0

  return (
    <div className="page-wrap">
      <PageHeader
        title="My Leave Requests"
        subtitle={`${leaves.length} total submitted`}
        action={
          <button onClick={() => setModalOpen(true)} className="btn-primary text-sm py-2">
            ➕ Request Leave
          </button>
        }
      />

      {/* Stats */}
      {leaves.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label:'Total',    count:counts.all,      bg:'bg-gray-50',    text:'text-gray-700',    border:'border-gray-200'   },
            { label:'Pending',  count:counts.pending,  bg:'bg-amber-50',   text:'text-amber-700',   border:'border-amber-200'  },
            { label:'Approved', count:counts.approved, bg:'bg-emerald-50', text:'text-emerald-700', border:'border-emerald-200'},
            { label:'Rejected', count:counts.rejected, bg:'bg-red-50',     text:'text-red-700',     border:'border-red-200'    },
          ].map(({ label, count, bg, text, border }) => (
            <div key={label} className={`${bg} border ${border} rounded-2xl p-4 text-center`}>
              <p className={`text-2xl font-extrabold ${text}`}>{count}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', ...Object.values(LEAVE_STATUS)].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all capitalize flex items-center gap-1.5
              ${filterStatus===s ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}>
            {s}
            {counts[s] > 0 && <span className={`text-xs ${filterStatus===s?'opacity-75':'text-gray-400'}`}>({counts[s]})</span>}
          </button>
        ))}
      </div>

      {/* Leaves list */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-gray-600 font-bold text-base">
            {filterStatus==='all' ? 'No leave requests yet.' : `No ${filterStatus} requests.`}
          </p>
          {filterStatus==='all' && (
            <button onClick={() => setModalOpen(true)} className="btn-primary text-sm mt-5">Submit your first leave →</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(leave => (
            <div key={leave.id} onClick={() => setDetail(leave)}
              className="card hover:shadow-card-md cursor-pointer group p-5 transition-all duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <StatusBadge status={leave.status} />
                    {leave.image_url && <span className="text-xs text-gray-400 font-semibold">📎 Attachment</span>}
                  </div>
                  <p className="text-sm font-bold text-gray-900 truncate">{leave.reason}</p>
                  <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4 mt-1.5 text-xs text-gray-400 font-semibold">
                    <span>📅 {formatDate(leave.start_date)} → {formatDate(leave.end_date)}</span>
                    <span className="hidden xs:inline">·</span>
                    <span>Submitted {formatDate(leave.created_at)}</span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-1"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); resetForm() }} title="Request Leave" size="md">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">Reason <span className="text-red-500">*</span></label>
            <textarea value={form.reason} rows={4} placeholder="Describe your reason in detail (min 10 characters)…"
              onChange={e => { setForm(p=>({...p,reason:e.target.value})); if(errors.reason) setErrs(p=>({...p,reason:''})) }}
              className={`input-base resize-none ${errors.reason?'input-error':''}`} />
            {errors.reason && <p className="text-xs text-red-600 font-semibold">⚠ {errors.reason}</p>}
            <p className="text-xs text-gray-400 text-right font-medium">{form.reason.length}/500</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700">Start Date <span className="text-red-500">*</span></label>
              <DatePicker selected={form.startDate} dateFormat="dd MMM yyyy" placeholderText="Select date" minDate={new Date()}
                onChange={d => { setForm(p=>({...p,startDate:d,endDate:p.endDate&&p.endDate<d?null:p.endDate})); setErrs(p=>({...p,startDate:''})) }}
                className={`input-base w-full ${errors.startDate?'input-error':''}`} wrapperClassName="w-full"
              />
              {errors.startDate && <p className="text-xs text-red-600 font-semibold">{errors.startDate}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700">End Date <span className="text-red-500">*</span></label>
              <DatePicker selected={form.endDate} dateFormat="dd MMM yyyy" placeholderText="Select date"
                minDate={form.startDate ?? new Date()} disabled={!form.startDate}
                onChange={d => { setForm(p=>({...p,endDate:d})); setErrs(p=>({...p,endDate:''})) }}
                className={`input-base w-full ${errors.endDate?'input-error':''}`} wrapperClassName="w-full"
              />
              {errors.endDate && <p className="text-xs text-red-600 font-semibold">{errors.endDate}</p>}
            </div>
          </div>

          {daysCount > 0 && (
            <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span>📅</span>
              <p className="text-sm font-bold text-primary-700">{daysCount} day{daysCount > 1 ? 's' : ''} of leave requested</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Supporting Document <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </label>
            {form.imagePreview ? (
              <div className="relative">
                <img src={form.imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
                <button type="button" onClick={removeImage}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md text-xs font-bold">
                  ✕
                </button>
                <p className="text-xs text-gray-400 font-medium mt-1.5">{form.imageFile?.name}</p>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all group">
                <span className="text-3xl mb-2">📷</span>
                <p className="text-sm font-bold text-gray-500 group-hover:text-primary-600">Click to upload image</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">PNG, JPG, WEBP · Max {MAX_MB}MB</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </label>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setModalOpen(false); resetForm() }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-[2]">
              {submitting ? <><Spinner size="sm" /> Submitting…</> : '📨 Submit Leave Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail modal */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Leave Details" size="md">
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <StatusBadge status={detail.status} />
              <span className="text-xs text-gray-400 font-semibold">Submitted {formatDate(detail.created_at)}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Reason</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 font-medium">{detail.reason}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['From', detail.start_date],['To', detail.end_date]].map(([label, date]) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-sm font-extrabold text-gray-800">{formatDate(date)}</p>
                </div>
              ))}
            </div>
            {detail.image_url && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Attachment</p>
                <a href={detail.image_url} target="_blank" rel="noopener noreferrer">
                  <img src={detail.image_url} alt="Leave attachment" className="w-full max-h-52 object-cover rounded-xl border border-gray-100 hover:opacity-90 transition-opacity" />
                  <p className="text-xs text-primary-600 font-bold mt-1.5">Open full size ↗</p>
                </a>
              </div>
            )}
            {detail.status !== 'pending' && (
              <div className={`rounded-xl p-4 text-center font-bold text-sm border
                ${detail.status==='approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                {detail.status==='approved' ? '✅ Your leave has been approved.' : '❌ Your leave request was rejected.'}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}