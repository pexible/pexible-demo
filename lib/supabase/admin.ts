import { createClient } from '@supabase/supabase-js'

// Admin client with service role key — bypasses RLS.
// ONLY use server-side, NEVER expose to the browser.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error('Missing Supabase admin credentials:', { url: !!url, serviceKey: !!serviceKey })
    throw new Error('Supabase admin client not configured')
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
