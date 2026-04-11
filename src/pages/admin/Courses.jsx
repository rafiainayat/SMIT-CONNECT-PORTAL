import PageHeader from '../../components/ui/PageHeader'

export default function AdminCourses() {
  return (
    <div>
      <PageHeader
        title="Course Management"
        subtitle="Manage all courses"
        action={<button className="btn-primary text-sm py-2">Add Course</button>}
      />
      <div className="card text-center py-12">
        <p className="text-gray-500">Course management page coming soon...</p>
      </div>
    </div>
  )
}
