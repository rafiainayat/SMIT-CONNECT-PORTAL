/**
 * Admin Service
 * 
 * RESPONSIBILITY: Admin-only operations
 * - Student management
 * - Dashboard statistics
 * - Bulk operations
 */

import { supabase } from './supabase'

/**
 * Upload students from Excel
 * 
 * FORMAT: Array of { name, email, cnic, roll_number }
 */
export const uploadStudents = async (studentsData) => {
  try {
    if (!Array.isArray(studentsData) || studentsData.length === 0) {
      throw new Error('No valid student data to upload')
    }

    // Prepare data with default role
    const toInsert = studentsData.map(student => ({
      ...student,
      role: 'student',
      email: student.email?.toLowerCase().trim(),
      cnic: student.cnic?.trim(),
      roll_number: student.roll_number?.toUpperCase().trim(),
    }))

    // Batch insert
    const { data, error } = await supabase
      .from('users')
      .insert(toInsert)
      .select()

    if (error) {
      // Parse error for duplicates, validation issues
      if (error.message.includes('duplicate')) {
        throw new Error('Some students already exist in the system')
      }
      throw error
    }

    return {
      success: true,
      count: data.length,
      data,
    }
  } catch (error) {
    throw new Error(error.message || 'Failed to upload students')
  }
}

/**
 * Fetch all students
 */
export const fetchAllStudents = async (filters = {}) => {
  try {
    let query = supabase
      .from('users')
      .select('*')
      .eq('role', 'student')

    if (filters.searchTerm) {
      query = query.or(`name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%,cnic.ilike.%${filters.searchTerm}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch students')
  }
}

/**
 * Fetch specific student
 */
export const fetchStudentById = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', studentId)
      .eq('role', 'student')
      .single()

    if (error) throw error

    return data
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch student')
  }
}

/**
 * Update student
 */
export const updateStudent = async (studentId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', studentId)
      .eq('role', 'student')
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    throw new Error(error.message || 'Failed to update student')
  }
}

/**
 * Delete student
 */
export const deleteStudent = async (studentId) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', studentId)
      .eq('role', 'student')

    if (error) throw error

    return { success: true }
  } catch (error) {
    throw new Error(error.message || 'Failed to delete student')
  }
}

/**
 * Fetch dashboard statistics
 */
export const fetchDashboardStats = async () => {
  try {
    // Total students
    const { count: totalStudents } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'student')

    // Total courses
    const { count: totalCourses } = await supabase
      .from('courses')
      .select('id', { count: 'exact', head: true })

    // Pending leaves
    const { count: pendingLeaves } = await supabase
      .from('leaves')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Total applications
    const { count: totalApplications } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })

    return {
      totalStudents: totalStudents || 0,
      totalCourses: totalCourses || 0,
      pendingLeaves: pendingLeaves || 0,
      totalApplications: totalApplications || 0,
    }
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch dashboard stats')
  }
}

/**
 * Create new admin
 */
export const createAdmin = async (email, password, name) => {
  try {
    // Create auth user
    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signupError) throw signupError
    if (!authData.user) throw new Error('Failed to create admin')

    // Create admin record
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          name,
          email,
          role: 'admin',
        },
      ])
      .select()
      .single()

    if (adminError) throw adminError

    return admin
  } catch (error) {
    throw new Error(error.message || 'Failed to create admin')
  }
}

/**
 * Fetch all admins
 */
export const fetchAllAdmins = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .eq('role', 'admin')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch admins')
  }
}
