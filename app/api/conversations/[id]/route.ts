import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { id } = await params
  const admin = createAdminClient()

  const { data: conversation, error } = await admin
    .from('conversations')
    .select()
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !conversation) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
  }

  let results = null
  let searchPaid = false

  if (conversation.search_id) {
    const { data: resultsData } = await admin
      .from('results')
      .select()
      .eq('search_id', conversation.search_id)
      .order('rank')

    results = resultsData

    const { data: search } = await admin
      .from('searches')
      .select('paid')
      .eq('id', conversation.search_id)
      .single()

    if (search) searchPaid = search.paid
  }

  return NextResponse.json({ conversation, results, searchPaid })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { id } = await params
  const updates = await req.json()
  const admin = createAdminClient()

  // Build the update object with only allowed fields
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (updates.status) updateData.status = updates.status
  if (updates.title) updateData.title = updates.title
  if (updates.search_id) updateData.search_id = updates.search_id

  const { error } = await admin
    .from('conversations')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
