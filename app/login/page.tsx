'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'

type Step = 'email' | 'otp' | 'name'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E8E0D4] border-t-[#F5B731] rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/chat'

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [firstName, setFirstName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [otpExpiry, setOtpExpiry] = useState(300)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const nameRef = useRef<HTMLInputElement>(null)

  // Check if already logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push(redirectTo)
    })
  }, [supabase, router])

  // ─── Send OTP ───

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.includes('@')) {
      setError('Bitte gib eine gültige Email-Adresse ein')
      return
    }

    setIsLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    })

    if (error) {
      console.error('OTP Error:', error)
      setError(error.message || JSON.stringify(error) || 'Fehler beim Senden des Codes')
      setIsLoading(false)
      return
    }

    setStep('otp')
    setIsLoading(false)
    setResendCooldown(30)
    setOtpExpiry(300)

    // Focus first OTP input after render
    setTimeout(() => otpRefs.current[0]?.focus(), 100)
  }

  // ─── Resend OTP ───

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    setError('')
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

    if (error) {
      setError('Fehler beim erneuten Senden. Bitte versuche es später.')
    } else {
      setResendCooldown(30)
      setOtpExpiry(300)
      setOtp(['', '', '', '', '', ''])
    }

    setIsLoading(false)
  }

  // ─── Verify OTP ───

  const handleVerifyOtp = async (code: string) => {
    setError('')
    setIsLoading(true)

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    if (error) {
      console.error('Verify OTP error:', error)
      setError(error.message || 'Ungültiger oder abgelaufener Code')
      setIsLoading(false)
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
      return
    }

    // Check if user has a first_name in their profile
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', data.user.id)
        .single()

      if (!profile?.first_name) {
        setStep('name')
        setIsLoading(false)
        setTimeout(() => nameRef.current?.focus(), 100)
        return
      }
    }

    router.push(redirectTo)
  }

  // ─── Save name for new users ───

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (firstName.trim().length < 2) {
      setError('Name muss mindestens 2 Zeichen haben')
      return
    }

    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Sitzung abgelaufen. Bitte starte den Login erneut.')
      setStep('email')
      setIsLoading(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ first_name: firstName.trim() })
      .eq('id', user.id)

    if (error) {
      setError('Fehler beim Speichern. Bitte versuche es erneut.')
      setIsLoading(false)
      return
    }

    router.push(redirectTo)
  }

  // ─── OTP input handlers ───

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits entered
    const code = newOtp.join('')
    if (code.length === 6 && newOtp.every(d => d !== '')) {
      handleVerifyOtp(code)
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const digits = pasted.split('')
      setOtp(digits)
      handleVerifyOtp(pasted)
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  // ─── Timers ───

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(r => r - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  useEffect(() => {
    if (step === 'otp' && otpExpiry > 0) {
      const timer = setTimeout(() => setOtpExpiry(t => t - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [step, otpExpiry])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // ─── Render ───

  return (
    <div className="min-h-screen bg-[#FDF8F0] flex flex-col">
      <Navbar variant="minimal" />

      <main id="main-content" className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          {/* ─── Step 1: Email ─── */}
          {step === 'email' && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#F5B731] to-[#E8930C] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#F5B731]/20">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h1 className="text-2xl font-extrabold text-[#1A1A2E] tracking-tight">Willkommen bei pexible</h1>
                <p className="mt-2 text-sm text-[#6B7280]">Wir senden dir einen Einmal-Code per Email</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8E0D4]/60 shadow-lg shadow-black/5 p-5 sm:p-6">
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="deine@email.de"
                      autoComplete="email"
                      inputMode="email"
                      className="w-full px-4 py-3 min-h-[44px] bg-[#FDFBF7] border border-[#E8E0D4] rounded-xl text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731]/30 transition-all text-[16px] sm:text-sm"
                      required
                      autoFocus
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 border border-red-200 text-sm p-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !email.includes('@')}
                    className="w-full py-3 min-h-[44px] bg-[#F5B731] hover:bg-[#E8930C] disabled:bg-[#E8E0D4] disabled:text-[#9CA3AF] text-[#1A1A2E] font-semibold rounded-xl transition-colors text-sm"
                  >
                    {isLoading ? 'Wird gesendet...' : 'Einmal-Code senden'}
                  </button>
                </form>
              </div>

              <div className="flex items-center justify-center gap-4 mt-6 text-xs text-[#9CA3AF]">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <span>Kein Passwort nötig</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#F5B731]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <span>Login in Sekunden</span>
                </div>
              </div>

              <p className="text-center text-xs text-[#9CA3AF] mt-4">
                <Link href="/" className="hover:text-[#1A1A2E] transition-colors underline underline-offset-2 py-1 inline-block">
                  Zurück zur Startseite
                </Link>
              </p>
            </div>
          )}

          {/* ─── Step 2: OTP ─── */}
          {step === 'otp' && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#F5B731] to-[#E8930C] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#F5B731]/20">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h1 className="text-2xl font-extrabold text-[#1A1A2E] tracking-tight">Code eingeben</h1>
                <p className="mt-2 text-sm text-[#6B7280]">
                  Wir haben einen 6-stelligen Code an<br />
                  <span className="font-medium text-[#1A1A2E]">{email}</span> gesendet
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8E0D4]/60 shadow-lg shadow-black/5 p-5 sm:p-6">
                <div className="space-y-5">
                  {/* OTP Input Boxes */}
                  <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => { otpRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-[#FDFBF7] border-2 border-[#E8E0D4] rounded-xl text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731] transition-all"
                        disabled={isLoading}
                        autoComplete="one-time-code"
                      />
                    ))}
                  </div>

                  {/* Timer */}
                  {otpExpiry > 0 ? (
                    <p className="text-center text-xs text-[#9CA3AF]">
                      Code gültig für <span className="font-medium text-[#4A5568]">{formatTime(otpExpiry)}</span>
                    </p>
                  ) : (
                    <p className="text-center text-xs text-red-500 font-medium">
                      Code abgelaufen — bitte erneut senden
                    </p>
                  )}

                  {error && (
                    <div className="bg-red-50 text-red-600 border border-red-200 text-sm p-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  {isLoading && (
                    <div className="flex justify-center">
                      <div className="flex space-x-1.5">
                        <div className="w-1.5 h-1.5 bg-[#F5B731] rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                        <div className="w-1.5 h-1.5 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                      </div>
                    </div>
                  )}

                  {/* Resend */}
                  <div className="text-center">
                    {resendCooldown > 0 ? (
                      <p className="text-xs text-[#9CA3AF]">
                        Erneut senden in {resendCooldown}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className="text-xs font-semibold text-[#F5B731] hover:text-[#E8930C] transition-colors disabled:text-[#9CA3AF]"
                      >
                        Code erneut senden
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Back to email */}
              <p className="text-center text-xs text-[#9CA3AF] mt-4">
                <button
                  onClick={() => { setStep('email'); setError(''); setOtp(['', '', '', '', '', '']) }}
                  className="hover:text-[#1A1A2E] transition-colors underline underline-offset-2"
                >
                  Andere Email verwenden
                </button>
              </p>
            </div>
          )}

          {/* ─── Step 3: Name (new users) ─── */}
          {step === 'name' && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#F5B731] to-[#E8930C] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#F5B731]/20">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <h1 className="text-2xl font-extrabold text-[#1A1A2E] tracking-tight">Wie heißt du?</h1>
                <p className="mt-2 text-sm text-[#6B7280]">Damit wir dich persönlich ansprechen können</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8E0D4]/60 shadow-lg shadow-black/5 p-5 sm:p-6">
                <form onSubmit={handleSaveName} className="space-y-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                      Vorname
                    </label>
                    <input
                      id="firstName"
                      ref={nameRef}
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Max"
                      autoComplete="given-name"
                      className="w-full px-4 py-3 min-h-[44px] bg-[#FDFBF7] border border-[#E8E0D4] rounded-xl text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731]/30 transition-all text-[16px] sm:text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 border border-red-200 text-sm p-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || firstName.trim().length < 2}
                    className="w-full py-3 min-h-[44px] bg-[#F5B731] hover:bg-[#E8930C] disabled:bg-[#E8E0D4] disabled:text-[#9CA3AF] text-[#1A1A2E] font-semibold rounded-xl transition-colors text-sm"
                  >
                    {isLoading ? 'Wird gespeichert...' : 'Weiter'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
