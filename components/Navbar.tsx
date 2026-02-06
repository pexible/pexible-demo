'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/hooks/useUser'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, isLoading, signOut } = useUser()
  const isHome = pathname === '/'

  // Body scroll lock for mobile menu
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('modal-open')
      return () => document.body.classList.remove('modal-open')
    }
  }, [mobileMenuOpen])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const closeMobile = () => setMobileMenuOpen(false)
  const anchor = (hash: string) => isHome ? hash : `/${hash}`

  const isChat = pathname.startsWith('/chat')
  const isBlog = pathname.startsWith('/blog')

  const isActive = (path: string) => {
    if (path === '/') return isHome
    return pathname.startsWith(path)
  }

  const linkClass = (active: boolean) =>
    `text-sm transition-colors ${active ? 'font-medium text-[#1A1A2E]' : 'text-[#4A5568] hover:text-[#1A1A2E]'}`

  const mobileLinkClass = (active: boolean) =>
    `text-sm py-3 min-h-[44px] flex items-center transition-colors ${active ? 'font-medium text-[#1A1A2E]' : 'text-[#4A5568] hover:text-[#1A1A2E]'}`

  // ─── Logged-in: App navigation ───

  const loggedInDesktopLinks = (
    <div className="hidden md:flex items-center gap-8">
      <Link href="/" className={linkClass(isHome)}>Startseite</Link>
      <Link href="/blog" className={linkClass(isBlog)}>Blog</Link>
      <Link href="/chat" className={linkClass(isChat)}>Meine Chats</Link>
    </div>
  )

  const loggedInDesktopRight = () => {
    const userName = user?.firstName || ''
    return (
      <div className="hidden md:flex items-center gap-2 sm:gap-3">
        {userName && (
          <div className="w-8 h-8 bg-gradient-to-br from-[#F5B731] to-[#E8930C] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
        {userName && (
          <span className="text-sm font-medium text-[#4A5568]">{userName}</span>
        )}
        <button
          onClick={() => signOut()}
          className="text-xs text-[#9CA3AF] hover:text-[#1A1A2E] transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Abmelden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
        </button>
      </div>
    )
  }

  const loggedInMobileMenu = () => {
    const userName = user?.firstName || ''
    return (
      <div className="md:hidden border-t border-[#E8E0D4]/60 bg-[#FDF8F0] px-4 py-3 space-y-1">
        <Link href="/" onClick={closeMobile} className={mobileLinkClass(isHome)}>Startseite</Link>
        <Link href="/blog" onClick={closeMobile} className={mobileLinkClass(isBlog)}>Blog</Link>
        <Link href="/chat" onClick={closeMobile} className={mobileLinkClass(isChat)}>Meine Chats</Link>
        <div className="pt-3 border-t border-[#E8E0D4]/60 space-y-1">
          {userName && (
            <div className="flex items-center gap-3 px-2 py-3 min-h-[48px]">
              <div className="w-8 h-8 bg-gradient-to-br from-[#F5B731] to-[#E8930C] rounded-full flex items-center justify-center text-white text-xs font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-[#1A1A2E]">{userName}</span>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className="block w-full text-center text-sm text-[#9CA3AF] hover:text-[#1A1A2E] px-5 py-3 min-h-[48px] transition-colors active:bg-[#F5EFE3] rounded-xl"
          >
            Abmelden
          </button>
        </div>
      </div>
    )
  }

  // ─── Logged-out: Marketing navigation ───

  const marketingLinks = [
    { href: anchor('#funktionen'), label: 'Funktionen', isAnchor: true },
    { href: anchor('#so-funktionierts'), label: "So funktioniert\u2019s", isAnchor: true },
    { href: anchor('#erfolgsgeschichten'), label: 'Erfolgsgeschichten', isAnchor: true },
    { href: '/blog', label: 'Blog', isAnchor: false },
  ]

  const loggedOutDesktopLinks = (
    <div className="hidden md:flex items-center gap-8">
      {marketingLinks.map((link) =>
        link.isAnchor ? (
          <a key={link.href} href={link.href} className="text-sm text-[#4A5568] hover:text-[#1A1A2E] transition-colors">{link.label}</a>
        ) : (
          <Link key={link.href} href={link.href} className={linkClass(isActive(link.href))}>{link.label}</Link>
        )
      )}
    </div>
  )

  const loggedOutDesktopRight = () => {
    if (isLoading) {
      return (
        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm font-medium text-[#4A5568] px-4 py-2 invisible">Anmelden</span>
          <span className="text-sm font-semibold bg-[#1A1A2E] text-white px-5 py-2.5 rounded-full invisible">Jetzt starten</span>
        </div>
      )
    }
    return (
      <div className="hidden md:flex items-center gap-2 sm:gap-3">
        <Link href="/login" className="text-sm font-medium text-[#4A5568] hover:text-[#1A1A2E] transition-colors px-3 sm:px-4 py-2 min-h-[44px] flex items-center">
          Anmelden
        </Link>
        <Link href="/chat" className="text-sm font-semibold bg-[#1A1A2E] text-white px-4 sm:px-5 py-2.5 min-h-[44px] flex items-center rounded-full hover:bg-[#2D2D44] transition-colors">
          Jetzt starten
        </Link>
      </div>
    )
  }

  const loggedOutMobileMenu = (
    <div className="md:hidden border-t border-[#E8E0D4]/60 bg-[#FDF8F0] px-4 py-3 space-y-1">
      {marketingLinks.map((link) =>
        link.isAnchor ? (
          <a key={link.href} href={link.href} onClick={closeMobile} className="text-sm text-[#4A5568] hover:text-[#1A1A2E] py-3 min-h-[44px] flex items-center">{link.label}</a>
        ) : (
          <Link key={link.href} href={link.href} onClick={closeMobile} className={mobileLinkClass(isActive(link.href))}>{link.label}</Link>
        )
      )}
      <div className="pt-3 border-t border-[#E8E0D4]/60 space-y-1">
        <Link href="/login" onClick={closeMobile} className="block text-center text-sm font-medium text-[#4A5568] px-5 py-3 min-h-[48px] active:bg-[#F5EFE3] rounded-xl transition-colors">
          Anmelden
        </Link>
        <Link href="/chat" onClick={closeMobile} className="block text-center text-sm font-semibold bg-[#1A1A2E] text-white px-5 py-3 min-h-[48px] rounded-full active:bg-[#2D2D44] transition-colors">
          Jetzt starten
        </Link>
      </div>
    </div>
  )

  // ─── Render ───

  return (
    <nav className="sticky top-0 z-50 bg-[#FDF8F0]/80 backdrop-blur-xl border-b border-[#E8E0D4]/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold italic tracking-tight text-[#1A1A2E]">
          pexible
        </Link>

        {/* Desktop Nav Links */}
        {user ? loggedInDesktopLinks : loggedOutDesktopLinks}

        {/* Desktop Right Side */}
        {user ? loggedInDesktopRight() : loggedOutDesktopRight()}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#4A5568] hover:text-[#1A1A2E]"
          aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (user ? loggedInMobileMenu() : loggedOutMobileMenu)}
    </nav>
  )
}
