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

// ─── PDF Generation ───

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
    if (password !== confirmPassword) { setError('Passwörter stimmen nicht überein'); return }
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Sichere Registrierung</h2>
          <p className="text-sm text-gray-600 mt-1">Erstelle dein Passwort, um deine Jobsuche zu starten</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Deine Suchdaten:</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Stelle:</span> {data.job_title}</p>
            <p><span className="font-medium">PLZ:</span> {data.postal_code}</p>
            <p><span className="font-medium">Name:</span> {data.first_name}</p>
            <p><span className="font-medium">Email:</span> {data.email}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Mindestens 8 Zeichen" required minLength={8} />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Passwort bestätigen</label>
            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Passwort wiederholen" required minLength={8} />
          </div>
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
          <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#F5B731] hover:bg-[#e5a820] disabled:bg-gray-300 text-black font-semibold rounded-full transition-colors">
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
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
      <button type="submit" disabled={isProcessing || !stripe || !elements} className="w-full py-3 bg-[#F5B731] hover:bg-[#e5a820] disabled:bg-gray-300 text-black font-semibold rounded-full transition-colors">
        {isProcessing ? 'Wird verarbeitet...' : '49,00 \u20AC bezahlen'}
      </button>
      <button type="button" onClick={onCancel} disabled={isProcessing} className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors">Abbrechen</button>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Alle Ergebnisse freischalten</h2>
          <p className="text-sm text-gray-600 mt-1">Sichere Zahlung &uuml;ber Stripe</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700 font-medium">Alle Suchergebnisse</span>
            <span className="text-lg font-bold text-gray-900">49,00 &euro;</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Einmalige Zahlung - kein Abo</p>
        </div>
        {loadError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{loadError}</div>}
        {!clientSecret && !loadError && (
          <div className="flex justify-center py-8">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
        {clientSecret && stripePromise && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#F5B731', borderRadius: '8px' } } }}>
            <CheckoutForm searchId={searchId} onSuccess={onSuccess} onCancel={onClose} />
          </Elements>
        )}
        <p className="text-xs text-gray-500 text-center mt-4">Sichere Zahlungsabwicklung durch Stripe.</p>
      </div>
    </div>
  )
}

// ─── Website Landing Sections ───

function LandingPage({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-6 pt-16 pb-20 max-w-4xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-black leading-tight tracking-tight">
          Entdecke Jobs, die<br />andere nicht sehen
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Finde mehr offene Stellen, bewirb dich gezielter und sichere dir schneller deinen Traumjob &ndash; mit der KI-Plattform, die versteckte Jobchancen sichtbar macht.
        </p>
        <button onClick={onOpenChat} className="mt-10 px-10 py-4 bg-[#F5B731] hover:bg-[#e5a820] text-black font-semibold text-lg rounded-full transition-colors shadow-lg shadow-amber-200/50">
          Jetzt Job-Suche starten f&uuml;r 49&euro;
        </button>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-black leading-tight mb-10">
              So findest du<br />Stellen, die andere<br />&uuml;bersehen
            </h2>
            <div className="space-y-6">
              {[
                { title: 'Direkt bei Unternehmen suchen:', text: 'Unsere Suche beginnt direkt auf tausenden Karriere-Websites \u2014 ohne Umwege \u00fcber Portale.' },
                { title: 'KI-Agenten arbeiten f\u00fcr dich:', text: 'Unsere spezialisierten Agenten lesen Seiten wie ein Mensch und finden auch verborgene Hinweise.' },
                { title: 'Individuelle Empfehlungen:', text: 'Du erh\u00e4ltst nur Jobs, die wirklich zu deinem Profil passen \u2014 keine irrelevanten Anzeigen.' },
                { title: 'Schneller zum Erfolg:', text: 'Offene Stellen, bevor sie woanders erscheinen \u2014 erh\u00f6he deine Chancen auf Zusagen.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0 mt-0.5">&#9989;</span>
                  <div>
                    <p className="font-bold text-black">{item.title}</p>
                    <p className="text-gray-600">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={onOpenChat} className="mt-8 px-8 py-3 bg-[#F5B731] hover:bg-[#e5a820] text-black font-semibold rounded-full transition-colors">
              Starte jetzt deine Suche
            </button>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="bg-gray-100 rounded-3xl p-8 w-72 h-[480px] flex flex-col items-center justify-center relative">
              <div className="w-56 h-96 bg-black rounded-[2rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-gradient-to-b from-sky-100 to-orange-100 rounded-[1.5rem] flex flex-col items-center justify-end pb-8">
                  <div className="bg-white rounded-xl shadow-lg p-3 mx-4 mb-4 text-xs">
                    <p className="font-bold text-black">pexible</p>
                    <p className="text-gray-600 mt-1">Dein neuer Job-Report ist fertig. Wir haben 12 neue Jobs f&uuml;r dich gefunden.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-black leading-tight mb-16">
          Echte Suchergebnisse.<br />Echte Erfolgsgeschichten.
        </h2>
        <div className="grid sm:grid-cols-2 gap-12">
          {[
            { name: 'Julia M.', role: 'Marketing Managerin aus Leipzig', quote: '\u201eIch hatte monatelang nichts gefunden, dann hat Pexible mir 9 Firmen geschickt, von denen ich noch nie geh\u00f6rt hatte. Zwei Wochen sp\u00e4ter sa\u00df ich im Bewerbungsgespr\u00e4ch.\u201c' },
            { name: 'Samir R.', role: 'IT-Spezialist aus Berlin', quote: '\u201eIch war skeptisch, aber der Agent hat tats\u00e4chlich 12 neue Unternehmen gefunden, die genau zu meinem Profil passen. 5 Bewerbungen \u2013 3 R\u00fcckmeldungen in nur einer Woche!\u201c' },
          ].map((t, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full mb-4"></div>
              <p className="font-bold text-black">{t.name}</p>
              <p className="text-sm text-gray-500 mb-4">{t.role}</p>
              <p className="text-gray-700 leading-relaxed italic">{t.quote}</p>
            </div>
          ))}
        </div>
        <button onClick={onOpenChat} className="mt-12 px-10 py-4 bg-[#F5B731] hover:bg-[#e5a820] text-black font-semibold text-lg rounded-full transition-colors shadow-lg shadow-amber-200/50">
          Selber entdecken
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8 text-center text-sm text-gray-500">
        <p className="italic text-lg font-semibold text-black mb-2">pexible</p>
        <p>Dein Job-Makler &bull; KI-gest&uuml;tzte Jobsuche direkt auf Karriereseiten</p>
      </footer>
    </div>
  )
}

// ─── Main Page ───

export default function ChatPage() {
  const [chatOpen, setChatOpen] = useState(false)

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
    if (!isLoading && chatOpen && !showModal && !showPaymentModal) {
      inputRef.current?.focus()
    }
  }, [isLoading, chatOpen, showModal, showPaymentModal])

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
      content: `Meine Registrierung war erfolgreich! Bitte zeige mir meine Ergebnisse.\n<!--RESULTS_DATA\nSearch-ID: ${result.search_id}\nSUCHERGEBNISSE (${result.total_results} Treffer gefunden):\n\nKostenlose Vorschau (3 von ${result.total_results}):\n${freemiumText}\n\nGESPERRTE ERGEBNISSE (nur nach Zahlung anzeigen):\n${lockedText}\n\nZeige die 3 kostenlosen Ergebnisse und biete an, die restlichen ${locked.length} Treffer für 49€ freizuschalten. Zeige die gesperrten Ergebnisse ERST nach erfolgreicher Zahlung über create_payment.\nRESULTS_DATA-->`
    })
  }

  const handlePaymentSuccess = useCallback(async () => {
    setShowPaymentModal(false)
    const searchId = paymentSearchId
    setPaymentSearchId(null)
    setHasPaid(true)
    await append({
      role: 'user',
      content: `Die Stripe-Zahlung war erfolgreich! Alle Ergebnisse sind jetzt freigeschaltet.\n<!--PAYMENT_SUCCESS search_id=${searchId}-->\nBitte zeige mir jetzt alle Ergebnisse aus der ursprünglichen Suche, inklusive aller gesperrten Ergebnisse mit Firmennamen, Jobtitel, URL und Beschreibung.`
    })
  }, [paymentSearchId, append])

  const handleDownloadPdf = () => {
    const results = hasPaid ? allResults : freemiumResults
    if (results.length > 0) generateResultsPdf(results, resultJobTitle, hasPaid)
  }

  const getVisibleContent = (content: string) => {
    if (content.includes('<!--RESULTS_DATA')) return content.split('<!--RESULTS_DATA')[0].trim()
    if (content.includes('<!--PAYMENT_SUCCESS')) return content.split('<!--PAYMENT_SUCCESS')[0].trim()
    return content
  }

  const openChat = () => setChatOpen(true)

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-semibold italic text-black cursor-pointer" onClick={() => setChatOpen(false)}>pexible</span>
          <div className="flex items-center gap-4">
            {freemiumResults.length > 0 && (
              <button onClick={handleDownloadPdf} className="text-gray-600 hover:text-black transition-colors" title="Ergebnisse herunterladen">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </button>
            )}
            {loggedInUser ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#F5B731] rounded-full flex items-center justify-center text-black text-sm font-bold">
                  {loggedInUser.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">{loggedInUser}</span>
              </div>
            ) : (
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            )}
            <button onClick={openChat} className="px-5 py-2 bg-[#F5B731] hover:bg-[#e5a820] text-black font-semibold rounded-full transition-colors text-sm">
              Jobs finden
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Landing Page Content ─── */}
      <LandingPage onOpenChat={openChat} />

      {/* ─── Floating Chat Button ─── */}
      {!chatOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#F5B731] hover:bg-[#e5a820] text-black rounded-full shadow-lg shadow-amber-300/50 flex items-center justify-center transition-all hover:scale-105"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </button>
      )}

      {/* ─── Chat Slide-in Panel ─── */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${chatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#F5B731] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <div>
                <p className="font-semibold text-black text-sm italic">pexible</p>
                <p className="text-xs text-gray-500">Dein Job-Makler</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {freemiumResults.length > 0 && (
                <button onClick={handleDownloadPdf} className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title={hasPaid ? 'Alle Ergebnisse herunterladen' : 'Vorschau herunterladen'}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </button>
              )}
              <button onClick={() => setChatOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-3">
              {messages.map((message) => {
                const visibleContent = getVisibleContent(message.content)
                if (!visibleContent) return null
                return (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-[#F5B731] text-black'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="whitespace-pre-wrap break-words">{visibleContent}</div>
                    </div>
                  </div>
                )
              })}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t bg-white px-4 py-3">
            <form onSubmit={handleSubmit}>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Schreibe eine Nachricht..."
                  className="flex-1 px-4 py-2.5 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  disabled={isLoading}
                  autoFocus
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="px-4 py-2.5 bg-[#F5B731] hover:bg-[#e5a820] disabled:bg-gray-200 text-black font-medium rounded-full transition-colors text-sm">
                  Senden
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Overlay when chat is open on mobile */}
      {chatOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 sm:block hidden" onClick={() => setChatOpen(false)} />
      )}

      {/* ─── Modals ─── */}
      <RegistrationModal isOpen={showModal} data={registrationData} onClose={() => { setShowModal(false); setRegistrationData(null) }} onSuccess={handleRegistrationSuccess} />
      <PaymentModal isOpen={showPaymentModal} searchId={paymentSearchId} onClose={() => { setShowPaymentModal(false); setPaymentSearchId(null) }} onSuccess={handlePaymentSuccess} />
    </div>
  )
}
