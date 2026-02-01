import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getConversations, saveConversations } from '@/lib/storage'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const userId = (session.user as Record<string, unknown>).id as string
  const { messages } = await req.json()

  const data = await getConversations()
  const conversation = data.conversations.find(c => c.id === id && c.user_id === userId)

  if (!conversation) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
  }

  conversation.messages = messages
  conversation.updated_at = new Date().toISOString()

  // Auto-generate title from first user message if still default
  if (conversation.title === 'Neue Suche' && messages.length > 1) {
    const firstUserMsg = messages.find((m: { role: string; content: string }) => m.role === 'user')
    if (firstUserMsg) {
      const title = firstUserMsg.content.substring(0, 60).replace(/<!--[\s\S]*?-->/g, '').trim()
      if (title) conversation.title = title
    }
  }

  await saveConversations(data)
  return NextResponse.json({ success: true })
}
