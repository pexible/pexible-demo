'use client'

import { useChat } from 'ai/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

// ─── Types ───

interface RegistrationData {
  email: string
  first_name: string
  job_title: string
  postal_code: string
}

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
  const rows = results.map((r, i) =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${i + 1}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;">${r.company_name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${r.job_title}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;"><a href="${r.job_url}" style="color:#2563eb;">${r.job_url}</a></td>
      ${r.description ? `<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;">${r.description}</td>` : ''}
    </tr>`
  ).join('')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title} - pexible</title></head>
<body style="font-family:Arial,sans-serif;max-width:900px;margin:0 auto;padding:40px 20px;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;border-bottom:2px solid #F5B731;padding-bottom:16px;">
    <h1 style="margin:0;color:#111;font-size:24px;font-style:italic;">pexible</h1>
    <span style="color:#6b7280;font-size:14px;">${date}</span>
  </div>
  <h2 style="color:#111;font-size:18px;margin-bottom:4px;">${title}</h2>
  <p style="color:#6b7280;font-size:14px;margin-bottom:24px;">Suche: ${jobTitle} &bull; ${results.length} Treffer</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <thead><tr style="background:#f9fafb;">
      <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">#</th>
      <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Unternehmen</th>
      <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Stelle</th>
      <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Link</th>
      ${results[0]?.description ? '<th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Details</th>' : ''}
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="margin-top:32px;font-size:12px;color:#9ca3af;text-align:center;">Erstellt von pexible.de &bull; Dein Job-Makler</p>
</body></html>`
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pexible-ergebnisse-${isComplete ? 'komplett' : 'vorschau'}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Registration Modal ───

function RegistrationModal({ isOpen, data, onClose, onSuccess }: {
  isOpen: boolean
  data: RegistrationData | null
  onClose: () => void
  onSuccess: (result: { search_id: string; first_name: string; total_results: number; results: Array<{ company_name: string; job_title: string; job_url: string; description: string }> }) => void
}) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Passwort muss mindestens 8 Zeichen haben'); return }
    if (password !== confirmPassword) { setError('Passw\u00f6rter stimmen nicht \u00fcberein'); return }
    if (!data) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, password })
      })
      const result = await response.json()
      if (!result.success) { setError(result.error || 'Fehler bei der Registrierung'); setIsLoading(false); return }
      onSuccess({ search_id: result.search_id, first_name: result.first_name, total_results: result.total_results, results: result.results })
      setPassword('')
      setConfirmPassword('')
    } catch { setError('Netzwerkfehler. Bitte versuche es erneut.') } finally { setIsLoading(false) }
  }

  if (!isOpen || !data) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-[#1a1a24] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#F5B731]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#F5B731]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-white">Sichere Registrierung</h2>
          <p className="text-sm text-gray-400 mt-1">Erstelle dein Passwort, um deine Jobsuche zu starten</p>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Deine Suchdaten:</h3>
          <div className="space-y-1 text-sm text-gray-400">
            <p><span className="font-medium text-gray-300">Stelle:</span> {data.job_title}</p>
            <p><span className="font-medium text-gray-300">PLZ:</span> {data.postal_code}</p>
            <p><span className="font-medium text-gray-300">Name:</span> {data.first_name}</p>
            <p><span className="font-medium text-gray-300">Email:</span> {data.email}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Passwort</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5B731]/50 focus:border-[#F5B731]/30 transition-all" placeholder="Mindestens 8 Zeichen" required minLength={8} />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Passwort best&auml;tigen</label>
            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5B731]/50 focus:border-[#F5B731]/30 transition-all" placeholder="Passwort wiederholen" required minLength={8} />
          </div>
          {error && <div className="bg-red-500/10 text-red-400 border border-red-500/20 text-sm p-3 rounded-xl">{error}</div>}
          <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#F5B731] hover:bg-[#e5a820] disabled:bg-white/10 disabled:text-gray-600 text-black font-semibold rounded-xl transition-colors">
            {isLoading ? 'Wird erstellt...' : 'Account erstellen & Suche starten'}
          </button>
        </form>
        <p className="text-xs text-gray-500 text-center mt-4">Mit der Registrierung akzeptierst du unsere AGB und Datenschutzrichtlinien.</p>
      </div>
    </div>
  )
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
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({ elements, confirmParams: { return_url: window.location.href }, redirect: 'if_required' })
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
      <button type="submit" disabled={isProcessing || !stripe || !elements} className="w-full py-3 bg-[#F5B731] hover:bg-[#e5a820] disabled:bg-white/10 disabled:text-gray-600 text-black font-semibold rounded-xl transition-colors">
        {isProcessing ? 'Wird verarbeitet...' : '49,00 \u20AC bezahlen'}
      </button>
      <button type="button" onClick={onCancel} disabled={isProcessing} className="w-full py-2 text-gray-400 hover:text-gray-200 text-sm font-medium transition-colors">Abbrechen</button>
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-[#1a1a24] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-white">Alle Ergebnisse freischalten</h2>
          <p className="text-sm text-gray-400 mt-1">Sichere Zahlung &uuml;ber Stripe</p>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-6">
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

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hey! Ich bin dein pers\u00f6nlicher Job-Makler von pexible. Ich helfe dir, passende Stellen zu finden \u2013 auch solche, die nicht auf den gro\u00dfen Jobportalen stehen.\n\nIn welchem Bereich bist du auf der Suche?',
      },
    ],
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [showModal, setShowModal] = useState(false)
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentSearchId, setPaymentSearchId] = useState<string | null>(null)
  const [paymentHandled, setPaymentHandled] = useState<Set<string>>(new Set())

  const [loggedInUser, setLoggedInUser] = useState<string | null>(null)
  const [freemiumResults, setFreemiumResults] = useState<PdfResult[]>([])
  const [allResults, setAllResults] = useState<PdfResult[]>([])
  const [resultJobTitle, setResultJobTitle] = useState('')
  const [hasPaid, setHasPaid] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!isLoading && !showModal && !showPaymentModal) {
      inputRef.current?.focus()
    }
  }, [isLoading, showModal, showPaymentModal])

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'assistant' && lastMessage.toolInvocations) {
      for (const invocation of lastMessage.toolInvocations) {
        if (invocation.toolName === 'request_registration' && invocation.state === 'result' && invocation.result?.action === 'show_registration_modal') {
          setRegistrationData(invocation.result.data)
          setShowModal(true)
        }
      }
    }
  }, [messages])

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

  const handleRegistrationSuccess = async (result: { search_id: string; first_name: string; total_results: number; results: Array<{ company_name: string; job_title: string; job_url: string; description: string }> }) => {
    setShowModal(false)
    setRegistrationData(null)
    setLoggedInUser(result.first_name)
    const freemium = result.results.slice(0, 3)
    const locked = result.results.slice(3)
    setFreemiumResults(freemium)
    setAllResults(result.results)
    setResultJobTitle(freemium[0]?.job_title || '')
    const freemiumText = freemium.map((r, i) => `${i + 1}. ${r.company_name} - ${r.job_title} (${r.job_url})`).join('\n')
    const lockedText = locked.map((r, i) => `${i + 4}. ${r.company_name} - ${r.job_title} (${r.job_url}) - ${r.description}`).join('\n')
    await append({
      role: 'user',
      content: `Meine Registrierung war erfolgreich! Bitte zeige mir meine Ergebnisse.\n<!--RESULTS_DATA\nSearch-ID: ${result.search_id}\nSUCHERGEBNISSE (${result.total_results} Treffer gefunden):\n\nKostenlose Vorschau (3 von ${result.total_results}):\n${freemiumText}\n\nGESPERRTE ERGEBNISSE (nur nach Zahlung anzeigen):\n${lockedText}\n\nZeige die 3 kostenlosen Ergebnisse und biete an, die restlichen ${locked.length} Treffer f\u00fcr 49\u20AC freizuschalten. Zeige die gesperrten Ergebnisse ERST nach erfolgreicher Zahlung \u00fcber create_payment.\nRESULTS_DATA-->`
    })
  }

  const handlePaymentSuccess = useCallback(async () => {
    setShowPaymentModal(false)
    const searchId = paymentSearchId
    setPaymentSearchId(null)
    setHasPaid(true)
    await append({
      role: 'user',
      content: `Die Stripe-Zahlung war erfolgreich! Alle Ergebnisse sind jetzt freigeschaltet.\n<!--PAYMENT_SUCCESS search_id=${searchId}-->\nBitte zeige mir jetzt alle Ergebnisse aus der urspr\u00fcnglichen Suche, inklusive aller gesperrten Ergebnisse mit Firmennamen, Jobtitel, URL und Beschreibung.`
    })
  }, [paymentSearchId, append])

  const handleDownloadPdf = () => {
    const results = hasPaid ? allResults : freemiumResults
    if (results.length > 0) generateResultsPdf(results, resultJobTitle, hasPaid)
  }

  return (
    <div className="min-h-screen bg-[#08080e] text-white">

      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-40 bg-[#08080e]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold italic text-white tracking-tight">pexible</span>
          <div className="flex items-center gap-3">
            {freemiumResults.length > 0 && (
              <button onClick={handleDownloadPdf} className="p-2 text-gray-500 hover:text-[#F5B731] transition-colors" title={hasPaid ? 'Alle Ergebnisse herunterladen' : 'Vorschau herunterladen'}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </button>
            )}
            {loggedInUser ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#F5B731] rounded-full flex items-center justify-center text-black text-sm font-bold">
                  {loggedInUser.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-300 hidden sm:inline">{loggedInUser}</span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero Section with Chat ─── */}
      <section className="relative px-4 pt-10 sm:pt-16 pb-16 sm:pb-24 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#F5B731]/[0.07] rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-100px] left-[-200px] w-[500px] h-[500px] bg-purple-600/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[100px] right-[-200px] w-[400px] h-[400px] bg-blue-600/[0.03] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-2xl mx-auto relative">
          {/* Headline */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 mb-6">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              KI-gest&uuml;tzte Jobsuche &ndash; jetzt live
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
              Entdecke Jobs, die{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5B731] to-[#f0d078]">andere nicht sehen</span>
            </h1>
            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-gray-400 max-w-lg mx-auto leading-relaxed">
              Starte jetzt deine Suche &ndash; direkt hier im Chat. Unser KI-Makler findet Stellen auf tausenden Karriere-Websites.
            </p>
          </div>

          {/* ─── Chat Card (Hero Element) ─── */}
          <div className="relative">
            {/* Glow border */}
            <div className="absolute -inset-px bg-gradient-to-b from-[#F5B731]/25 via-[#F5B731]/5 to-transparent rounded-[1.25rem] pointer-events-none" />

            <div className="relative bg-[#111118]/95 backdrop-blur-xl rounded-[1.25rem] overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/50">
              {/* Chat Header */}
              <div className="px-4 sm:px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-[#F5B731] to-[#e5a820] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#F5B731]/20">
                    <svg className="w-4.5 h-4.5 text-black" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm tracking-tight">pexible Job-Makler</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-500">Online</span>
                    </div>
                  </div>
                </div>
                {freemiumResults.length > 0 && (
                  <button onClick={handleDownloadPdf} className="p-2 text-gray-500 hover:text-[#F5B731] transition-colors rounded-lg hover:bg-white/5" title={hasPaid ? 'Alle Ergebnisse herunterladen' : 'Vorschau herunterladen'}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </button>
                )}
              </div>

              {/* Chat Messages */}
              <div className="h-[350px] sm:h-[420px] overflow-y-auto px-4 py-4 scroll-smooth">
                <div className="space-y-3">
                  {messages.map((message) => {
                    const visibleContent = getVisibleContent(message.content)
                    if (!visibleContent) return null
                    return (
                      <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          message.role === 'user'
                            ? 'bg-[#F5B731] text-black'
                            : 'bg-white/[0.05] text-gray-200 border border-white/[0.06]'
                        }`}>
                          <div className="whitespace-pre-wrap break-words">{visibleContent}</div>
                        </div>
                      </div>
                    )
                  })}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/[0.05] border border-white/[0.06] rounded-2xl px-4 py-3">
                        <div className="flex space-x-1.5">
                          <div className="w-1.5 h-1.5 bg-[#F5B731] rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                          <div className="w-1.5 h-1.5 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Chat Input */}
              <div className="border-t border-white/[0.06] px-3 sm:px-4 py-3 bg-[#0c0c14]/60">
                <form onSubmit={handleSubmit}>
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={handleInputChange}
                      placeholder="z.B. Marketing Manager in Berlin..."
                      className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731]/30 transition-all"
                      disabled={isLoading}
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="px-4 py-3 bg-[#F5B731] hover:bg-[#e5a820] disabled:bg-white/[0.04] disabled:text-gray-600 text-black font-semibold rounded-xl transition-all flex-shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Trust badges below chat */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <span>SSL-verschl&uuml;sselt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#F5B731]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span>KI-gest&uuml;tzt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              <span>Stripe-Zahlung</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="px-4 py-16 sm:py-24 max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight tracking-tight">
            So findest du Stellen,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5B731] to-[#f0d078]">die andere &uuml;bersehen</span>
          </h2>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto text-sm sm:text-base">Unsere KI-Agenten durchsuchen tausende Karriereseiten &ndash; schneller und gr&uuml;ndlicher als jedes Jobportal.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {[
            {
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
              title: 'Direkt bei Unternehmen suchen',
              text: 'Unsere Suche beginnt direkt auf tausenden Karriere-Websites \u2014 ohne Umwege \u00fcber Portale.',
            },
            {
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>,
              title: 'KI-Agenten arbeiten f\u00fcr dich',
              text: 'Unsere spezialisierten Agenten lesen Seiten wie ein Mensch und finden auch verborgene Hinweise.',
            },
            {
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
              title: 'Individuelle Empfehlungen',
              text: 'Du erh\u00e4ltst nur Jobs, die wirklich zu deinem Profil passen \u2014 keine irrelevanten Anzeigen.',
            },
            {
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
              title: 'Schneller zum Erfolg',
              text: 'Offene Stellen, bevor sie woanders erscheinen \u2014 erh\u00f6he deine Chancen auf Zusagen.',
            },
          ].map((f, i) => (
            <div key={i} className="group bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 sm:p-6 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300">
              <div className="w-10 h-10 bg-[#F5B731]/10 rounded-xl flex items-center justify-center mb-4 text-[#F5B731] group-hover:bg-[#F5B731]/20 transition-colors duration-300">
                {f.icon}
              </div>
              <h3 className="font-bold text-white mb-1.5 tracking-tight">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="px-4 py-16 sm:py-24 max-w-4xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Echte Erfolgsgeschichten
          </h2>
          <p className="mt-3 text-gray-500 text-sm sm:text-base">Was unsere Nutzer sagen.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: 'Julia M.', role: 'Marketing Managerin, Leipzig', quote: '\u201eIch hatte monatelang nichts gefunden, dann hat Pexible mir 9 Firmen geschickt, von denen ich noch nie geh\u00f6rt hatte. Zwei Wochen sp\u00e4ter sa\u00df ich im Bewerbungsgespr\u00e4ch.\u201c' },
            { name: 'Samir R.', role: 'IT-Spezialist, Berlin', quote: '\u201eIch war skeptisch, aber der Agent hat tats\u00e4chlich 12 neue Unternehmen gefunden, die genau zu meinem Profil passen. 5 Bewerbungen \u2013 3 R\u00fcckmeldungen in nur einer Woche!\u201c' },
          ].map((t, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#F5B731]/30 to-[#F5B731]/10 rounded-full flex items-center justify-center text-sm font-bold text-[#F5B731]">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{t.quote}</p>
              <div className="flex gap-0.5 mt-4">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="w-4 h-4 text-[#F5B731]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="px-4 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
            Bereit, deinen Traumjob zu finden?
          </h2>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">Scrolle nach oben und starte deine pers&ouml;nliche Jobsuche im Chat.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#F5B731] hover:bg-[#e5a820] text-black font-semibold rounded-xl transition-all text-sm shadow-lg shadow-[#F5B731]/20 hover:shadow-[#F5B731]/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            Zum Chat
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 px-6 py-8 text-center">
        <p className="italic text-lg font-bold text-white tracking-tight mb-1">pexible</p>
        <p className="text-sm text-gray-500">Dein Job-Makler &bull; KI-gest&uuml;tzte Jobsuche direkt auf Karriereseiten</p>
      </footer>

      {/* ─── Modals ─── */}
      <RegistrationModal isOpen={showModal} data={registrationData} onClose={() => { setShowModal(false); setRegistrationData(null) }} onSuccess={handleRegistrationSuccess} />
      <PaymentModal isOpen={showPaymentModal} searchId={paymentSearchId} onClose={() => { setShowPaymentModal(false); setPaymentSearchId(null) }} onSuccess={handlePaymentSuccess} />
    </div>
  )
}
