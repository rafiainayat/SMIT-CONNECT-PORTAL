import PageHeader from '../../components/ui/PageHeader'

export default function AdminStudents() {
  return (
    <div>
      <PageHeader
        title="Student Management"
        subtitle="Manage all registered students"
        action={<button className="btn-primary text-sm py-2">Upload Students</button>}
      />
      <div className="card text-center py-12">
        <p className="text-gray-500">Student management page coming soon...</p>
      </div>
    </div>
  )
}
