import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { fetchAllCourses, createCourse, updateCourse, deleteCourse } from '../../services/adminService'
import { setCourses, addCourse, editCourse, dropCourse, selectCourses, selectCoursesLoading } from '../../features/courses/coursesSlice'
import { formatDate } from '../../utils/formatters'
import { COURSE_STATUS } from '../../utils/constants'
import { PageHeader, SearchInput } from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import FormInput from '../../components/ui/FormInput'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

const EMPTY = { name: '', status: COURSE_STATUS.OPEN }

export default function AdminCourses() {
  const dispatch = useDispatch()
  const courses  = useSelector(selectCourses)
  const loading  = useSelector(selectCoursesLoading)

  const [search, setSearch]           = useState('')
  const [modalOpen, setModalOpen]     = useState(false)
  const [editTarget, setEditTarget]   = useState(null)
  const [form, setForm]               = useState(EMPTY)
  const [errors, setErrors]           = useState({})
  const [saving, setSaving]           = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]       = useState(false)

  useEffect(() => {
    fetchAllCourses()
      .then(data => dispatch(setCourses(data)))
      .catch(err => toast.error(err.message))
  }, [dispatch])

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setErrors({}); setModalOpen(true) }
  const openEdit   = c  => { setEditTarget(c); setForm({ name: c.name, status: c.status }); setErrors({}); setModalOpen(true) }

  const validate = () => {
    const e = {}
    if (!form.name || form.name.trim().length < 2) e.name = 'Course name must be at least 2 characters'
    setErrors(e); return !Object.keys(e).length
  }

  const handleSave = async e => {
    e.preventDefault()
    if (!validate() || saving) return
    setSaving(true)
    const tid = toast.loading(editTarget ? 'Updating course…' : 'Creating course…')
    try {
      if (editTarget) {
        const updated = await updateCourse(editTarget.id, form)
        dispatch(editCourse(updated))
        toast.success(`"${updated.name}" updated! ✅`, { id: tid })
      } else {
        const created = await createCourse(form)
        dispatch(addCourse(created))
        toast.success(`"${created.name}" created! 🎉`, { id: tid })
      }
      setModalOpen(false)
    } catch (err) { toast.error(err.message, { id: tid }) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const tid = toast.loading('Deleting course…')
    try {
      await deleteCourse(deleteTarget.id)
      dispatch(dropCourse(deleteTarget.id))
      toast.success(`"${deleteTarget.name}" deleted.`, { id: tid })
      setDeleteTarget(null)
    } catch { toast.error('Cannot delete — students may have active applications.', { id: tid }) }
    finally { setDeleting(false) }
  }

  const filtered = courses.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()))

  const columns = [
    { key: 'name', label: 'Course Name', render: name => <span className="font-bold text-gray-900 text-sm">{name}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'created_at', label: 'Created', render: v => <span className="text-xs text-gray-400">{formatDate(v)}</span>, className: 'hidden sm:table-cell' },
    {
      key: 'actions', label: '', className: 'text-right w-24',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => openEdit(row)} className="p-2 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all text-base">✏️</button>
          <button onClick={() => setDeleteTarget(row)} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all text-base">🗑️</button>
        </div>
      ),
    },
  ]

  return (
    <div className="page-wrap">
      <PageHeader
        title="Courses"
        subtitle={`${courses.length} courses in the system`}
        action={<button onClick={openCreate} className="btn-primary text-sm py-2">➕ Add Course</button>}
      />

      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search courses…" className="w-full max-w-xs" />
          <span className="text-xs font-bold text-gray-400 flex-shrink-0">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading}
          emptyMessage="No courses yet. Click 'Add Course' to create one." />
      </div>

      {/* Create/Edit modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Course' : 'Add New Course'} size="sm">
        <form onSubmit={handleSave} className="space-y-5">
          <FormInput id="cname" label="Course Name" placeholder="e.g. Web & Mobile App Development"
            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} error={errors.name} required />

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Status <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(COURSE_STATUS).map(s => (
                <label key={s} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all
                  ${form.status === s ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="status" value={s} checked={form.status === s}
                    onChange={() => setForm(p => ({ ...p, status: s }))} className="text-primary-600" />
                  <StatusBadge status={s} />
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-[2]">
              {saving ? <><Spinner size="sm" /> Saving…</> : editTarget ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Course" size="sm">
        {deleteTarget && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
              <div className="text-4xl mb-3">🗑️</div>
              <p className="font-bold text-gray-900 text-sm">Delete <span className="text-red-600">"{deleteTarget.name}"</span>?</p>
              <p className="text-xs text-gray-500 mt-1.5 font-medium">All student applications for this course will be removed.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1">
                {deleting ? <><Spinner size="sm" /> Deleting…</> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}