import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { nanoid } from 'nanoid'

const COOLDOWN_DAYS = 7

async function getCooldownStatus(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  userConversations: Array<{ status: string; created_at: string }>
): Promise<{ canCreateNew: boolean; cooldownUntil: string | null }> {
  // Check for unpaid searches
  const { data: unpaidSearches } = await admin
    .from('searches')
    .select('id, paid')
    .eq('user_id', userId)
    .eq('paid', false)

  const hasUnpaidSearches = unpaidSearches && unpaidSearches.length > 0

  // If user has no conversations, allow creating first one
  // (even if there's an orphan unpaid search from failed registration)
  if (userConversations.length === 0) {
    return { canCreateNew: true, cooldownUntil: null }
  }

  // Sort by created_at descending to find the most recent conversation
  const sorted = [...userConversations].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const mostRecent = sorted[0]

  // If the most recent conversation is completed, allow new chat
  // (Don't block based on old unpaid searches from abandoned flows)
  if (mostRecent.status === 'completed') {
    return { canCreateNew: true, cooldownUntil: null }
  }

  // If the most recent conversation is active, check cooldown
  const createdAt = new Date(mostRecent.created_at)
  const cooldownEnd = new Date(createdAt.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
  const now = new Date()

  if (now < cooldownEnd) {
    return { canCreateNew: false, cooldownUntil: cooldownEnd.toISOString() }
  }

  // Cooldown expired but unpaid searches still block
  if (hasUnpaidSearches) {
    return { canCreateNew: false, cooldownUntil: null }
  }

  // Cooldown expired, allow new chat
  return { canCreateNew: true, cooldownUntil: null }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: conversations, error } = await admin
    .from('conversations')
    .select('id, title, status, search_id, messages, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Fehler beim Laden der Konversationen' }, { status: 500 })
  }

  const userConversations = conversations || []
  const cooldown = await getCooldownStatus(admin, user.id, userConversations)

  return NextResponse.json({
    conversations: userConversations.map(c => ({
      id: c.id,
      title: c.title,
      status: c.status,
      search_id: c.search_id,
      message_count: Array.isArray(c.messages) ? c.messages.length : 0,
      created_at: c.created_at,
      updated_at: c.updated_at,
    })),
    canCreateNew: cooldown.canCreateNew,
    cooldownUntil: cooldown.cooldownUntil,
  })
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Fetch user conversations for cooldown check
  const { data: conversations } = await admin
    .from('conversations')
    .select('id, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const userConversations = conversations || []

  // Check 7-day cooldown
  const cooldown = await getCooldownStatus(admin, user.id, userConversations)
  if (!cooldown.canCreateNew) {
    return NextResponse.json({
      error: 'cooldown_active',
      cooldownUntil: cooldown.cooldownUntil,
      message: 'Bitte warte bis die Abklingzeit abgelaufen ist, oder schließe deine aktuelle Suche ab.',
    }, { status: 429 })
  }

  const now = new Date().toISOString()

  const { data: conversation, error } = await admin
    .from('conversations')
    .insert({
      id: nanoid(),
      user_id: user.id,
      title: 'Neue Suche',
      status: 'active',
      messages: [],
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (error) {
    console.error('Supabase insert error:', error)
    return NextResponse.json({ error: `Fehler beim Erstellen der Konversation: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      title: conversation.title,
      status: conversation.status,
    },
  })
}
