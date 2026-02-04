'use client'

import Link from 'next/link'
import { useUser } from '@/lib/hooks/useUser'

export default function NavAuthButtons() {
  const { user, isLoading, signOut } = useUser()

  // Show default (non-auth) nav while loading to prevent flash
  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[#4A5568] px-4 py-2 invisible">Anmelden</span>
        <span className="text-sm font-semibold bg-[#1A1A2E] text-white px-5 py-2.5 rounded-full invisible">Jetzt starten</span>
      </div>
    )
  }

  if (user) {
    const userName = user.firstName || ''
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/chat"
          className="text-sm font-medium text-[#4A5568] hover:text-[#1A1A2E] transition-colors px-4 py-2"
        >
          Meine Chats
        </Link>
        {userName && (
          <div className="w-8 h-8 bg-gradient-to-br from-[#F5B731] to-[#E8930C] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
        <button
          onClick={() => signOut()}
          className="text-xs text-[#9CA3AF] hover:text-[#1A1A2E] transition-colors px-2 py-1"
          title="Abmelden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="text-sm font-medium text-[#4A5568] hover:text-[#1A1A2E] transition-colors px-4 py-2"
      >
        Anmelden
      </Link>
      <Link
        href="/chat"
        className="text-sm font-semibold bg-[#1A1A2E] text-white px-5 py-2.5 rounded-full hover:bg-[#2D2D44] transition-colors"
      >
        Jetzt starten
      </Link>
    </div>
  )
}

export function NavAuthButtonsMobile({ onNavigate }: { onNavigate?: () => void }) {
  const { user, isLoading, signOut } = useUser()

  if (isLoading) return null

  if (user) {
    const userName = user.firstName || ''
    return (
      <div className="pt-3 border-t border-[#E8E0D4]/60 space-y-2">
        <Link href="/chat" onClick={onNavigate} className="flex items-center gap-3 text-sm font-medium text-[#1A1A2E] px-2 py-2.5">
          {userName && (
            <div className="w-7 h-7 bg-gradient-to-br from-[#F5B731] to-[#E8930C] rounded-full flex items-center justify-center text-white text-xs font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          Meine Chats
        </Link>
        <button
          onClick={() => signOut()}
          className="block w-full text-center text-sm text-[#9CA3AF] hover:text-[#1A1A2E] px-5 py-2.5 transition-colors"
        >
          Abmelden
        </button>
      </div>
    )
  }

  return (
    <div className="pt-3 border-t border-[#E8E0D4]/60 space-y-2">
      <Link href="/login" onClick={onNavigate} className="block text-center text-sm font-medium text-[#4A5568] px-5 py-2.5">
        Anmelden
      </Link>
      <Link href="/chat" onClick={onNavigate} className="block text-center text-sm font-semibold bg-[#1A1A2E] text-white px-5 py-2.5 rounded-full">
        Jetzt starten
      </Link>
    </div>
  )
}
