'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Email oder Passwort ist falsch')
      setIsLoading(false)
    } else {
      window.location.href = '/chat'
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
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h1 className="text-2xl font-extrabold text-[#1A1A2E] tracking-tight">Willkommen zurück</h1>
            <p className="mt-2 text-sm text-[#6B7280]">Melde dich an, um zu deinen Chats zu gelangen</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E0D4]/60 shadow-lg shadow-black/5 p-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Dein Passwort"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 min-h-[44px] bg-[#FDFBF7] border border-[#E8E0D4] rounded-xl text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731]/30 transition-all text-[16px] sm:text-sm"
                  required
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
                className="w-full py-3 min-h-[44px] bg-[#1A1A2E] hover:bg-[#2D2D44] disabled:bg-[#E8E0D4] disabled:text-[#9CA3AF] text-white font-semibold rounded-xl transition-colors text-sm"
              >
                {isLoading ? 'Wird geladen...' : 'Anmelden'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-[#6B7280] mt-6">
            Noch kein Konto?{' '}
            <Link href="/register" className="font-semibold text-[#1A1A2E] hover:text-[#F5B731] transition-colors py-1 inline-block">
              Jetzt registrieren
            </Link>
          </p>

          <p className="text-center text-xs text-[#9CA3AF] mt-3">
            <Link href="/" className="hover:text-[#1A1A2E] transition-colors underline underline-offset-2 py-1 inline-block">
              Zurück zur Startseite
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
