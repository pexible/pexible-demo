'use client'

import { useUser } from '@/lib/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
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

type OtpStep = 'email' | 'otp' | 'creating'

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
  const { user, isLoading: authLoading } = useUser()

  if (authLoading) {
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

  if (user) return <ChatListView />
  return <AnonymousChatView />
}

// ─── Authenticated: Chat List ───

function ChatListView() {
  const { user, signOut } = useUser()
  const router = useRouter()
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [canCreateNew, setCanCreateNew] = useState(true)
  const [cooldownUntil, setCooldownUntil] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/conversations')
      .then(res => res.json())
      .then(data => {
        setConversations(data.conversations || [])
        setCanCreateNew(data.canCreateNew !== false)
        setCooldownUntil(data.cooldownUntil || null)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const handleNewChat = async () => {
    if (!canCreateNew) return
    setIsCreating(true)
    try {
      const res = await fetch('/api/conversations', { method: 'POST' })
      const data = await res.json()
      console.log('Create conversation response:', data)
      if (data.error === 'cooldown_active') {
        setCanCreateNew(false)
        setCooldownUntil(data.cooldownUntil)
        setIsCreating(false)
        return
      }
      if (data.error) {
        console.error('Conversation creation error:', data.error)
        alert(`Fehler: ${data.error}`)
        setIsCreating(false)
        return
      }
      if (data.conversation?.id) {
        router.push(`/chat/${data.conversation.id}`)
      } else {
        console.error('No conversation ID in response:', data)
        alert('Fehler beim Erstellen des Chats')
        setIsCreating(false)
      }
    } catch (err) {
      console.error('Network error creating chat:', err)
      alert('Netzwerkfehler. Bitte versuche es erneut.')
      setIsCreating(false)
    }
  }

  const getCooldownDays = () => {
    if (!cooldownUntil) return 0
    const diff = new Date(cooldownUntil).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)))
  }

  const getCooldownProgress = () => {
    if (!cooldownUntil) return 100
    const daysLeft = getCooldownDays()
    return Math.round(((7 - daysLeft) / 7) * 100)
  }

  const filteredConversations = search.trim()
    ? conversations.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    : conversations

  const userName = user?.firstName || ''

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
              onClick={() => signOut()}
              className="text-xs text-[#9CA3AF] hover:text-[#1A1A2E] transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
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
            disabled={isCreating || !canCreateNew}
            className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] font-semibold rounded-xl transition-colors text-sm ${
              canCreateNew
                ? 'bg-[#1A1A2E] hover:bg-[#2D2D44] text-white disabled:bg-[#E8E0D4] disabled:text-[#9CA3AF]'
                : 'bg-[#E8E0D4] text-[#9CA3AF] cursor-not-allowed'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {isCreating ? 'Wird erstellt...' : !canCreateNew ? `In ${getCooldownDays()} Tagen` : 'Neuer Chat'}
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
            enterKeyHint="search"
            autoComplete="off"
            className="w-full pl-10 pr-4 py-3 min-h-[44px] bg-white border border-[#E8E0D4]/80 rounded-xl text-[16px] sm:text-sm text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/30 focus:border-[#F5B731]/20 transition-all"
          />
        </div>

        {/* Cooldown Notice */}
        {!isLoading && !canCreateNew && cooldownUntil && (
          <div className="bg-white rounded-2xl border border-[#E8E0D4]/60 p-5 sm:p-6 mb-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-[#F5B731]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#F5B731]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#1A1A2E] text-sm sm:text-base mb-1">
                  N&auml;chste Suche in {getCooldownDays()} Tag{getCooldownDays() !== 1 ? 'en' : ''} verf&uuml;gbar
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-3">
                  Um dir die bestm&ouml;glichen Ergebnisse liefern zu k&ouml;nnen, kannst du alle 7 Tage eine neue Suche starten. Schlie&szlig;e deine aktuelle Suche ab (49&thinsp;&euro;), um sofort eine neue Suche zu starten.
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-[#F5F0E8] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#F5B731] to-[#E8930C] h-2 rounded-full transition-all"
                      style={{ width: `${getCooldownProgress()}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-[#9CA3AF] whitespace-nowrap">
                    noch {getCooldownDays()} Tag{getCooldownDays() !== 1 ? 'e' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

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
              disabled={isCreating || !canCreateNew}
              className={`inline-flex items-center gap-2 px-6 py-3 min-h-[48px] font-semibold rounded-xl transition-colors text-sm ${
                canCreateNew
                  ? 'bg-[#F5B731] hover:bg-[#E8930C] text-[#1A1A2E]'
                  : 'bg-[#E8E0D4] text-[#9CA3AF] cursor-not-allowed'
              }`}
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
                className="flex items-center gap-4 px-4 py-4 min-h-[60px] rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-[#E8E0D4]/60 transition-all group active:scale-[0.99]"
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
  const initialGreeting = [{
    id: 'greeting',
    role: 'assistant' as const,
    content: 'Hey! Sch\u00f6n, dass du hier bist. Ich bin dein pers\u00f6nlicher Job-Makler und finde Stellen, die du auf keinem Portal siehst. Erz\u00e4hl mir \u2013 was w\u00fcrdest du gerne beruflich machen? Oder gibt es bestimmte T\u00e4tigkeiten, die dir besonders Spa\u00df machen?',
  }]
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialMessages: initialGreeting,
  })
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Registration state - detected from tool results, shown as inline buttons
  const [showRegModal, setShowRegModal] = useState(false)
  const [regJobTitle, setRegJobTitle] = useState('')
  const [regPostalCode, setRegPostalCode] = useState('')
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regError, setRegError] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  // OTP flow state
  const [otpStep, setOtpStep] = useState<OtpStep>('email')
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', ''])
  const [otpResendTimer, setOtpResendTimer] = useState(0)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Detect require_registration from tool results (no auto-popup)
  const requiresRegistration = messages.some(
    (m) => m.role === 'assistant' && m.toolInvocations?.some(
      (inv) => inv.toolName === 'create_search' && inv.state === 'result' &&
        (inv.result as Record<string, unknown>)?.action === 'require_registration'
    )
  )

  // Extract job_title and postal_code from tool result when needed
  useEffect(() => {
    if (!requiresRegistration) return
    for (const m of messages) {
      if (m.role === 'assistant' && m.toolInvocations) {
        for (const inv of m.toolInvocations) {
          if (inv.toolName === 'create_search' && inv.state === 'result' &&
            (inv.result as Record<string, unknown>)?.action === 'require_registration') {
            const result = inv.result as { job_title: string; postal_code: string }
            setRegJobTitle(result.job_title)
            setRegPostalCode(result.postal_code)
          }
        }
      }
    }
  }, [requiresRegistration, messages])

  // Auto-scroll
  useEffect(() => {
    const el = chatContainerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isLoading, requiresRegistration])

  // Auto-focus input
  useEffect(() => {
    if (!isLoading && !showRegModal && !requiresRegistration) {
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [isLoading, showRegModal, requiresRegistration])

  // OTP resend countdown timer
  useEffect(() => {
    if (otpResendTimer <= 0) return
    const interval = setInterval(() => {
      setOtpResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [otpResendTimer])

  // Open modal with fresh state
  const openRegModal = () => {
    setOtpStep('email')
    setOtpCode(['', '', '', '', '', ''])
    setOtpResendTimer(0)
    setRegError('')
    setRegLoading(false)
    setShowRegModal(true)
  }

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...otpCode]
    newCode[index] = value.slice(-1)
    setOtpCode(newCode)
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = [...otpCode]
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i]
    }
    setOtpCode(newCode)
    const nextEmpty = newCode.findIndex(d => !d)
    otpInputRefs.current[nextEmpty >= 0 ? nextEmpty : 5]?.focus()
  }

  const handleResendOtp = async () => {
    if (otpResendTimer > 0) return
    setRegError('')
    setRegLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({ email: regEmail })
      if (error) { setRegError(error.message); setRegLoading(false); return }
      setOtpResendTimer(60)
      setOtpCode(['', '', '', '', '', ''])
      setRegLoading(false)
    } catch {
      setRegError('Netzwerkfehler. Bitte versuche es erneut.')
      setRegLoading(false)
    }
  }

  // Body scroll lock for registration modal
  useEffect(() => {
    if (showRegModal) {
      document.body.classList.add('modal-open')
      return () => document.body.classList.remove('modal-open')
    }
  }, [showRegModal])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')

    if (otpStep === 'email') {
      // Validate name and email
      if (regName.trim().length < 2) { setRegError('Name muss mindestens 2 Zeichen haben'); return }
      if (!regEmail.includes('@')) { setRegError('Ung\u00fcltige Email-Adresse'); return }

      setRegLoading(true)
      try {
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOtp({ email: regEmail })
        if (error) {
          console.error('OTP Error:', error)
          setRegError(error.message || JSON.stringify(error) || 'Email konnte nicht gesendet werden')
          setRegLoading(false)
          return
        }
        setOtpStep('otp')
        setOtpResendTimer(60)
        setRegLoading(false)
      } catch {
        setRegError('Netzwerkfehler. Bitte versuche es erneut.')
        setRegLoading(false)
      }
    } else if (otpStep === 'otp') {
      const token = otpCode.join('')
      if (token.length !== 6) { setRegError('Bitte gib den 6-stelligen Code ein'); return }

      setRegLoading(true)
      try {
        // Verify OTP -- this signs the user in via Supabase
        const supabase = createClient()
        const { error } = await supabase.auth.verifyOtp({ email: regEmail, token, type: 'email' })
        if (error) { console.error('Verify OTP error:', error); setRegError(error.message || 'Ungültiger Code'); setRegLoading(false); return }

        // Ensure session is synced - small delay for cookies to propagate
        await new Promise(resolve => setTimeout(resolve, 500))

        // Verify session is active
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          console.error('Session not found after OTP verification')
          setRegError('Sitzungsfehler. Bitte lade die Seite neu und versuche es erneut.')
          setRegLoading(false)
          return
        }

        // OTP verified and user is now authenticated -- create profile + search
        setOtpStep('creating')

        // Save name to profile + create search via API
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: regName.trim(),
            email: regEmail,
            job_title: regJobTitle,
            postal_code: regPostalCode,
          }),
        })
        const data = await res.json()
        console.log('Register response:', data)
        if (!data.success) { setRegError(data.error || 'Registrierung fehlgeschlagen'); setOtpStep('otp'); setRegLoading(false); return }

        // Create conversation
        const convRes = await fetch('/api/conversations', { method: 'POST' })
        const convData = await convRes.json()
        console.log('Conversation response:', convData)
        const convId = convData.conversation?.id

        if (convId) {
          // Save current messages to conversation
          const msgRes = await fetch(`/api/conversations/${convId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages }),
          })
          console.log('Messages saved:', await msgRes.json())

          // Set search_id and title on conversation
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

          // Redirect to conversation page with registered flag
          window.location.href = `/chat/${convId}?registered=1`
        } else {
          console.error('No conversation ID returned:', convData)
          window.location.href = '/chat'
        }
      } catch (err) {
        console.error('Registration flow error:', err)
        setRegError('Netzwerkfehler. Bitte versuche es erneut.')
        setOtpStep('otp')
        setRegLoading(false)
      }
    }
  }

  return (
    <div className="h-screen-safe bg-[#FDF8F0] text-[#1A1A2E] flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="flex-shrink-0 z-40 bg-[#FDF8F0]/80 backdrop-blur-xl border-b border-[#E8E0D4]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold italic text-[#1A1A2E] tracking-tight">pexible</Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="text-sm font-medium text-[#4A5568] hover:text-[#1A1A2E] transition-colors px-3 py-2.5 min-h-[44px] flex items-center">
              Anmelden
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-[#1A1A2E] text-white px-5 py-2.5 min-h-[44px] flex items-center rounded-full hover:bg-[#2D2D44] transition-colors">
              Registrieren
            </Link>
          </div>
        </div>
      </nav>

      {/* Chat Section */}
      <section className="flex-1 flex flex-col relative px-3 sm:px-4 pt-2 sm:pt-10 pb-1 sm:pb-8 min-h-0 overflow-hidden">
        <div className="hidden sm:block absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-[#F5B731]/[0.05] rounded-full blur-[120px] pointer-events-none" />
        <div className="hidden sm:block absolute bottom-[-50px] left-[-150px] w-[350px] h-[350px] bg-[#E8930C]/[0.03] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-2xl mx-auto w-full relative flex-1 flex flex-col min-h-0">
          <div className="text-center mb-1 sm:mb-6">
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E8E0D4] rounded-full text-xs text-[#6B7280] mb-4 shadow-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              KI-gest&uuml;tzte Jobsuche &ndash; jetzt live
            </div>
            <h1 className="text-lg sm:text-3xl font-extrabold leading-tight tracking-tight text-[#1A1A2E]">
              Dein pers&ouml;nlicher <span className="text-[#F5B731]">Job-Makler</span>
            </h1>
            <p className="mt-0.5 sm:mt-2 text-xs sm:text-sm text-[#6B7280] hidden sm:block">
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
              <div ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-4 py-3 sm:py-4 bg-[#FEFCF9]">
                <div className="space-y-3">
                  {messages.map((message) => {
                    const visibleContent = getVisibleContent(message.content)
                    if (!visibleContent) return null
                    return (
                      <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3.5 sm:px-4 py-2.5 text-sm leading-relaxed ${
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

                  {/* Inline registration / exit buttons - shown after AI finishes */}
                  {requiresRegistration && !isLoading && !showRegModal && (
                    <div className="flex justify-start mt-2">
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                          onClick={openRegModal}
                          className="flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] bg-[#F5B731] hover:bg-[#E8930C] text-[#1A1A2E] font-semibold rounded-xl transition-colors text-sm shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          Kostenlos registrieren
                        </button>
                        <button
                          onClick={() => { window.location.href = '/' }}
                          className="flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] bg-white hover:bg-[#F9F5EE] text-[#4A5568] border border-[#E8E0D4] font-medium rounded-xl transition-colors text-sm"
                        >
                          Beenden
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input - Claude-style minimal design */}
              <div className="px-3 sm:px-4 py-2 sm:py-3 bg-white safe-bottom">
                {requiresRegistration && !showRegModal ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#F5F0E8] rounded-2xl border border-[#E8E0D4]/60">
                    <input
                      disabled
                      placeholder="Bitte registriere dich, um fortzufahren"
                      className="flex-1 py-2 bg-transparent text-sm text-[#9CA3AF] placeholder-[#B8B0A4] cursor-not-allowed focus:outline-none"
                    />
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#F9F5EE] rounded-2xl border border-[#E8E0D4]/60 focus-within:border-[#F5B731]/40 focus-within:ring-2 focus-within:ring-[#F5B731]/20 transition-all">
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        placeholder="z.B. Marketing Manager in Berlin..."
                        enterKeyHint="send"
                        autoComplete="off"
                        className="flex-1 py-2 bg-transparent text-[16px] sm:text-sm text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none"
                        disabled={isLoading || showRegModal}
                        autoFocus
                      />
                      {/* Circular send button - only visible when there's text */}
                      {input.trim() && (
                        <button
                          type="submit"
                          disabled={isLoading || showRegModal}
                          className="w-8 h-8 flex-shrink-0 bg-[#F5B731] hover:bg-[#E8930C] disabled:bg-[#E8E0D4] text-white rounded-full flex items-center justify-center transition-all active:scale-95"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </form>
                )}
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

      {/* Registration Modal (OTP Flow) */}
      {showRegModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] overflow-y-auto overscroll-contain"
          onClick={(e) => { if (e.target === e.currentTarget && otpStep !== 'creating') setShowRegModal(false) }}
        >
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 relative sm:my-4 sm:mx-4 max-h-[90vh] overflow-y-auto pb-safe">
            {/* Close button (hidden during creating step) */}
            {otpStep !== 'creating' && (
              <button onClick={() => setShowRegModal(false)} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[#9CA3AF] hover:text-[#1A1A2E] transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}

            {/* Step: Email (name + email) */}
            {otpStep === 'email' && (
              <>
                <div className="text-center mb-5 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#F5B731]/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#F5B731]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#1A1A2E]">Ergebnisse freischalten</h2>
                  <p className="text-sm text-[#6B7280] mt-1">Erstelle ein kostenloses Konto um deine Suchergebnisse zu sehen.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A5568] mb-1.5">Vorname</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      autoComplete="given-name"
                      inputMode="text"
                      className="w-full px-4 py-3 min-h-[44px] bg-[#F9F5EE] border border-[#E8E0D4] rounded-xl text-[16px] sm:text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731]/30"
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
                      autoComplete="email"
                      inputMode="email"
                      className="w-full px-4 py-3 min-h-[44px] bg-[#F9F5EE] border border-[#E8E0D4] rounded-xl text-[16px] sm:text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731]/30"
                      placeholder="max@beispiel.de"
                      disabled={regLoading}
                    />
                  </div>

                  {regError && (
                    <div className="bg-red-50 text-red-600 border border-red-200 text-sm p-3 rounded-xl">{regError}</div>
                  )}

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full py-3 min-h-[44px] bg-[#F5B731] hover:bg-[#E8930C] disabled:bg-[#E8E0D4] disabled:text-[#9CA3AF] text-[#1A1A2E] font-semibold rounded-xl transition-colors"
                  >
                    {regLoading ? 'Code wird gesendet...' : 'Weiter'}
                  </button>

                  <p className="text-xs text-center text-[#9CA3AF]">
                    Bereits ein Konto?{' '}
                    <Link href="/login" className="font-semibold text-[#F5B731] hover:text-[#E8930C]">Anmelden</Link>
                  </p>
                </form>
              </>
            )}

            {/* Step: OTP verification */}
            {otpStep === 'otp' && (
              <>
                <div className="text-center mb-5 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#F5B731]/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#F5B731]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#1A1A2E]">Code eingeben</h2>
                  <p className="text-sm text-[#6B7280] mt-1">
                    Wir haben einen 6-stelligen Code an <span className="font-medium text-[#1A1A2E]">{regEmail}</span> gesendet.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  {/* OTP input boxes */}
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otpCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpInputRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-[#F9F5EE] border border-[#E8E0D4] rounded-xl text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731]/30 transition-all"
                        disabled={regLoading}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  {/* Resend timer / link */}
                  <div className="text-center">
                    {otpResendTimer > 0 ? (
                      <p className="text-xs text-[#9CA3AF]">
                        Code erneut senden in <span className="font-medium text-[#4A5568]">{otpResendTimer}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={regLoading}
                        className="text-xs font-semibold text-[#F5B731] hover:text-[#E8930C] transition-colors disabled:text-[#9CA3AF]"
                      >
                        Code erneut senden
                      </button>
                    )}
                  </div>

                  {regError && (
                    <div className="bg-red-50 text-red-600 border border-red-200 text-sm p-3 rounded-xl">{regError}</div>
                  )}

                  <button
                    type="submit"
                    disabled={regLoading || otpCode.join('').length !== 6}
                    className="w-full py-3 min-h-[44px] bg-[#F5B731] hover:bg-[#E8930C] disabled:bg-[#E8E0D4] disabled:text-[#9CA3AF] text-[#1A1A2E] font-semibold rounded-xl transition-colors"
                  >
                    {regLoading ? 'Wird gepr\u00fcft...' : 'Best\u00e4tigen'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setOtpStep('email'); setRegError(''); setOtpCode(['', '', '', '', '', '']) }}
                    className="w-full text-xs text-center text-[#9CA3AF] hover:text-[#4A5568] transition-colors py-1"
                  >
                    Andere Email-Adresse verwenden
                  </button>
                </form>
              </>
            )}

            {/* Step: Creating account (loading) */}
            {otpStep === 'creating' && (
              <div className="py-8 sm:py-12 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#F5B731]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-[#F5B731] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#1A1A2E] mb-2">Dein Konto wird erstellt</h2>
                <p className="text-sm text-[#6B7280]">Einen Moment bitte...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
