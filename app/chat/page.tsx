'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useChat } from 'ai/react'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ─── Types ───

interface ConversationItem {
  id: string
  title: string
  status: 'active' | 'completed'
  search_id?: string
  message_count: number
  created_at: string
  updated_at: string
}

// ─── Helpers ───

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

function getVisibleContent(content: string) {
  if (content.includes('<!--RESULTS_DATA')) return content.split('<!--RESULTS_DATA')[0].trim()
  if (content.includes('<!--PAYMENT_SUCCESS')) return content.split('<!--PAYMENT_SUCCESS')[0].trim()
  return content
}

// ─── Main Page (Dual Mode) ───

export default function ChatPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-[#F5B731] rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
          <div className="w-2 h-2 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
    )
  }

  if (session) return <ChatListView />
  return <AnonymousChatView />
}

// ─── Authenticated: Chat List ───

function ChatListView() {
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
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
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
            <p className="text-sm text-[#9CA3AF]">Keine Chats gefunden f&uuml;r &ldquo;{search}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Anonymous: Direct Chat with Registration ───

function AnonymousChatView() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Registration modal state
  const [showRegModal, setShowRegModal] = useState(false)
  const [regJobTitle, setRegJobTitle] = useState('')
  const [regPostalCode, setRegPostalCode] = useState('')
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regError, setRegError] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  // Auto-scroll
  useEffect(() => {
    const el = chatContainerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  // Auto-focus input
  useEffect(() => {
    if (!isLoading && !showRegModal) {
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [isLoading, showRegModal])

  // Detect require_registration from create_search tool
  useEffect(() => {
    for (const message of messages) {
      if (message.role === 'assistant' && message.toolInvocations) {
        for (const invocation of message.toolInvocations) {
          if (
            invocation.toolName === 'create_search' &&
            invocation.state === 'result' &&
            (invocation.result as Record<string, unknown>)?.action === 'require_registration'
          ) {
            const result = invocation.result as { job_title: string; postal_code: string }
            setRegJobTitle(result.job_title)
            setRegPostalCode(result.postal_code)
            setShowRegModal(true)
          }
        }
      }
    }
  }, [messages])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')

    if (regName.trim().length < 2) { setRegError('Name muss mindestens 2 Zeichen haben'); return }
    if (!regEmail.includes('@')) { setRegError('Ung\u00fcltige Email-Adresse'); return }
    if (regPassword.length < 8) { setRegError('Passwort muss mindestens 8 Zeichen haben'); return }
    if (regPassword !== regConfirm) { setRegError('Passw\u00f6rter stimmen nicht \u00fcberein'); return }

    setRegLoading(true)
    try {
      // 1. Register user + create search with results
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: regName.trim(),
          email: regEmail,
          password: regPassword,
          job_title: regJobTitle,
          postal_code: regPostalCode,
        }),
      })
      const data = await res.json()
      if (!data.success) { setRegError(data.error || 'Registrierung fehlgeschlagen'); setRegLoading(false); return }

      // 2. Auto-login
      const loginResult = await signIn('credentials', { email: regEmail, password: regPassword, redirect: false })
      if (loginResult?.error) { setRegError('Konto erstellt, aber Anmeldung fehlgeschlagen. Bitte melde dich manuell an.'); setRegLoading(false); return }

      // 3. Create conversation
      const convRes = await fetch('/api/conversations', { method: 'POST' })
      const convData = await convRes.json()
      const convId = convData.conversation?.id

      if (convId) {
        // 4. Save current messages to conversation
        await fetch(`/api/conversations/${convId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
        })

        // 5. Set search_id and title on conversation
        if (data.search?.search_id) {
          await fetch(`/api/conversations/${convId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              search_id: data.search.search_id,
              title: regJobTitle || 'Jobsuche',
            }),
          })
        }

        // 6. Redirect to conversation page with registered flag
        window.location.href = `/chat/${convId}?registered=1`
      } else {
        window.location.href = '/chat'
      }
    } catch {
      setRegError('Netzwerkfehler. Bitte versuche es erneut.')
      setRegLoading(false)
    }
  }

  return (
    <div className="h-screen h-[100dvh] bg-[#FDF8F0] text-[#1A1A2E] flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="flex-shrink-0 z-40 bg-[#FDF8F0]/80 backdrop-blur-xl border-b border-[#E8E0D4]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold italic text-[#1A1A2E] tracking-tight">pexible</Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-[#4A5568] hover:text-[#1A1A2E] transition-colors px-4 py-2">
              Anmelden
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-[#1A1A2E] text-white px-5 py-2.5 rounded-full hover:bg-[#2D2D44] transition-colors">
              Registrieren
            </Link>
          </div>
        </div>
      </nav>

      {/* Chat Section */}
      <section className="flex-1 flex flex-col relative px-3 sm:px-4 pt-3 sm:pt-10 pb-2 sm:pb-8 min-h-0 overflow-hidden">
        <div className="hidden sm:block absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-[#F5B731]/[0.05] rounded-full blur-[120px] pointer-events-none" />
        <div className="hidden sm:block absolute bottom-[-50px] left-[-150px] w-[350px] h-[350px] bg-[#E8930C]/[0.03] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-2xl mx-auto w-full relative flex-1 flex flex-col min-h-0">
          <div className="text-center mb-2 sm:mb-6">
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E8E0D4] rounded-full text-xs text-[#6B7280] mb-4 shadow-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              KI-gest&uuml;tzte Jobsuche &ndash; jetzt live
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold leading-tight tracking-tight text-[#1A1A2E]">
              Dein pers&ouml;nlicher <span className="text-[#F5B731]">Job-Makler</span>
            </h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[#6B7280]">
              Beschreibe deinen Traumjob &ndash; wir finden passende Stellen.
            </p>
          </div>

          {/* Chat Card */}
          <div className="relative flex-1 flex flex-col min-h-0">
            <div className="absolute -inset-3 bg-gradient-to-b from-[#F5B731]/10 via-[#F5B731]/5 to-transparent rounded-[1.5rem] blur-xl pointer-events-none hidden sm:block" />

            <div className="relative bg-white rounded-2xl shadow-xl shadow-black/5 border border-[#E8E0D4]/80 overflow-hidden flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="px-4 sm:px-5 py-3.5 border-b border-[#F0EBE2] flex items-center gap-3 bg-[#FDFBF7]">
                <div className="w-9 h-9 bg-gradient-to-br from-[#F5B731] to-[#E8930C] rounded-full flex items-center justify-center flex-shrink-0 shadow-md shadow-[#F5B731]/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A2E] text-sm tracking-tight">pexible Job-Makler</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-[#9CA3AF]">Online</span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 bg-[#FEFCF9]">
                <div className="space-y-3">
                  {messages.map((message) => {
                    const visibleContent = getVisibleContent(message.content)
                    if (!visibleContent) return null
                    return (
                      <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          message.role === 'user'
                            ? 'bg-[#F5B731] text-[#1A1A2E] font-medium rounded-tr-md'
                            : 'bg-[#F5F0E8] text-[#1A1A2E] rounded-tl-md'
                        }`}>
                          <div className="whitespace-pre-wrap break-words">{visibleContent}</div>
                        </div>
                      </div>
                    )
                  })}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[#F5F0E8] rounded-2xl rounded-tl-md px-4 py-3">
                        <div className="flex space-x-1.5">
                          <div className="w-1.5 h-1.5 bg-[#F5B731] rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                          <div className="w-1.5 h-1.5 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input */}
              <div className="border-t border-[#F0EBE2] px-3 sm:px-4 py-3 bg-white">
                <form onSubmit={handleSubmit}>
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={handleInputChange}
                      placeholder="z.B. Marketing Manager in Berlin..."
                      className="flex-1 px-4 py-3 bg-[#F9F5EE] border border-[#E8E0D4] rounded-xl text-[16px] sm:text-sm text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731]/30 transition-all"
                      disabled={isLoading || showRegModal}
                      autoFocus
                    />
                    <button type="submit" disabled={isLoading || !input.trim() || showRegModal} className="px-4 py-3 bg-[#F5B731] hover:bg-[#E8930C] disabled:bg-[#F5EFE3] disabled:text-[#9CA3AF] text-white font-semibold rounded-xl transition-all flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="hidden sm:flex items-center justify-center gap-4 sm:gap-6 mt-5 text-xs text-[#9CA3AF]">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <span>SSL-verschl&uuml;sselt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#F5B731]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span>KI-gest&uuml;tzt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              <span>Stripe-Zahlung</span>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center z-[60] p-4 overflow-y-auto overscroll-contain">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative my-auto">
            <button onClick={() => setShowRegModal(false)} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#1A1A2E] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-[#F5B731]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#F5B731]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-[#1A1A2E]">Ergebnisse freischalten</h2>
              <p className="text-sm text-[#6B7280] mt-1">Erstelle ein kostenloses Konto um deine Suchergebnisse zu sehen.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A5568] mb-1.5">Vorname</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F9F5EE] border border-[#E8E0D4] rounded-xl text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731]/30"
                  placeholder="Max"
                  disabled={regLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A5568] mb-1.5">Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F9F5EE] border border-[#E8E0D4] rounded-xl text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731]/30"
                  placeholder="max@beispiel.de"
                  disabled={regLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A5568] mb-1.5">Passwort</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F9F5EE] border border-[#E8E0D4] rounded-xl text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731]/30"
                  placeholder="Mindestens 8 Zeichen"
                  disabled={regLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A5568] mb-1.5">Passwort best&auml;tigen</label>
                <input
                  type="password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F9F5EE] border border-[#E8E0D4] rounded-xl text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731]/30"
                  placeholder="Passwort wiederholen"
                  disabled={regLoading}
                />
              </div>

              {regError && (
                <div className="bg-red-50 text-red-600 border border-red-200 text-sm p-3 rounded-xl">{regError}</div>
              )}

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3 bg-[#F5B731] hover:bg-[#E8930C] disabled:bg-[#E8E0D4] disabled:text-[#9CA3AF] text-[#1A1A2E] font-semibold rounded-xl transition-colors"
              >
                {regLoading ? 'Wird erstellt...' : 'Kostenloses Konto erstellen'}
              </button>

              <p className="text-xs text-center text-[#9CA3AF]">
                Bereits ein Konto?{' '}
                <Link href="/login" className="font-semibold text-[#F5B731] hover:text-[#E8930C]">Anmelden</Link>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
