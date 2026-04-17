import { supabase } from './supabase'

export async function fetchDashboardStats() {
  const [a, b, c, d] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('leaves').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
  ])
  return { totalStudents: a.count ?? 0, totalCourses: b.count ?? 0, pendingLeaves: c.count ?? 0, totalApplications: d.count ?? 0 }
}

export async function fetchAllStudents() {
  const { data, error } = await supabase.from('users').select('*').eq('role', 'student').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function bulkInsertStudents(students) {
  const { data, error } = await supabase.from('users').upsert(students, { onConflict: 'cnic', ignoreDuplicates: true }).select()
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function deleteStudent(id) {
  const { error } = await supabase.from('users').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function fetchAllCourses() {
  const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createCourse({ name, status }) {
  const { data, error } = await supabase.from('courses').insert({ name: name.trim(), status }).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateCourse(id, { name, status }) {
  const { data, error } = await supabase.from('courses').update({ name: name.trim(), status }).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteCourse(id) {
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function fetchAllLeaves() {
  const { data, error } = await supabase
    .from('leaves').select('*, users(id,name,roll_number,cnic)').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function updateLeaveStatus(id, status) {
  const { data, error } = await supabase.from('leaves').update({ status }).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}