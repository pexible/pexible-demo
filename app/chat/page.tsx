'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ConversationItem {
  id: string
  title: string
  status: 'active' | 'completed'
  search_id?: string
  message_count: number
  created_at: string
  updated_at: string
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Gerade eben'
  if (diffMin < 60) return `Vor ${diffMin} Minute${diffMin !== 1 ? 'n' : ''}`
  if (diffHr < 24) return `Vor ${diffHr} Stunde${diffHr !== 1 ? 'n' : ''}`
  if (diffDay < 7) return `Vor ${diffDay} Tag${diffDay !== 1 ? 'en' : ''}`
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function ChatListPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetch('/api/conversations')
      .then(res => res.json())
      .then(data => {
        setConversations(data.conversations || [])
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const handleNewChat = async () => {
    setIsCreating(true)
    try {
      const res = await fetch('/api/conversations', { method: 'POST' })
      const data = await res.json()
      if (data.conversation?.id) {
        router.push(`/chat/${data.conversation.id}`)
      }
    } catch {
      setIsCreating(false)
    }
  }

  const filteredConversations = search.trim()
    ? conversations.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    : conversations

  const userName = session?.user?.name || ''

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-[#1A1A2E]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#FDF8F0]/80 backdrop-blur-xl border-b border-[#E8E0D4]/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold italic tracking-tight text-[#1A1A2E]">
            pexible
          </Link>
          <div className="flex items-center gap-3">
            {userName && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#F5B731] to-[#E8930C] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-[#4A5568] hidden sm:inline">{userName}</span>
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-xs text-[#9CA3AF] hover:text-[#1A1A2E] transition-colors px-2 py-1"
              title="Abmelden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Chats</h1>
          <button
            onClick={handleNewChat}
            disabled={isCreating}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A2E] hover:bg-[#2D2D44] disabled:bg-[#E8E0D4] text-white disabled:text-[#9CA3AF] font-semibold rounded-xl transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {isCreating ? 'Wird erstellt...' : 'Neuer Chat'}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Chats durchsuchen ..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8E0D4]/80 rounded-xl text-sm text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/30 focus:border-[#F5B731]/20 transition-all"
          />
        </div>

        {/* Conversation Count */}
        {!isLoading && (
          <p className="text-sm text-[#9CA3AF] mb-4">
            {filteredConversations.length} Chat{filteredConversations.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-[#F5B731] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
              <div className="w-2 h-2 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && conversations.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#F5B731]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-[#F5B731]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h2 className="text-lg font-bold text-[#1A1A2E] mb-2">Noch keine Chats</h2>
            <p className="text-sm text-[#6B7280] mb-6 max-w-xs mx-auto">
              Starte deinen ersten Chat mit dem pexible Job-Makler und finde passende Stellen.
            </p>
            <button
              onClick={handleNewChat}
              disabled={isCreating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5B731] hover:bg-[#E8930C] text-[#1A1A2E] font-semibold rounded-xl transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Ersten Chat starten
            </button>
          </div>
        )}

        {/* Conversation List */}
        {!isLoading && filteredConversations.length > 0 && (
          <div className="space-y-1">
            {filteredConversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-[#E8E0D4]/60 transition-all group"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  conv.status === 'completed'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-[#F5B731]/10 text-[#F5B731] group-hover:bg-[#F5B731]/20'
                }`}>
                  {conv.status === 'completed' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#1A1A2E] truncate">{conv.title}</p>
                    {conv.status === 'completed' && (
                      <span className="flex-shrink-0 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Abgeschlossen
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    {timeAgo(conv.updated_at)}
                  </p>
                </div>

                {/* Arrow */}
                <svg className="w-4 h-4 text-[#D1C9BD] group-hover:text-[#9CA3AF] flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            ))}
          </div>
        )}

        {/* No search results */}
        {!isLoading && search.trim() && filteredConversations.length === 0 && conversations.length > 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[#9CA3AF]">Keine Chats gefunden für &ldquo;{search}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  )
}
