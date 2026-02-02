import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { nanoid } from 'nanoid'
import { getConversations, saveConversations, type Conversation } from '@/lib/storage'

const COOLDOWN_DAYS = 7

function getCooldownStatus(userConversations: Conversation[]): { canCreateNew: boolean; cooldownUntil: string | null } {
  if (userConversations.length === 0) return { canCreateNew: true, cooldownUntil: null }

  // Sort by created_at descending to find the most recent conversation
  const sorted = [...userConversations].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const mostRecent = sorted[0]

  // If the most recent conversation is completed (paid), allow new chat immediately
  if (mostRecent.status === 'completed') return { canCreateNew: true, cooldownUntil: null }

  // If the most recent conversation is active, check cooldown
  const createdAt = new Date(mostRecent.created_at)
  const cooldownEnd = new Date(createdAt.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
  const now = new Date()

  if (now < cooldownEnd) {
    return { canCreateNew: false, cooldownUntil: cooldownEnd.toISOString() }
  }

  // Cooldown expired, allow new chat
  return { canCreateNew: true, cooldownUntil: null }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as Record<string, unknown>).id as string
  const data = await getConversations()
  const userConversations = data.conversations
    .filter(c => c.user_id === userId)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

  const cooldown = getCooldownStatus(userConversations)

  return NextResponse.json({
    conversations: userConversations.map(c => ({
      id: c.id,
      title: c.title,
      status: c.status,
      search_id: c.search_id,
      message_count: c.messages.length,
      created_at: c.created_at,
      updated_at: c.updated_at,
    })),
    canCreateNew: cooldown.canCreateNew,
    cooldownUntil: cooldown.cooldownUntil,
  })
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as Record<string, unknown>).id as string
  const data = await getConversations()
  const userConversations = data.conversations.filter(c => c.user_id === userId)

  // Check 7-day cooldown
  const cooldown = getCooldownStatus(userConversations)
  if (!cooldown.canCreateNew) {
    return NextResponse.json({
      error: 'cooldown_active',
      cooldownUntil: cooldown.cooldownUntil,
      message: 'Bitte warte bis die Abklingzeit abgelaufen ist, oder schließe deine aktuelle Suche ab.',
    }, { status: 429 })
  }

  const now = new Date().toISOString()

  const conversation: Conversation = {
    id: nanoid(),
    user_id: userId,
    title: 'Neue Suche',
    status: 'active',
    messages: [],
    created_at: now,
    updated_at: now,
  }

  data.conversations.push(conversation)
  await saveConversations(data)

  return NextResponse.json({ conversation: { id: conversation.id, title: conversation.title, status: conversation.status } })
}
