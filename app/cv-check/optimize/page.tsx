'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useUser } from '@/lib/hooks/useUser'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

// --- Checkout Form ---

function CheckoutForm({ onSuccess }: { onSuccess: (paymentIntentId: string) => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [consentDataProcessing, setConsentDataProcessing] = useState(false)
  const [consentWithdrawal, setConsentWithdrawal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    if (!consentDataProcessing || !consentWithdrawal) {
      setError('Bitte stimme beiden Bedingungen zu, um fortzufahren.')
      return
    }

    setProcessing(true)
    setError(null)

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (submitError) {
      setError(submitError.message || 'Zahlung fehlgeschlagen.')
      setProcessing(false)
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id)
    } else {
      setError('Unerwarteter Zahlungsstatus.')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />

      {/* Consent checkboxes */}
      <div className="space-y-3 mt-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentDataProcessing}
            onChange={(e) => setConsentDataProcessing(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-white/20 accent-[#F5B731]"
          />
          <span className="text-xs text-white/60 leading-relaxed">
            Ich stimme zu, dass mein anonymisierter Lebenslauf zur Optimierung an einen
            KI-Dienst übermittelt wird.{' '}
            <Link href="/datenschutz" target="_blank" className="text-[#F5B731] hover:text-[#E8930C]">
              Datenschutzhinweise
            </Link>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentWithdrawal}
            onChange={(e) => setConsentWithdrawal(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-white/20 accent-[#F5B731]"
          />
          <span className="text-xs text-white/60 leading-relaxed">
            Ich stimme der sofortigen Bereitstellung der digitalen Inhalte zu und weiß,
            dass ich damit mein Widerrufsrecht verliere (§ 356 Abs. 5 BGB).
          </span>
        </label>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing || !consentDataProcessing || !consentWithdrawal}
        className="w-full bg-[#F5B731] hover:bg-[#E8930C] disabled:opacity-50 disabled:cursor-not-allowed text-[#1A1A2E] font-semibold text-sm py-3 rounded-xl transition-colors"
      >
        {processing ? 'Wird verarbeitet...' : 'Jetzt 3,99 € bezahlen'}
      </button>
    </form>
  )
}

// --- Optimization Progress ---

function OptimizationProgress({ phase }: { phase: string }) {
  const phases = [
    { key: 'optimizing', label: 'Dein Lebenslauf wird optimiert...' },
    { key: 'formulating', label: 'Formulierungen werden überarbeitet...' },
    { key: 'creating', label: 'Dokumente werden erstellt...' },
    { key: 'finishing', label: 'Fast fertig...' },
  ]

  const currentIndex = phases.findIndex((p) => p.key === phase)

  return (
    <div className="flex flex-col items-center py-12">
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-[#E8E0D4]" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#F5B731] animate-spin" />
      </div>

      <div className="space-y-3 w-full max-w-xs">
        {phases.map((p, i) => {
          const isActive = p.key === phase
          const isDone = currentIndex > i

          return (
            <div key={p.key} className="flex items-center gap-3">
              {isDone ? (
                <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : isActive ? (
                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F5B731] animate-pulse" />
                </div>
              ) : (
                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#D1C9BD]" />
                </div>
              )}
              <span className={`text-sm ${isActive ? 'text-[#1A1A2E] font-medium' : isDone ? 'text-[#9CA3AF]' : 'text-[#D1C9BD]'}`}>
                {p.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --- Main Content (needs Suspense for useSearchParams) ---

function OptimizeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isLoading: userLoading } = useUser()

  const token = searchParams.get('token')
  const originalScore = parseInt(searchParams.get('score') || '0', 10)

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [tokenExpired, setTokenExpired] = useState(false)
  const [optimizationPhase, setOptimizationPhase] = useState<string | null>(null)
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResultData | null>(null)
  const [optimizationError, setOptimizationError] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      const returnUrl = `/cv-check/optimize?token=${token}&score=${originalScore}`
      router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`)
    }
  }, [user, userLoading, router, token, originalScore])

  // Create checkout session when user is authenticated
  useEffect(() => {
    if (!user || !token || clientSecret) return

    async function createCheckout() {
      try {
        const res = await fetch('/api/cv-check/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cv_text_token: token,
            original_score: { total: originalScore },
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          if (res.status === 410) {
            setTokenExpired(true)
          }
          setPaymentError(data.error || 'Fehler beim Erstellen der Zahlung.')
          return
        }

        const data = await res.json()
        setClientSecret(data.clientSecret)
      } catch {
        setPaymentError('Netzwerkfehler. Bitte versuche es erneut.')
      }
    }

    createCheckout()
  }, [user, token, originalScore, clientSecret])

  const handlePaymentSuccess = useCallback(async (paymentIntentId: string) => {
    setOptimizationPhase('optimizing')

    const phaseTimers: NodeJS.Timeout[] = []
    phaseTimers.push(setTimeout(() => setOptimizationPhase('formulating'), 5000))
    phaseTimers.push(setTimeout(() => setOptimizationPhase('creating'), 15000))
    phaseTimers.push(setTimeout(() => setOptimizationPhase('finishing'), 25000))

    try {
      const res = await fetch('/api/cv-check/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          cv_text_token: token,
          original_score_data: { total: originalScore },
        }),
      })

      phaseTimers.forEach(clearTimeout)

      if (!res.ok) {
        const data = await res.json()
        setOptimizationError(data.error || 'Fehler bei der Optimierung.')
        setOptimizationPhase(null)
        return
      }

      const data: OptimizationResultData = await res.json()
      // Redirect to persistent result page instead of showing inline
      router.push(`/cv-check/result/${data.id}`)
    } catch {
      phaseTimers.forEach(clearTimeout)
      setOptimizationError('Netzwerkfehler bei der Optimierung.')
      setOptimizationPhase(null)
    }
  }, [token, originalScore])

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#E8E0D4] border-t-[#F5B731] rounded-full animate-spin" />
      </div>
    )
  }

  if (!token) {
    return (
      <div className="text-center py-20">
        <p className="text-[#4A5568] mb-4">Kein CV-Token gefunden. Bitte starte mit einem CV-Check.</p>
        <Link href="/cv-check" className="text-[#F5B731] hover:text-[#E8930C] font-medium">
          Zum CV-Check →
        </Link>
      </div>
    )
  }

  // Show optimization results
  if (optimizationResult) {
    return <OptimizationResults data={optimizationResult} originalScore={originalScore} />
  }

  // Show optimization progress
  if (optimizationPhase) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl border border-[#E8E0D4]/80 shadow-xl shadow-black/5 p-6 sm:p-8">
          <OptimizationProgress phase={optimizationPhase} />
        </div>
      </div>
    )
  }

  // Show error
  if (optimizationError) {
    return (
      <div className="max-w-xl mx-auto text-center py-10">
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-6 py-4 text-sm mb-4">
          {optimizationError}
        </div>
        <Link href="/cv-check" className="text-[#F5B731] hover:text-[#E8930C] font-medium text-sm">
          Zurück zum CV-Check
        </Link>
      </div>
    )
  }

  // Show payment form
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-[#1a1a24] rounded-2xl border border-white/10 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-2">CV-Optimierung</h2>
        <p className="text-sm text-white/60 mb-6">
          Dein Lebenslauf wird von unserer KI komplett überarbeitet. Du erhältst ein
          professionelles PDF und Word-Dokument.
        </p>

        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/80">pexible CV-Optimierung</span>
            <span className="text-lg font-bold text-white">3,99 €</span>
          </div>
          <p className="text-xs text-white/40 mt-1">Einmalig, inkl. MwSt.</p>
        </div>

        {paymentError && (
          <div className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl px-4 py-3 text-sm mb-4">
            <p>{paymentError}</p>
            {tokenExpired && (
              <Link
                href="/cv-check"
                className="inline-block mt-3 text-[#F5B731] hover:text-[#E8930C] font-medium transition-colors"
              >
                Zurück zum CV-Check →
              </Link>
            )}
          </div>
        )}

        {clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'night',
                variables: {
                  colorPrimary: '#F5B731',
                  colorBackground: '#1a1a24',
                  fontFamily: 'Inter, sans-serif',
                },
              },
            }}
          >
            <CheckoutForm onSuccess={handlePaymentSuccess} />
          </Elements>
        ) : !paymentError ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-white/20 border-t-[#F5B731] rounded-full animate-spin" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

// --- Optimization Results Component ---

interface OptimizationResultData {
  id: string
  original_score: number
  optimized_score: number
  changes_summary: Array<{ before: string; after: string; reason: string }>
  placeholders: Array<{ location: string; placeholder_text: string; suggestion: string }>
  sections: Array<{ name: string; content: string }>
}

function OptimizationResults({ data, originalScore }: { data: OptimizationResultData; originalScore: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22C55E'
    if (score >= 70) return '#EAB308'
    if (score >= 50) return '#F97316'
    return '#EF4444'
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Score Comparison */}
      <div className="bg-white rounded-2xl border border-[#E8E0D4]/80 shadow-xl shadow-black/5 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-[#1A1A2E] mb-6 text-center">Score-Verbesserung</h2>
        <div className="flex items-center justify-center gap-6 sm:gap-10">
          <div className="text-center">
            <span className="text-sm text-[#9CA3AF] block mb-1">Vorher</span>
            <span className="text-3xl sm:text-4xl font-extrabold" style={{ color: getScoreColor(originalScore) }}>
              {originalScore}
            </span>
          </div>
          <svg className="w-8 h-8 text-[#F5B731]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <div className="text-center">
            <span className="text-sm text-[#9CA3AF] block mb-1">Nachher</span>
            <span className="text-3xl sm:text-4xl font-extrabold" style={{ color: getScoreColor(data.optimized_score) }}>
              {data.optimized_score}
            </span>
          </div>
        </div>
        <p className="text-center text-sm text-[#9CA3AF] mt-3">
          +{data.optimized_score - originalScore} Punkte Verbesserung
        </p>
      </div>

      {/* Changes Summary */}
      {data.changes_summary.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-[#1A1A2E] mb-4">Top-Änderungen</h2>
          <div className="space-y-3">
            {data.changes_summary.slice(0, 5).map((change, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E8E0D4]/80 p-4 sm:p-5">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 text-sm shrink-0 mt-0.5">✗</span>
                    <p className="text-sm text-[#4A5568] line-through">{change.before}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 text-sm shrink-0 mt-0.5">✓</span>
                    <p className="text-sm text-[#1A1A2E] font-medium">{change.after}</p>
                  </div>
                </div>
                <p className="text-xs text-[#9CA3AF] mt-2">{change.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Placeholders Info */}
      {data.placeholders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">
                {data.placeholders.length} Stellen zum Ergänzen
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Wir haben Stellen markiert, an denen du konkrete Zahlen ergänzen kannst.
                Suche im Dokument nach [Bitte ergänzen: ...]
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Download Buttons */}
      <div className="bg-white rounded-2xl border border-[#E8E0D4]/80 shadow-xl shadow-black/5 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-[#1A1A2E] mb-4 text-center">Dokumente herunterladen</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`/api/cv-check/download/${data.id}/pdf`}
            className="inline-flex items-center gap-2 bg-[#F5B731] hover:bg-[#E8930C] text-[#1A1A2E] font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF herunterladen
          </a>
          <a
            href={`/api/cv-check/download/${data.id}/docx`}
            className="inline-flex items-center gap-2 bg-[#1A1A2E] hover:bg-[#2D2D44] text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Word-Dokument herunterladen
          </a>
        </div>
        <p className="text-xs text-[#9CA3AF] text-center mt-3">Download verfügbar für 24 Stunden</p>
      </div>

      {/* Cross-selling */}
      <div className="text-center">
        <Link
          href="/jobs"
          className="text-sm font-medium text-[#F5B731] hover:text-[#E8930C] transition-colors"
        >
          Jetzt passende Jobs finden →
        </Link>
      </div>
    </div>
  )
}

// --- Page Wrapper ---

export default function OptimizePage() {
  return (
    <div className="min-h-screen bg-[#FDF8F0] text-[#1A1A2E]">
      <Navbar />

      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            CV-Optimierung
          </h1>
          <p className="text-[#4A5568] text-base sm:text-lg max-w-2xl mx-auto">
            Dein Lebenslauf wird von unserer KI überarbeitet und für ATS-Systeme optimiert.
          </p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#E8E0D4] border-t-[#F5B731] rounded-full animate-spin" />
          </div>
        }>
          <OptimizeContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
