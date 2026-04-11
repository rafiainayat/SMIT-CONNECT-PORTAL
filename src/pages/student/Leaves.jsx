import { useEffect, useState, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import toast from 'react-hot-toast'
import { selectProfile } from '../../features/auth/authSlice'
import { submitLeave, fetchMyLeaves } from '../../services/leaveService'
import { setMyLeaves, addLeave, selectMyLeaves, selectLeavesLoading } from '../../features/leaves/leavesSlice'
import { formatDate } from '../../utils/formatters'
import { LEAVE_STATUS } from '../../utils/constants'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

const MAX_FILE_SIZE_MB = 5

export default function StudentLeaves() {
  const dispatch = useDispatch()
  const profile  = useSelector(selectProfile)
  const leaves   = useSelector(selectMyLeaves)
  const loading  = useSelector(selectLeavesLoading)

  const [modalOpen, setModalOpen]       = useState(false)
  const [detailLeave, setDetailLeave]   = useState(null)
  const [submitting, setSubmitting]     = useState(false)
  const [filterStatus, setFilter]       = useState('all')
  const fileInputRef                    = useRef(null)

  const [form, setForm]     = useState({
    reason: '',
    startDate: null,
    endDate: null,
    imageFile: null,
    imagePreview: null,
  })
  const [errors, setErrors] = useState({})

  const loadLeaves = useCallback(async () => {
    if (!profile?.id) return
    try {
      const data = await fetchMyLeaves(profile.id)
      dispatch(setMyLeaves(data))
    } catch (err) {
      toast.error(err.message)
    }
  }, [profile?.id, dispatch])

  useEffect(() => { loadLeaves() }, [loadLeaves])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, or WEBP images are allowed.')
      return
    }

    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > MAX_FILE_SIZE_MB) {
      toast.error(`Image must be under ${MAX_FILE_SIZE_MB}MB.`)
      return
    }

    const preview = URL.createObjectURL(file)
    setForm(p => ({ ...p, imageFile: file, imagePreview: preview }))
  }

  const removeImage = () => {
    if (form.imagePreview) URL.revokeObjectURL(form.imagePreview)
    setForm(p => ({ ...p, imageFile: null, imagePreview: null }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const resetForm = () => {
    if (form.imagePreview) URL.revokeObjectURL(form.imagePreview)
    setForm({ reason: '', startDate: null, endDate: null, imageFile: null, imagePreview: null })
    setErrors({})
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validate = () => {
    const e = {}
    if (!form.reason || form.reason.trim().length < 10)
      e.reason = 'Please describe your reason (min 10 characters)'
    if (!form.startDate) e.startDate = 'Start date is required'
    if (!form.endDate)   e.endDate   = 'End date is required'
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.endDate = 'End date must be after start date'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || submitting) return

    setSubmitting(true)
    try {
      const newLeave = await submitLeave({
        userId:    profile.id,
        reason:    form.reason,
        startDate: form.startDate.toISOString().split('T')[0],
        endDate:   form.endDate.toISOString().split('T')[0],
        imageFile: form.imageFile,
      })

      dispatch(addLeave(newLeave))
      toast.success('Leave request submitted successfully!')
      setModalOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = leaves.filter(l =>
    filterStatus === 'all' || l.status === filterStatus
  )

  const counts = {
    all:      leaves.length,
    pending:  leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  }

  return (
    <div className="page-container">
      <PageHeader
        title="My Leave Requests"
        subtitle={`${leaves.length} total submitted`}
        action={
          <button onClick={() => setModalOpen(true)} className="btn-primary text-sm py-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Request Leave
          </button>
        }
      />

      {/* Stats row */}
      {leaves.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total',    count: counts.all,      color: 'text-gray-700',   bg: 'bg-gray-50'   },
            { label: 'Pending',  count: counts.pending,  color: 'text-amber-700',  bg: 'bg-amber-50'  },
            { label: 'Approved', count: counts.approved, color: 'text-green-700',  bg: 'bg-green-50'  },
            { label: 'Rejected', count: counts.rejected, color: 'text-red-700',    bg: 'bg-red-50'    },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${color}`}>{count}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', ...Object.values(LEAVE_STATUS)].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`
              px-4 py-1.5 rounded-xl text-sm font-medium transition-all capitalize
              ${filterStatus === s
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }
            `}
          >
            {s}
            {s !== 'all' && counts[s] > 0 && (
              <span className={`ml-1.5 text-xs ${filterStatus === s ? 'opacity-80' : 'text-gray-400'}`}>
                ({counts[s]})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Leaves list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">
            {filterStatus === 'all' ? 'No leave requests yet.' : `No ${filterStatus} requests.`}
          </p>
          {filterStatus === 'all' && (
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary text-sm mt-4"
            >
              Submit your first leave
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(leave => (
            <div
              key={leave.id}
              className="card hover:shadow-card-hover cursor-pointer transition-all duration-200 group"
              onClick={() => setDetailLeave(leave)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <StatusBadge status={leave.status} />
                    {leave.image_url && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        Attachment
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-gray-900 truncate">{leave.reason}</p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
                    </span>
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

      {/* ── Submit Leave Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetForm() }}
        title="Request Leave"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.reason}
              onChange={e => {
                setForm(p => ({ ...p, reason: e.target.value }))
                if (errors.reason) setErrors(p => ({ ...p, reason: '' }))
              }}
              rows={4}
              placeholder="Describe your reason for leave in detail…"
              className={`input-base resize-none ${errors.reason ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            {errors.reason && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.reason}
              </p>
            )}
            <p className="text-xs text-gray-400 text-right">{form.reason.length}/500</p>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={form.startDate}
                onChange={date => {
                  setForm(p => ({ ...p, startDate: date, endDate: p.endDate && p.endDate < date ? null : p.endDate }))
                  if (errors.startDate) setErrors(p => ({ ...p, startDate: '' }))
                }}
                minDate={new Date()}
                dateFormat="dd MMM yyyy"
                placeholderText="Select date"
                className={`input-base w-full ${errors.startDate ? 'border-red-400' : ''}`}
                wrapperClassName="w-full"
              />
              {errors.startDate && <p className="text-xs text-red-600">{errors.startDate}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                End Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={form.endDate}
                onChange={date => {
                  setForm(p => ({ ...p, endDate: date }))
                  if (errors.endDate) setErrors(p => ({ ...p, endDate: '' }))
                }}
                minDate={form.startDate ?? new Date()}
                dateFormat="dd MMM yyyy"
                placeholderText="Select date"
                className={`input-base w-full ${errors.endDate ? 'border-red-400' : ''}`}
                wrapperClassName="w-full"
                disabled={!form.startDate}
              />
              {errors.endDate && <p className="text-xs text-red-600">{errors.endDate}</p>}
            </div>
          </div>

          {/* Duration display */}
          {form.startDate && form.endDate && form.endDate >= form.startDate && (
            <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-primary-700 font-medium">
                {Math.ceil((form.endDate - form.startDate) / (1000 * 60 * 60 * 24)) + 1} day(s) leave
              </p>
            </div>
          )}

          {/* Image upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Supporting Document <span className="text-gray-400 font-normal">(optional)</span>
            </label>

            {form.imagePreview ? (
              <div className="relative">
                <img
                  src={form.imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <p className="text-xs text-gray-400 mt-1.5">{form.imageFile?.name}</p>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all group">
                <div className="flex flex-col items-center gap-1.5">
                  <svg className="w-7 h-7 text-gray-300 group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500 group-hover:text-primary-600">
                    Click to upload image
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG, WEBP · Max {MAX_FILE_SIZE_MB}MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setModalOpen(false); resetForm() }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-[2]"
            >
              {submitting ? (
                <><Spinner size="sm" /> Submitting…</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Leave Detail Modal ── */}
      <Modal
        isOpen={!!detailLeave}
        onClose={() => setDetailLeave(null)}
        title="Leave Details"
        size="md"
      >
        {detailLeave && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <StatusBadge status={detailLeave.status} />
              <span className="text-xs text-gray-400">
                Submitted {formatDate(detailLeave.created_at)}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Reason</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">
                {detailLeave.reason}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1 font-medium">From</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(detailLeave.start_date)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1 font-medium">To</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(detailLeave.end_date)}</p>
              </div>
            </div>

            {detailLeave.image_url && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Attachment</p>
                <a href={detailLeave.image_url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={detailLeave.image_url}
                    alt="Leave attachment"
                    className="w-full max-h-52 object-cover rounded-xl border border-gray-100 hover:opacity-90 transition-opacity"
                  />
                  <p className="text-xs text-primary-600 mt-1.5">Open full size ↗</p>
                </a>
              </div>
            )}

            {/* Status message */}
            {detailLeave.status !== 'pending' && (
              <div className={`rounded-xl p-3 text-sm text-center font-medium ${
                detailLeave.status === 'approved'
                  ? 'bg-green-50 text-green-700 border border-green-100'
                  : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {detailLeave.status === 'approved'
                  ? '✓ Your leave has been approved by admin.'
                  : '✕ Your leave request was rejected by admin.'
                }
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
