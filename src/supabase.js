import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function logActivity(username, action, detail = '') {
  try {
    await supabase.from('activity_logs').insert([{ username, action, detail }])
  } catch { /* silent fail */ }
}
