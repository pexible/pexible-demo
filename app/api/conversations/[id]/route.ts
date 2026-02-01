import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getConversations, saveConversations, getResults } from '@/lib/storage'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const userId = (session.user as Record<string, unknown>).id as string
  const data = await getConversations()
  const conversation = data.conversations.find(c => c.id === id && c.user_id === userId)

  if (!conversation) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
  }

  let results = null
  if (conversation.search_id) {
    const resultsData = await getResults()
    results = resultsData.results.filter(r => r.search_id === conversation.search_id)
  }

  return NextResponse.json({ conversation, results })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const userId = (session.user as Record<string, unknown>).id as string
  const updates = await req.json()

  const data = await getConversations()
  const conversation = data.conversations.find(c => c.id === id && c.user_id === userId)

  if (!conversation) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
  }

  if (updates.status) conversation.status = updates.status
  if (updates.title) conversation.title = updates.title
  if (updates.search_id) conversation.search_id = updates.search_id
  conversation.updated_at = new Date().toISOString()

  await saveConversations(data)
  return NextResponse.json({ success: true })
}
