'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (firstName.trim().length < 2) {
      setError('Name muss mindestens 2 Zeichen haben')
      return
    }
    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen haben')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName.trim(), email, password }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Fehler bei der Registrierung')
        setIsLoading(false)
        return
      }

      // Auto-login after registration
      const loginResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (loginResult?.error) {
        setError('Konto erstellt, aber Anmeldung fehlgeschlagen. Bitte melde dich manuell an.')
        setIsLoading(false)
        return
      }

      window.location.href = '/chat'
    } catch {
      setError('Netzwerkfehler. Bitte versuche es erneut.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0] flex flex-col">
      <nav className="px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-2xl font-bold italic tracking-tight text-[#1A1A2E]">
            pexible
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-[#F5B731] to-[#E8930C] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#F5B731]/20">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            </div>
            <h1 className="text-2xl font-extrabold text-[#1A1A2E] tracking-tight">Konto erstellen</h1>
            <p className="mt-2 text-sm text-[#6B7280]">Registriere dich kostenlos und starte deine Jobsuche</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E0D4]/60 shadow-lg shadow-black/5 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                  Vorname
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Dein Vorname"
                  className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E0D4] rounded-xl text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731]/30 transition-all text-sm"
                  required
                  autoFocus
                />
              </div>

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
                  className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E0D4] rounded-xl text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731]/30 transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                  Passwort
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mindestens 8 Zeichen"
                  className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E0D4] rounded-xl text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731]/30 transition-all text-sm"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                  Passwort bestätigen
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Passwort wiederholen"
                  className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E0D4] rounded-xl text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731]/30 transition-all text-sm"
                  required
                  minLength={8}
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 border border-red-200 text-sm p-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#1A1A2E] hover:bg-[#2D2D44] disabled:bg-[#E8E0D4] disabled:text-[#9CA3AF] text-white font-semibold rounded-xl transition-colors text-sm"
              >
                {isLoading ? 'Wird erstellt...' : 'Konto erstellen'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-[#6B7280] mt-6">
            Bereits ein Konto?{' '}
            <Link href="/login" className="font-semibold text-[#1A1A2E] hover:text-[#F5B731] transition-colors">
              Anmelden
            </Link>
          </p>

          <p className="text-center text-xs text-[#9CA3AF] mt-3">
            Mit der Registrierung akzeptierst du unsere{' '}
            <a href="#" className="underline underline-offset-2">AGB</a> und{' '}
            <a href="#" className="underline underline-offset-2">Datenschutzrichtlinien</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
