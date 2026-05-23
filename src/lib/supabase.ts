import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Zaroori: Browser memory mein save rakho
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'campus-flow-v1' // Alag key taaki purani cookies se panga na ho
  }
})