'use client'

import { useChat, type Message } from 'ai/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useUser } from '@/lib/hooks/useUser'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { jsPDF } from 'jspdf'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

// ─── Types ───

interface PdfResult {
  company_name: string
  job_title: string
  job_url: string
  description?: string
}

// ─── Helpers ───

function getVisibleContent(content: string) {
  if (content.includes('<!--RESULTS_DATA')) return content.split('<!--RESULTS_DATA')[0].trim()
  if (content.includes('<!--PAYMENT_SUCCESS')) return content.split('<!--PAYMENT_SUCCESS')[0].trim()
  return content
}

function generateResultsPdf(results: PdfResult[], jobTitle: string, isComplete: boolean) {
  const title = isComplete ? 'Alle Suchergebnisse' : 'Suchergebnisse (Vorschau)'
  const date = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = 20

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bolditalic')
  doc.text('pexible', margin, y)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text(date, pageWidth - margin, y, { align: 'right' })
  y += 4
  doc.setDrawColor(245, 183, 49)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 12

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(title, margin, y)
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text(`Suche: ${jobTitle} \u2022 ${results.length} Treffer`, margin, y)
  y += 12

  doc.setFillColor(249, 250, 251)
  doc.rect(margin, y - 4, contentWidth, 8, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 60, 60)
  doc.text('#', margin + 2, y)
  doc.text('Unternehmen', margin + 12, y)
  doc.text('Stelle', margin + 62, y)
  doc.text('Link / Details', margin + 110, y)
  y += 2
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    if (y > 270) { doc.addPage(); y = 20 }
    doc.setTextColor(0, 0, 0)
    doc.text(`${i + 1}`, margin + 2, y)
    doc.setFont('helvetica', 'bold')
    doc.text(r.company_name.substring(0, 28), margin + 12, y)
    doc.setFont('helvetica', 'normal')
    doc.text(r.job_title.substring(0, 26), margin + 62, y)
    doc.setTextColor(37, 99, 235)
    const urlText = r.job_url.length > 38 ? r.job_url.substring(0, 38) + '...' : r.job_url
    doc.textWithLink(urlText, margin + 110, y, { url: r.job_url })
    y += 5
    if (r.description) {
      doc.setTextColor(120, 120, 120)
      doc.setFontSize(8)
      const descLines = doc.splitTextToSize(r.description, contentWidth - 12)
      doc.text(descLines.slice(0, 2), margin + 12, y)
      y += descLines.slice(0, 2).length * 3.5
      doc.setFontSize(9)
    }
    doc.setDrawColor(240, 240, 240)
    doc.line(margin, y, pageWidth - margin, y)
    y += 5
  }

  y += 8
  doc.setFontSize(8)
  doc.setTextColor(160, 160, 160)
  doc.text('Erstellt von pexible.de \u2022 Dein Job-Makler', pageWidth / 2, y, { align: 'center' })
  doc.save(`pexible-ergebnisse-${isComplete ? 'komplett' : 'vorschau'}.pdf`)
}

// ─── Stripe Payment ───

function CheckoutForm({ searchId, onSuccess, onCancel }: { searchId: string; onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setIsProcessing(true)
    setError('')
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({ elements, confirmParams: { return_url: `${window.location.origin}${window.location.pathname}?search_id=${searchId}` }, redirect: 'if_required' })
    if (stripeError) { setError(stripeError.message || 'Zahlung fehlgeschlagen'); setIsProcessing(false) }
    else if (paymentIntent?.status === 'succeeded') {
      await fetch('/api/payment-confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payment_intent_id: paymentIntent.id, search_id: searchId }) })
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <div className="bg-red-500/10 text-red-400 border border-red-500/20 text-sm p-3 rounded-xl">{error}</div>}
      <button type="submit" disabled={isProcessing || !stripe || !elements} className="w-full py-3 min-h-[44px] bg-[#F5B731] hover:bg-[#e5a820] disabled:bg-white/10 disabled:text-gray-600 text-black font-semibold rounded-xl transition-colors">
        {isProcessing ? 'Wird verarbeitet...' : '49,00 \u20AC bezahlen'}
      </button>
      <button type="button" onClick={onCancel} disabled={isProcessing} className="w-full py-2.5 min-h-[44px] text-gray-400 hover:text-gray-200 text-sm font-medium transition-colors">Abbrechen</button>
    </form>
  )
}

function PaymentModal({ isOpen, searchId, onClose, onSuccess }: { isOpen: boolean; searchId: string | null; onClose: () => void; onSuccess: () => void }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (isOpen && searchId) {
      setClientSecret(null)
      setLoadError('')
      fetch('/api/create-payment-intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ search_id: searchId }) })
        .then(res => res.json())
        .then(data => { if (data.error) setLoadError(data.error); else setClientSecret(data.clientSecret) })
        .catch(() => setLoadError('Netzwerkfehler. Bitte versuche es erneut.'))
    }
  }, [isOpen, searchId])

  if (!isOpen || !searchId) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] overflow-y-auto overscroll-contain" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-[#1a1a24] border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 relative sm:my-4 sm:mx-4 max-h-[90vh] overflow-y-auto pb-safe">
        <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-300 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Alle Ergebnisse freischalten</h2>
          <p className="text-sm text-gray-400 mt-1">Sichere Zahlung &uuml;ber Stripe</p>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300 font-medium">Alle Suchergebnisse</span>
            <span className="text-lg font-bold text-white">49,00 &euro;</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Einmalige Zahlung &ndash; kein Abo</p>
        </div>
        {loadError && <div className="bg-red-500/10 text-red-400 border border-red-500/20 text-sm p-3 rounded-xl mb-4">{loadError}</div>}
        {!clientSecret && !loadError && (
          <div className="flex justify-center py-8">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-[#F5B731] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-2 h-2 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        )}
        {clientSecret && stripePromise && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#F5B731', borderRadius: '12px', colorBackground: '#1a1a24', colorText: '#ffffff' } } }}>
            <CheckoutForm searchId={searchId} onSuccess={onSuccess} onCancel={onClose} />
          </Elements>
        )}
        <p className="text-xs text-gray-500 text-center mt-4">Sichere Zahlungsabwicklung durch Stripe.</p>
      </div>
    </div>
  )
}

// ─── Main Page ───

export default function ChatDetailPage() {
  const params = useParams()
  const conversationId = params.id as string
  const { user, signOut } = useUser()

  const [conversationLoaded, setConversationLoaded] = useState(false)
  const [conversationStatus, setConversationStatus] = useState<'active' | 'completed'>('active')
  const [storedMessages, setStoredMessages] = useState<Message[]>([])
  const [loadError, setLoadError] = useState('')
  const [storedResults, setStoredResults] = useState<PdfResult[]>([])
  const [conversationSearchId, setConversationSearchId] = useState<string | null>(null)
  const [searchPaid, setSearchPaid] = useState(false)
  const [paymentRedirectConfirmed, setPaymentRedirectConfirmed] = useState(false)

  // Load conversation on mount (with Stripe redirect handling for Klarna etc.)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paymentIntentParam = params.get('payment_intent')
    const redirectStatus = params.get('redirect_status')
    const redirectSearchId = params.get('search_id')

    const loadConversation = async () => {
      let paymentConfirmed = false

      // Handle Stripe redirect (e.g., after Klarna payment)
      if (paymentIntentParam && redirectStatus === 'succeeded' && redirectSearchId) {
        try {
          const confirmRes = await fetch('/api/payment-confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment_intent_id: paymentIntentParam, search_id: redirectSearchId }),
          })
          if (confirmRes.ok) paymentConfirmed = true
        } catch {
          // Payment confirmation failed, continue with normal load
        }
        window.history.replaceState({}, '', `/chat/${conversationId}`)
      }

      try {
        const res = await fetch(`/api/conversations/${conversationId}`)
        if (!res.ok) throw new Error('Not found')
        const data = await res.json()
        setConversationStatus(paymentConfirmed ? 'completed' : data.conversation.status)
        if (data.conversation.search_id) setConversationSearchId(data.conversation.search_id)
        if (data.searchPaid || paymentConfirmed) setSearchPaid(true)
        if (data.conversation.messages?.length > 0) setStoredMessages(data.conversation.messages)
        if (data.results) {
          setStoredResults(data.results.map((r: { company_name: string; job_title: string; job_url: string; description: string }) => ({
            company_name: r.company_name,
            job_title: r.job_title,
            job_url: r.job_url,
            description: r.description,
          })))
        }
        if (paymentConfirmed) {
          fetch(`/api/conversations/${conversationId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed' }),
          }).catch(() => {})
        }
      } catch {
        if (paymentConfirmed) {
          setPaymentRedirectConfirmed(true)
        } else {
          setLoadError('Chat nicht gefunden')
        }
      }
      setConversationLoaded(true)
    }

    loadConversation()
  }, [conversationId])

  if (!conversationLoaded) {
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

  if (loadError) {
    return (
      <div className="h-screen bg-[#FDF8F0] flex flex-col items-center justify-center px-4">
        <p className="text-[#6B7280] mb-4">{loadError}</p>
        <Link href="/chat" className="text-sm font-semibold text-[#F5B731] hover:text-[#E8930C]">Zurück zur Chat-Liste</Link>
      </div>
    )
  }

  if (paymentRedirectConfirmed) {
    return (
      <div className="h-screen bg-[#FDF8F0] flex flex-col items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">Zahlung erfolgreich!</h2>
          <p className="text-[#6B7280] mb-6">Deine Zahlung wurde bestätigt. Deine vollständigen Suchergebnisse werden für dich vorbereitet.</p>
          <Link href="/chat" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F5B731] hover:bg-[#E8930C] text-white font-semibold rounded-xl transition-colors">
            Zurück zu deinen Chats
          </Link>
        </div>
      </div>
    )
  }

  if (conversationStatus === 'completed') {
    return <CompletedChatView messages={storedMessages} results={storedResults} userName={user?.firstName || ''} signOut={signOut} />
  }

  return <ActiveChatView conversationId={conversationId} initialMessages={storedMessages} storedResults={storedResults} userName={user?.firstName || ''} onComplete={() => setConversationStatus('completed')} searchId={conversationSearchId} searchPaid={searchPaid} signOut={signOut} />
}

// ─── Completed Chat View (Read-Only) ───

function CompletedChatView({ messages, results, userName, signOut }: { messages: Message[]; results: PdfResult[]; userName: string; signOut: () => Promise<void> }) {
  const jobTitle = results[0]?.job_title || ''

  const handleDownloadPdf = () => {
    if (results.length > 0) generateResultsPdf(results, jobTitle, true)
  }

  return (
    <div className="h-screen-safe bg-[#FDF8F0] text-[#1A1A2E] flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="flex-shrink-0 z-40 bg-[#FDF8F0]/80 backdrop-blur-xl border-b border-[#E8E0D4]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold italic text-[#1A1A2E] tracking-tight">pexible</Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/chat" className="flex items-center gap-1.5 text-sm font-medium text-[#4A5568] hover:text-[#1A1A2E] bg-white hover:bg-[#F9F5EE] border border-[#E8E0D4] px-3 py-2 rounded-xl transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <span className="hidden sm:inline">Meine Chats</span>
            </Link>
            {results.length > 0 && (
              <button onClick={handleDownloadPdf} className="flex items-center gap-2 px-3 py-2 bg-[#F5B731] hover:bg-[#E8930C] text-[#1A1A2E] font-semibold rounded-xl transition-colors text-sm" title="Ergebnisse herunterladen">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="hidden sm:inline">PDF</span>
              </button>
            )}
            {userName && (
              <div className="w-8 h-8 bg-gradient-to-br from-[#F5B731] to-[#E8930C] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <button onClick={() => signOut()} className="text-[#9CA3AF] hover:text-[#1A1A2E] transition-colors" title="Abmelden">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Messages (Read-Only) */}
      <section className="flex-1 flex flex-col relative px-3 sm:px-4 pt-3 sm:pt-6 pb-2 sm:pb-8 min-h-0">
        <div className="max-w-2xl mx-auto w-full relative flex-1 flex flex-col min-h-0">
          <div className="relative flex-1 flex flex-col min-h-0">
            <div className="relative bg-white rounded-2xl shadow-xl shadow-black/5 border border-[#E8E0D4]/80 overflow-hidden flex-1 flex flex-col min-h-0">
              <div className="px-4 sm:px-5 py-3.5 border-b border-[#F0EBE2] flex items-center justify-between bg-[#FDFBF7]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-[#F5B731] to-[#E8930C] rounded-full flex items-center justify-center flex-shrink-0 shadow-md shadow-[#F5B731]/20">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A2E] text-sm tracking-tight">pexible Job-Makler</p>
                    <span className="text-xs text-green-600 font-medium">Chat abgeschlossen</span>
                  </div>
                </div>
                {results.length > 0 && (
                  <button onClick={handleDownloadPdf} className="p-2 text-[#9CA3AF] hover:text-[#F5B731] transition-colors rounded-lg hover:bg-[#F5EFE3]" title="Ergebnisse herunterladen">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </button>
                )}
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-4 py-3 sm:py-4 bg-[#FEFCF9]">
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
                </div>
              </div>

              {/* Disabled input area - visual feedback that chat is completed */}
              <div className="border-t border-[#F0EBE2] px-3 sm:px-4 py-2.5 sm:py-3 bg-[#F9F5EE] pb-safe">
                <div className="flex gap-2">
                  <input
                    disabled
                    placeholder="Chat abgeschlossen"
                    className="flex-1 px-4 py-3 bg-[#F0EBE2] border border-[#E8E0D4] rounded-xl text-sm text-[#9CA3AF] placeholder-[#B8B0A4] cursor-not-allowed"
                  />
                  <button disabled className="px-4 py-3 bg-[#E8E0D4] text-[#B8B0A4] rounded-xl cursor-not-allowed flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </button>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2 text-xs text-[#9CA3AF]">
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Suche abgeschlossen</span>
                  <span className="mx-1">&bull;</span>
                  <Link href="/chat" className="font-semibold text-[#F5B731] hover:text-[#E8930C] transition-colors">Neue Suche starten</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── Active Chat View ───

function ActiveChatView({ conversationId, initialMessages, storedResults, userName, onComplete, searchId, searchPaid, signOut }: {
  conversationId: string
  initialMessages: Message[]
  storedResults: PdfResult[]
  userName: string
  onComplete: () => void
  searchId: string | null
  searchPaid: boolean
  signOut: () => Promise<void>
}) {
  const welcomeMsg: Message = {
    id: 'welcome',
    role: 'assistant',
    content: userName
      ? `Hey ${userName}! Schön, dass du da bist. Ich bin dein persönlicher Job-Makler und finde Stellen, die du auf keinem Portal siehst. Erzähl mir \u2013 was würdest du gerne beruflich machen? Oder gibt es bestimmte Tätigkeiten, die dir besonders Spaß machen?`
      : 'Hey! Schön, dass du hier bist. Ich bin dein persönlicher Job-Makler und finde Stellen, die du auf keinem Portal siehst. Erzähl mir \u2013 was würdest du gerne beruflich machen? Oder gibt es bestimmte Tätigkeiten, die dir besonders Spaß machen?',
  }

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    initialMessages: initialMessages.length > 0 ? initialMessages : [welcomeMsg],
    body: { conversationId },
  })

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentSearchId, setPaymentSearchId] = useState<string | null>(searchId)
  const [paymentHandled, setPaymentHandled] = useState<Set<string>>(new Set())
  const [isCompleted, setIsCompleted] = useState(false)

  // Auto-continue after registration redirect
  const hasAutoSent = useRef(false)
  useEffect(() => {
    if (hasAutoSent.current) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('registered') === '1') {
      hasAutoSent.current = true
      window.history.replaceState({}, '', `/chat/${conversationId}`)
      // Short delay to let useChat initialize with messages
      setTimeout(() => {
        append({ role: 'user', content: 'Ich habe mich gerade registriert. Bitte zeige mir meine Suchergebnisse!' })
      }, 500)
    }
  }, [conversationId, append])

  const [freemiumResults, setFreemiumResults] = useState<PdfResult[]>(storedResults.length > 0 ? storedResults.slice(0, 3) : [])
  const [allResults, setAllResults] = useState<PdfResult[]>(storedResults)
  const [resultJobTitle, setResultJobTitle] = useState(storedResults[0]?.job_title || '')
  const [hasPaid, setHasPaid] = useState(searchPaid)

  // ─── Audio Mode ───
  const [audioMode, setAudioMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioModeRef = useRef(false)
  const recognitionRef = useRef<ReturnType<typeof Object> | null>(null)
  const lastSpokenIdRef = useRef('')
  const startListeningRef = useRef<() => void>(() => {})
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const [pendingAudioMsgId, setPendingAudioMsgId] = useState<string | null>(null)

  useEffect(() => { audioModeRef.current = audioMode }, [audioMode])

  // Auto-scroll
  useEffect(() => {
    const el = chatContainerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  // Auto-focus input
  useEffect(() => {
    if (!isLoading && !showPaymentModal && !isCompleted) {
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [isLoading, showPaymentModal, isCompleted])

  // Extract results from create_search tool invocations
  useEffect(() => {
    for (const message of messages) {
      if (message.role === 'assistant' && message.toolInvocations) {
        for (const invocation of message.toolInvocations) {
          if (invocation.toolName === 'create_search' && invocation.state === 'result' && invocation.result) {
            const result = invocation.result as { search_id: string; total_results: number; freemium_results: PdfResult[]; locked_results: PdfResult[] }
            setPaymentSearchId(result.search_id)
            setFreemiumResults(result.freemium_results || [])
            setAllResults([...(result.freemium_results || []), ...(result.locked_results || [])])
            setResultJobTitle(result.freemium_results?.[0]?.job_title || '')
          }
        }
      }
    }
  }, [messages])

  // Handle payment modal from create_payment tool
  useEffect(() => {
    for (const message of messages) {
      if (message.role === 'assistant' && message.toolInvocations) {
        for (const invocation of message.toolInvocations) {
          if (invocation.toolName === 'create_payment' && invocation.state === 'result' && invocation.result?.action === 'show_payment_modal' && !paymentHandled.has(invocation.result.search_id)) {
            setPaymentSearchId(invocation.result.search_id)
            setShowPaymentModal(true)
            setPaymentHandled(prev => new Set(prev).add(invocation.result.search_id))
          }
        }
      }
    }
  }, [messages, paymentHandled])

  // Save messages after AI response completes
  const prevLoadingRef = useRef(false)
  useEffect(() => {
    if (prevLoadingRef.current && !isLoading && messages.length > 0) {
      fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      }).catch(() => {})
    }
    prevLoadingRef.current = isLoading
  }, [isLoading, messages, conversationId])

  // ─── Audio Functions ───

  const doStartListening = useCallback(() => {
    if (typeof window === 'undefined') return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    try {
      const r = new SR()
      r.lang = 'de-DE'
      r.continuous = false
      r.interimResults = false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      r.onresult = (e: any) => {
        const t = e.results[0][0].transcript
        if (t.trim()) append({ role: 'user', content: t.trim() })
      }
      r.onend = () => setIsListening(false)
      r.onerror = () => setIsListening(false)
      recognitionRef.current = r
      r.start()
      setIsListening(true)
    } catch { /* browser does not support speech recognition */ }
  }, [append])

  useEffect(() => { startListeningRef.current = doStartListening }, [doStartListening])

  const doStopListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (recognitionRef.current as any)?.stop?.()
    recognitionRef.current = null
    setIsListening(false)
  }, [])

  const doSpeak = useCallback((text: string, autoListen = true, onAudioReady?: () => void) => {
    if (typeof window === 'undefined') return
    if (audioElRef.current) { audioElRef.current.pause(); audioElRef.current = null }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setIsSpeaking(true)

    fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
      .then(res => { if (!res.ok) throw new Error('TTS API error'); return res.blob() })
      .then(blob => {
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audioElRef.current = audio
        audio.onended = () => { setIsSpeaking(false); audioElRef.current = null; URL.revokeObjectURL(url); if (autoListen && audioModeRef.current) startListeningRef.current() }
        audio.onerror = () => { setIsSpeaking(false); audioElRef.current = null; URL.revokeObjectURL(url) }
        onAudioReady?.()
        audio.play().catch(() => { setIsSpeaking(false); audioElRef.current = null; URL.revokeObjectURL(url) })
      })
      .catch(() => {
        onAudioReady?.()
        if (!('speechSynthesis' in window)) { setIsSpeaking(false); return }
        const u = new SpeechSynthesisUtterance(text)
        u.lang = 'de-DE'
        u.rate = 1.05
        u.onend = () => { setIsSpeaking(false); if (autoListen && audioModeRef.current) startListeningRef.current() }
        window.speechSynthesis.speak(u)
      })
  }, [])

  useEffect(() => {
    if (!audioMode || isLoading) return
    const lastMsg = messages[messages.length - 1]
    if (!lastMsg || lastMsg.role !== 'assistant') return
    if (lastMsg.id === lastSpokenIdRef.current) return
    const visibleContent = getVisibleContent(lastMsg.content)
    if (!visibleContent) return
    lastSpokenIdRef.current = lastMsg.id
    setPendingAudioMsgId(lastMsg.id)
    const revealText = () => setPendingAudioMsgId(null)
    const lower = visibleContent.toLowerCase()
    if (lower.includes('email') || lower.includes('e-mail') || lower.includes('mailadresse')) {
      setAudioMode(false)
      doSpeak(visibleContent, false, revealText)
      return
    }
    doSpeak(visibleContent, true, revealText)
  }, [messages, isLoading, audioMode, doSpeak])

  useEffect(() => {
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recognitionRef.current as any)?.stop?.()
      if (audioElRef.current) { audioElRef.current.pause(); audioElRef.current = null }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [])

  const handleToggleAudio = useCallback(() => {
    if (audioMode) {
      setAudioMode(false)
      setPendingAudioMsgId(null)
      doStopListening()
      if (audioElRef.current) { audioElRef.current.pause(); audioElRef.current = null }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      setAudioMode(true)
      const lastBotMsg = [...messages].reverse().find(m => m.role === 'assistant')
      if (lastBotMsg) {
        const text = getVisibleContent(lastBotMsg.content)
        if (text) { lastSpokenIdRef.current = lastBotMsg.id; doSpeak(text) }
      } else {
        doStartListening()
      }
    }
  }, [audioMode, doStopListening, doStartListening, doSpeak, messages])

  const handlePaymentSuccess = useCallback(async () => {
    setShowPaymentModal(false)
    const searchId = paymentSearchId
    setHasPaid(true)
    setIsCompleted(true)

    // Mark conversation as completed
    fetch(`/api/conversations/${conversationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    }).catch(() => {})

    await append({
      role: 'user',
      content: `Die Stripe-Zahlung war erfolgreich! Alle Ergebnisse sind jetzt freigeschaltet.\n<!--PAYMENT_SUCCESS search_id=${searchId}-->\nBitte zeige mir jetzt alle Ergebnisse.`
    })

    onComplete()
  }, [paymentSearchId, append, conversationId, onComplete])

  const handleDownloadPdf = () => {
    const results = hasPaid ? allResults : freemiumResults
    if (results.length > 0) generateResultsPdf(results, resultJobTitle, hasPaid)
  }

  return (
    <div className="h-screen-safe bg-[#FDF8F0] text-[#1A1A2E] flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="flex-shrink-0 z-40 bg-[#FDF8F0]/80 backdrop-blur-xl border-b border-[#E8E0D4]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold italic text-[#1A1A2E] tracking-tight">pexible</Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/chat" className="flex items-center gap-1.5 text-sm font-medium text-[#4A5568] hover:text-[#1A1A2E] bg-white hover:bg-[#F9F5EE] border border-[#E8E0D4] px-3 py-2 rounded-xl transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <span className="hidden sm:inline">Meine Chats</span>
            </Link>
            {freemiumResults.length > 0 && (
              <button onClick={handleDownloadPdf} className="p-2 text-[#9CA3AF] hover:text-[#F5B731] transition-colors" title={hasPaid ? 'Alle Ergebnisse herunterladen' : 'Vorschau herunterladen'}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </button>
            )}
            {userName && (
              <div className="w-8 h-8 bg-gradient-to-br from-[#F5B731] to-[#E8930C] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <button onClick={() => signOut()} className="text-[#9CA3AF] hover:text-[#1A1A2E] transition-colors" title="Abmelden">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
            </button>
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
              Dein persönlicher <span className="text-[#F5B731]">Job-Makler</span>
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
              <div className="px-4 sm:px-5 py-3.5 border-b border-[#F0EBE2] flex items-center justify-between bg-[#FDFBF7]">
                <div className="flex items-center gap-3">
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
                {freemiumResults.length > 0 && (
                  <button onClick={handleDownloadPdf} className="p-2 text-[#9CA3AF] hover:text-[#F5B731] transition-colors rounded-lg hover:bg-[#F5EFE3]" title={hasPaid ? 'Alle Ergebnisse herunterladen' : 'Vorschau herunterladen'}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </button>
                )}
              </div>

              {/* Chat Messages */}
              <div ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-4 py-3 sm:py-4 bg-[#FEFCF9]">
                <div className="space-y-3">
                  {messages.map((message, idx) => {
                    const visibleContent = getVisibleContent(message.content)
                    if (!visibleContent) return null
                    const isLastMsg = idx === messages.length - 1
                    const isStreamingThis = isLoading && isLastMsg && message.role === 'assistant'
                    const isPendingAudio = message.id === pendingAudioMsgId
                    const hideForAudio = audioMode && (isStreamingThis || isPendingAudio)

                    return (
                      <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3.5 sm:px-4 py-2.5 text-sm leading-relaxed ${
                          message.role === 'user'
                            ? 'bg-[#F5B731] text-[#1A1A2E] font-medium rounded-tr-md'
                            : 'bg-[#F5F0E8] text-[#1A1A2E] rounded-tl-md'
                        }`}>
                          {hideForAudio ? (
                            <div className="flex space-x-1.5 py-0.5">
                              <div className="w-1.5 h-1.5 bg-[#F5B731] rounded-full animate-bounce" />
                              <div className="w-1.5 h-1.5 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                              <div className="w-1.5 h-1.5 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap break-words">{visibleContent}</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {/* Audio mode invitation */}
                  {messages.length <= 1 && !audioMode && (
                    <div className="flex justify-center mt-2">
                      <button onClick={handleToggleAudio} className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white hover:bg-[#F9F5EE] border border-[#E8E0D4] hover:border-[#F5B731]/30 rounded-xl transition-all text-sm text-[#6B7280] hover:text-[#1A1A2E] group shadow-sm">
                        <div className="w-8 h-8 bg-[#F5B731]/10 group-hover:bg-[#F5B731]/20 rounded-full flex items-center justify-center transition-colors">
                          <svg className="w-4 h-4 text-[#F5B731]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        </div>
                        Oder sprich direkt mit deinem Makler
                      </button>
                    </div>
                  )}
                  {isLoading && !audioMode && (
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

              {/* Chat Input / Audio Controls / Completed / Payment Required */}
              <div className="border-t border-[#F0EBE2] px-3 sm:px-4 py-2.5 sm:py-3 bg-white pb-safe">
                {/* Payment Required State - Lock chat after freemium results */}
                {paymentSearchId && !hasPaid && !isCompleted ? (
                  <div>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#F5B731] hover:bg-[#E8930C] rounded-xl text-sm font-semibold text-white transition-colors shadow-lg shadow-[#F5B731]/20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      Alle Ergebnisse für 49€ freischalten
                    </button>
                    <div className="flex gap-2 mt-2">
                      <input
                        disabled
                        placeholder="Zahlung erforderlich um fortzufahren"
                        className="flex-1 px-4 py-3 bg-[#F0EBE2] border border-[#E8E0D4] rounded-xl text-sm text-[#9CA3AF] placeholder-[#B8B0A4] cursor-not-allowed"
                      />
                      <button disabled className="px-4 py-3 bg-[#E8E0D4] text-[#B8B0A4] rounded-xl cursor-not-allowed flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </button>
                    </div>
                    <p className="text-xs text-center text-[#9CA3AF] mt-2">
                      Du hast bereits 3 kostenlose Ergebnisse erhalten. Schalte jetzt alle Treffer frei!
                    </p>
                  </div>
                ) : isCompleted ? (
                  <div>
                    <div className="flex gap-2">
                      <input
                        disabled
                        placeholder="Chat abgeschlossen"
                        className="flex-1 px-4 py-3 bg-[#F0EBE2] border border-[#E8E0D4] rounded-xl text-sm text-[#9CA3AF] placeholder-[#B8B0A4] cursor-not-allowed"
                      />
                      <button disabled className="px-4 py-3 bg-[#E8E0D4] text-[#B8B0A4] rounded-xl cursor-not-allowed flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2 text-xs text-[#9CA3AF]">
                      <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>Suche abgeschlossen</span>
                      <span className="mx-1">&bull;</span>
                      <Link href="/chat" className="font-semibold text-[#F5B731] hover:text-[#E8930C] transition-colors">Neue Suche starten</Link>
                    </div>
                  </div>
                ) : audioMode ? (
                  <div className="flex flex-col items-center py-1">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => { if (isListening) doStopListening(); else if (!isSpeaking && !isLoading) doStartListening() }}
                        disabled={isSpeaking || isLoading}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                          isListening ? 'bg-red-500 shadow-lg shadow-red-500/30 text-white'
                          : isSpeaking ? 'bg-[#F5B731]/20 text-[#F5B731]'
                          : 'bg-[#F5B731] text-white hover:bg-[#E8930C] shadow-lg shadow-[#F5B731]/20'
                        }`}
                      >
                        {isSpeaking ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke={isListening ? 'white' : 'currentColor'} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        )}
                      </button>
                    </div>
                    {isListening && (
                      <div className="flex items-center gap-[3px] mt-3 h-4">
                        {[0, 1, 2, 3, 4].map(i => (
                          <div key={i} className="w-[3px] bg-red-400 rounded-full animate-pulse" style={{ height: `${8 + Math.random() * 10}px`, animationDelay: `${i * 0.1}s`, animationDuration: '0.6s' }} />
                        ))}
                      </div>
                    )}
                    {isSpeaking && (
                      <div className="flex items-center gap-[3px] mt-3 h-4">
                        {[0, 1, 2, 3, 4].map(i => (
                          <div key={i} className="w-[3px] bg-[#F5B731] rounded-full animate-pulse" style={{ height: `${6 + Math.random() * 12}px`, animationDelay: `${i * 0.12}s`, animationDuration: '0.5s' }} />
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-[#9CA3AF] mt-2">
                      {isListening ? 'Ich h\u00f6re zu\u2026' : isSpeaking ? 'Makler spricht\u2026' : isLoading ? 'Antwort wird generiert\u2026' : 'Tippe auf das Mikrofon'}
                    </p>
                    <button onClick={handleToggleAudio} className="mt-2 text-xs text-[#9CA3AF] hover:text-[#4A5568] transition-colors underline underline-offset-2">
                      Zum Textchat wechseln
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        placeholder="z.B. Marketing Manager in Berlin..."
                        enterKeyHint="send"
                        autoComplete="off"
                        className="flex-1 px-4 py-3 min-h-[44px] bg-[#F9F5EE] border border-[#E8E0D4] rounded-xl text-[16px] sm:text-sm text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731]/30 transition-all"
                        disabled={isLoading}
                        autoFocus
                      />
                      <button type="button" onClick={handleToggleAudio} className="px-3 py-3 min-h-[44px] min-w-[44px] bg-[#F9F5EE] hover:bg-[#F5EFE3] border border-[#E8E0D4] rounded-xl transition-all flex-shrink-0 text-[#9CA3AF] hover:text-[#F5B731]" title="Sprachmodus">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      </button>
                      <button type="submit" disabled={isLoading || !input.trim()} className="px-4 py-3 min-h-[44px] min-w-[44px] bg-[#F5B731] hover:bg-[#E8930C] disabled:bg-[#F5EFE3] disabled:text-[#9CA3AF] text-white font-semibold rounded-xl transition-all flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                      </button>
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

      {/* Payment Modal */}
      <PaymentModal isOpen={showPaymentModal} searchId={paymentSearchId} onClose={() => setShowPaymentModal(false)} onSuccess={handlePaymentSuccess} />
    </div>
  )
}
