import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Require authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()
    const { data: result, error } = await admin
      .from('cv_check_results')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !result) {
      return NextResponse.json({ error: 'Ergebnis nicht gefunden.' }, { status: 404 })
    }

    const now = new Date()
    const filesAvailable = result.status === 'completed' && new Date(result.files_expire_at) > now

    return NextResponse.json({
      ...result,
      files_available: filesAvailable,
    })
  } catch {
    return NextResponse.json({ error: 'Fehler beim Laden des Ergebnisses.' }, { status: 500 })
  }
}
