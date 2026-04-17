import { useEffect, useState, useCallback, useRef } from 'react'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'
import { fetchAllStudents, bulkInsertStudents, deleteStudent } from '../../services/adminService'
import { parseStudentExcel } from '../../utils/xlsxParser'
import { formatDate } from '../../utils/formatters'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import { PageHeader, SearchInput } from '../../components/ui/PageHeader'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

export default function AdminStudents() {
  const [students, setStudents]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [uploading, setUploading]     = useState(false)
  const [preview, setPreview]         = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [dragOver, setDragOver]       = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]       = useState(false)
  const fileRef = useRef()

  const load = useCallback(async () => {
    setLoading(true)
    try { setStudents(await fetchAllStudents()) }
    catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleFile = async file => {
    if (!file) return
    if (!file.name.match(/\.(xlsx|xls)$/)) { toast.error('Upload a valid .xlsx or .xls file.'); return }
    setUploading(true)
    const tid = toast.loading('Parsing Excel file…')
    try {
      const result = await parseStudentExcel(file)
      setPreview(result)
      setPreviewOpen(true)
      toast.success(`Parsed ${result.valid.length} valid rows!`, { id: tid })
    } catch (err) { toast.error(err.message, { id: tid }) }
    finally { setUploading(false) }
  }

  const handleConfirmUpload = async () => {
    if (!preview?.valid?.length) return
    setUploading(true)
    const tid = toast.loading(`Uploading ${preview.valid.length} students…`)
    try {
      await bulkInsertStudents(preview.valid)
      toast.success(`${preview.valid.length} students uploaded! 🎉`, { id: tid })
      setPreviewOpen(false); setPreview(null); load()
    } catch (err) { toast.error(err.message, { id: tid }) }
    finally { setUploading(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const tid = toast.loading(`Removing ${deleteTarget.name}…`)
    try {
      await deleteStudent(deleteTarget.id)
      setStudents(p => p.filter(s => s.id !== deleteTarget.id))
      toast.success(`${deleteTarget.name} removed.`, { id: tid })
      setDeleteTarget(null)
    } catch (err) { toast.error(err.message, { id: tid }) }
    finally { setDeleting(false) }
  }

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([
      ['name', 'cnic', 'roll_number'],
      ['Muhammad Ali',   '1234567890123', 'SMIT-001'],
      ['Fatima Zahra',   '9876543210987', 'SMIT-002'],
    ])
    XLSX.utils.book_append_sheet(wb, ws, 'Students')
    XLSX.writeFile(wb, 'smit_template.xlsx')
    toast.success('Template downloaded!')
  }

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
    s.cnic?.includes(search)
  )

  const columns = [
    {
      key: 'name', label: 'Student',
      render: (name, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{name}</p>
            <p className="text-xs text-gray-400">{row.email || 'No login yet'}</p>
          </div>
        </div>
      ),
    },
    { key: 'roll_number', label: 'Roll No.' },
    { key: 'cnic', label: 'CNIC', render: v => <span className="font-mono text-xs">{v}</span> },
    {
      key: 'email', label: 'Status',
      render: email => email ? <StatusBadge status="approved" /> : <StatusBadge status="pending" />,
    },
    {
      key: 'created_at', label: 'Added',
      render: v => <span className="text-xs text-gray-400">{formatDate(v)}</span>,
      className: 'hidden md:table-cell',
    },
    {
      key: 'actions', label: '', className: 'text-right w-12',
      render: (_, row) => (
        <button onClick={() => setDeleteTarget(row)}
          className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
          🗑️
        </button>
      ),
    },
  ]

  return (
    <div className="page-wrap">
      <PageHeader
        title="Students"
        subtitle={`${students.length} students registered`}
        action={
          <div className="flex gap-2 flex-wrap">
            <button onClick={downloadTemplate} className="btn-secondary text-sm py-2">📥 Template</button>
            <label className={`btn-primary text-sm py-2 cursor-pointer ${uploading ? 'opacity-70 pointer-events-none' : ''}`}>
              {uploading ? <><Spinner size="sm" /> Parsing…</> : '⬆️ Upload Excel'}
              <input type="file" accept=".xlsx,.xls" className="hidden" ref={fileRef}
                onChange={e => handleFile(e.target.files[0])} />
            </label>
          </div>
        }
      />

      {/* Drag-drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center mb-6 cursor-pointer transition-all duration-200
          ${dragOver ? 'border-primary-400 bg-primary-50 scale-[1.01]' : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-gray-50/50'}`}>
        <div className="text-3xl mb-3">📂</div>
        <p className="text-sm font-bold text-gray-700">{dragOver ? 'Drop it here!' : 'Drag & drop Excel, or click to browse'}</p>
        <p className="text-xs text-gray-400 mt-1 font-medium">.xlsx or .xls · Max 500 rows · Columns: name, cnic, roll_number</p>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, CNIC or roll no…" className="w-full sm:w-80" />
          <span className="text-xs font-bold text-gray-400 flex-shrink-0">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading}
          emptyMessage={search ? 'No students match.' : 'No students yet. Upload an Excel file.'} />
      </div>

      {/* Preview modal */}
      <Modal isOpen={previewOpen} onClose={() => { setPreviewOpen(false); setPreview(null) }} title="Review Upload" size="lg">
        {preview && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                <p className="text-3xl font-extrabold text-emerald-700">{preview.valid.length}</p>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">Valid Records</p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                <p className="text-3xl font-extrabold text-red-600">{preview.errors.length}</p>
                <p className="text-xs font-bold text-red-500 uppercase tracking-widest mt-1">Errors Found</p>
              </div>
            </div>

            {preview.errors.length > 0 && (
              <div>
                <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">Errors — these rows will be skipped</p>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1">
                  {preview.errors.map((e, i) => <p key={i} className="text-xs text-red-700 font-medium">• {e}</p>)}
                </div>
              </div>
            )}

            {preview.valid.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Preview — first 5 rows</p>
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>{['Name','CNIC','Roll Number'].map(h => <th key={h} className="text-left px-3 py-2.5 font-bold text-gray-500">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {preview.valid.slice(0, 5).map((r, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2.5 font-medium">{r.name}</td>
                          <td className="px-3 py-2.5 font-mono">{r.cnic}</td>
                          <td className="px-3 py-2.5">{r.roll_number}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.valid.length > 5 && <p className="text-xs text-gray-400 mt-2 font-medium">+ {preview.valid.length - 5} more rows</p>}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={() => { setPreviewOpen(false); setPreview(null) }} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleConfirmUpload} disabled={uploading || !preview.valid.length} className="btn-primary flex-[2]">
                {uploading ? <><Spinner size="sm" /> Uploading…</> : `Upload ${preview.valid.length} Students 🚀`}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Student" size="sm">
        {deleteTarget && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="font-bold text-gray-900">Remove <span className="text-red-600">{deleteTarget.name}</span>?</p>
              <p className="text-xs text-gray-500 mt-1.5 font-medium">This deletes all their applications and leaves permanently.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1">
                {deleting ? <><Spinner size="sm" /> Removing…</> : 'Yes, Remove'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}