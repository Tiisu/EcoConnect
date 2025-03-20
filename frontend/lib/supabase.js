import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Add this to your .env file

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Regular client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

