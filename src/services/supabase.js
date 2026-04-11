import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Client Initialization
 * 
 * SECURITY NOTES:
 * - Uses environment variables for credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
 * - These should NEVER be committed to version control
 * - .env file must be in .gitignore
 * 
 * PRODUCTION CHECKLIST:
 * ✓ Auth policy configured in Supabase dashboard
 * ✓ RLS (Row Level Security) enabled on all tables
 * ✓ API keys rotated regularly
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
