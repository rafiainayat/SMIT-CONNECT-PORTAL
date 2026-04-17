import { supabase } from './supabase'

export async function fetchOpenCourses() {
  const { data, error } = await supabase.from('courses').select('*').eq('status', 'open').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function fetchAllCoursesPublic() {
  const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function applyForCourse(userId, courseId) {
  const { data, error } = await supabase
    .from('applications').insert({ user_id: userId, course_id: courseId, status: 'pending' }).select().single()
  if (error) {
    if (error.code === '23505') throw new Error('You already applied for this course.')
    throw new Error(error.message)
  }
  return data
}

export async function fetchMyApplications(userId) {
  const { data, error } = await supabase
    .from('applications').select('*, courses(id,name,status)').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}