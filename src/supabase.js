import { createClient } from '@supabase/supabase-js'

// MunifApps Supabase configuration.
// The publishable key is intended for browser applications.
// RLS policies in Supabase remain responsible for protecting user data.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://vcustjkniulwxlurznnk.supabase.co'

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_XpKEYeGewRadh800fkOcKQ_f4clTCPg'

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)
