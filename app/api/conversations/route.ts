import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { nanoid } from 'nanoid'
import { getConversations, saveConversations, type Conversation } from '@/lib/storage'

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

  return NextResponse.json({
    conversations: userConversations.map(c => ({
      id: c.id,
      title: c.title,
      status: c.status,
      search_id: c.search_id,
      message_count: c.messages.length,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }))
  })
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as Record<string, unknown>).id as string
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

  const data = await getConversations()
  data.conversations.push(conversation)
  await saveConversations(data)

  return NextResponse.json({ conversation: { id: conversation.id, title: conversation.title, status: conversation.status } })
}
