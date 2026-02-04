import { createClient } from '@supabase/supabase-js'

// Admin client with service role key — bypasses RLS.
// ONLY use server-side, NEVER expose to the browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
