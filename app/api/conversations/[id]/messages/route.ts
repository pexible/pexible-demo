import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { id } = await params
  const { messages } = await req.json()
  const admin = createAdminClient()

  // Verify conversation belongs to user and get current title
  const { data: conversation, error: fetchError } = await admin
    .from('conversations')
    .select('id, title')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !conversation) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
  }

  // Update messages
  const { error: updateError } = await admin
    .from('conversations')
    .update({
      messages,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (updateError) {
    return NextResponse.json({ error: 'Fehler beim Speichern der Nachrichten' }, { status: 500 })
  }

  // Auto-generate title from first user message if still default
  if (conversation.title === 'Neue Suche' && messages.length > 1) {
    const firstUserMsg = messages.find((m: { role: string; content: string }) => m.role === 'user')
    if (firstUserMsg) {
      const title = firstUserMsg.content.substring(0, 60).replace(/<!--[\s\S]*?-->/g, '').trim()
      if (title) {
        await admin
          .from('conversations')
          .update({ title })
          .eq('id', id)
      }
    }
  }

  return NextResponse.json({ success: true })
}
