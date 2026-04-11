/**
 * Course Service
 * 
 * RESPONSIBILITY: All course-related database operations
 * - Fetch courses
 * - Apply for courses
 * - Manage applications
 */

import { supabase } from './supabase'

/**
 * Fetch all open courses (for student listing)
 */
export const fetchOpenCourses = async () => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch courses')
  }
}

/**
 * Fetch ALL courses (admin view)
 */
export const fetchAllCourses = async () => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch courses')
  }
}

/**
 * Fetch specific course
 */
export const fetchCourseById = async (courseId) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch course')
  }
}

/**
 * Apply for a course
 * 
 * PROCESS:
 * 1. Check if already applied
 * 2. Check if course is open
 * 3. Create application record
 */
export const applyForCourse = async (userId, courseId) => {
  try {
    // Check if already applied
    const { data: existingApp, error: checkError } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle()

    if (checkError) throw checkError

    if (existingApp) {
      throw new Error('You have already applied for this course')
    }

    // Check if course is open
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('status')
      .eq('id', courseId)
      .single()

    if (courseError) throw courseError
    if (course.status !== 'open') {
      throw new Error('This course is not accepting applications')
    }

    // Create application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert([
        {
          user_id: userId,
          course_id: courseId,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (appError) throw appError

    return application
  } catch (error) {
    throw new Error(error.message || 'Failed to apply for course')
  }
}

/**
 * Fetch user's applications
 */
export const fetchMyApplications = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        id,
        user_id,
        course_id,
        status,
        created_at,
        courses (id, name, status)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch applications')
  }
}

/**
 * Fetch all applications (admin view)
 */
export const fetchAllApplications = async (filters = {}) => {
  try {
    let query = supabase
      .from('applications')
      .select(`
        id,
        user_id,
        course_id,
        status,
        created_at,
        users (id, name, cnic, roll_number),
        courses (id, name)
      `)

    if (filters.courseId) {
      query = query.eq('course_id', filters.courseId)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch applications')
  }
}

/**
 * Approve/Reject application
 */
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    throw new Error(error.message || 'Failed to update application status')
  }
}

/**
 * Create new course (admin only)
 */
export const createCourse = async (name, status = 'open') => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert([{ name, status }])
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    throw new Error(error.message || 'Failed to create course')
  }
}

/**
 * Update course (admin only)
 */
export const updateCourse = async (courseId, updates) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    throw new Error(error.message || 'Failed to update course')
  }
}

/**
 * Delete course (admin only)
 */
export const deleteCourse = async (courseId) => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    throw new Error(error.message || 'Failed to delete course')
  }
}
