import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only create client if credentials are provided
export const supabase =
  SUPABASE_URL && SUPABASE_URL !== 'your_supabase_url' && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'your_supabase_anon_key'
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null

export const isSupabaseEnabled = !!supabase
