import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  // Require authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()
    const { data: results, error } = await admin
      .from('cv_check_results')
      .select('id, created_at, original_score, optimized_score, status, files_expire_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ results: [] })
    }

    // Mark expired results
    const now = new Date()
    const mappedResults = (results || []).map((r) => ({
      ...r,
      files_available: r.status === 'completed' && new Date(r.files_expire_at) > now,
    }))

    return NextResponse.json({ results: mappedResults })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
