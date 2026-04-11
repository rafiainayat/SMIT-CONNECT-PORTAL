/**
 * Leave Service
 * 
 * RESPONSIBILITY: All leave request operations
 * - Submit leave
 * - Fetch leaves
 * - Update leave status
 * - Image upload
 */

import { supabase } from './supabase'

/**
 * Submit leave request
 * 
 * @param {object} leaveData - { userId, reason, startDate, endDate, imageFile }
 */
export const submitLeave = async (leaveData) => {
  try {
    const { userId, reason, startDate, endDate, imageFile } = leaveData

    let imageUrl = null

    // Upload image if provided
    if (imageFile) {
      const fileName = `${userId}/${Date.now()}-${imageFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('leave-attachments')
        .upload(fileName, imageFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage
        .from('leave-attachments')
        .getPublicUrl(fileName)

      imageUrl = data.publicUrl
    }

    // Create leave record
    const { data: leave, error: leaveError } = await supabase
      .from('leaves')
      .insert([
        {
          user_id: userId,
          reason,
          start_date: startDate,
          end_date: endDate,
          image_url: imageUrl,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (leaveError) throw leaveError

    return leave
  } catch (error) {
    throw new Error(error.message || 'Failed to submit leave request')
  }
}

/**
 * Fetch user's leave requests
 */
export const fetchMyLeaves = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('leaves')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch leave requests')
  }
}

/**
 * Fetch all leave requests (admin view)
 */
export const fetchAllLeaves = async (filters = {}) => {
  try {
    let query = supabase
      .from('leaves')
      .select(`
        id,
        user_id,
        reason,
        start_date,
        end_date,
        image_url,
        status,
        created_at,
        users (id, name, cnic, roll_number, email)
      `)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.userId) {
      query = query.eq('user_id', filters.userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch leave requests')
  }
}

/**
 * Approve/Reject leave request
 */
export const updateLeaveStatus = async (leaveId, status) => {
  try {
    const { data, error } = await supabase
      .from('leaves')
      .update({ status })
      .eq('id', leaveId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    throw new Error(error.message || 'Failed to update leave status')
  }
}

/**
 * Get leave by ID
 */
export const getLeaveById = async (leaveId) => {
  try {
    const { data, error } = await supabase
      .from('leaves')
      .select(`
        *,
        users (id, name, email, cnic)
      `)
      .eq('id', leaveId)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch leave details')
  }
}

/**
 * Get pending leaves count (for admin dashboard)
 */
export const getPendingLeavesCount = async () => {
  try {
    const { count, error } = await supabase
      .from('leaves')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (error) throw error

    return count || 0
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch pending leaves count')
  }
}
