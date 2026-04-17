import { supabase } from './supabase'

export async function submitLeave({ userId, reason, startDate, endDate, imageFile }) {
  let image_url = null
  if (imageFile) {
    const ext  = imageFile.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('leave-images').upload(path, imageFile)
    if (upErr) throw new Error('Image upload failed: ' + upErr.message)
    image_url = supabase.storage.from('leave-images').getPublicUrl(path).data.publicUrl
  }
  const { data, error } = await supabase.from('leaves').insert({
    user_id: userId, reason: reason.trim(),
    start_date: startDate, end_date: endDate, image_url, status: 'pending',
  }).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function fetchMyLeaves(userId) {
  const { data, error } = await supabase
    .from('leaves').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}