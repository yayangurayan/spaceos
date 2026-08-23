import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

let supabase: SupabaseClient

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[SpaceOS] Missing Supabase environment variables.\n' +
    'Please copy .env.example to .env and fill in your Supabase credentials.\n' +
    'Auth features will not work until this is configured.'
  )
  // Create a dummy client that won't crash the app during development
  // Use placeholder values - all requests will fail gracefully
  supabase = createClient(
    'https://placeholder.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
  )
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }
