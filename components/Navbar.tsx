'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/hooks/useUser'
import { primaryNavItems, type NavItem } from '@/lib/navigation'

// ─── Types ───

export interface NavbarProps {
  /**
   * "default"  – full navigation (header links + auth area)
   * "minimal"  – logo only (used on login page)
   * "back"     – logo + back button (used inside chat detail)
   */
  variant?: 'default' | 'minimal' | 'back'
  /** href for the back button when variant="back" */
  backHref?: string
  /** Label for the back button (screen reader + visible) */
  backLabel?: string
}

// ─── Scroll-direction hook ───

function useScrollDirection() {
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const threshold = 10

    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true

      requestAnimationFrame(() => {
        const currentY = window.scrollY
        if (currentY < threshold) {
          // Always show at the top of the page
          setVisible(true)
        } else if (currentY < lastScrollY.current - 4) {
          setVisible(true) // scrolling up
        } else if (currentY > lastScrollY.current + 4) {
          setVisible(false) // scrolling down
        }
        lastScrollY.current = currentY
        ticking.current = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return visible
}

// ─── Component ───

export default function Navbar({ variant = 'default', backHref = '/chat', backLabel = 'Zurück' }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, isLoading, signOut } = useUser()
  const headerVisible = useScrollDirection()
  const menuRef = useRef<HTMLDivElement>(null)

  const isHome = pathname === '/'

  // Helper: resolve anchor links depending on current page
  const resolveHref = (item: NavItem) => {
    if (item.anchorOnHome) return isHome ? item.href : `/${item.href}`
    return item.href
  }

  // Helper: is this item an anchor on the current page?
  const isAnchor = (item: NavItem) => item.anchorOnHome && isHome

  // Helper: is a page-link active?
  const isActive = (href: string) => {
    if (href === '/') return isHome
    if (href.startsWith('#')) return false
    return pathname.startsWith(href)
  }

  // Filter items based on auth state
  const visibleItems = primaryNavItems.filter((item) => {
    if (item.authOnly && !user) return false
    if (item.guestOnly && user) return false
    return true
  })

  // ─── Body scroll lock ───
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('modal-open')
      return () => document.body.classList.remove('modal-open')
    }
  }, [mobileMenuOpen])

  // ─── Close mobile menu on route change ───
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // ─── Close on Escape ───
  useEffect(() => {
    if (!mobileMenuOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [mobileMenuOpen])

  // ─── Trap focus inside mobile menu ───
  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Tab' || !menuRef.current) return
      const focusable = menuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    },
    []
  )

  const closeMobile = () => setMobileMenuOpen(false)

  // ─── Minimal variant (login page) ───
  if (variant === 'minimal') {
    return (
      <header className="px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-2xl font-bold italic tracking-tight text-[#1A1A2E]">
            pexible
          </Link>
        </div>
      </header>
    )
  }

  // ─── Back variant (chat detail) ───
  if (variant === 'back') {
    return (
      <header className="sticky top-0 z-50 bg-[#FDF8F0]/80 backdrop-blur-xl border-b border-[#E8E0D4]/60 nav-header">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-[#4A5568] hover:text-[#1A1A2E] transition-colors p-2 -ml-2 min-h-[44px] min-w-[44px] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2"
            aria-label={backLabel}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">{backLabel}</span>
          </Link>
          <Link href="/" className="text-xl font-bold italic tracking-tight text-[#1A1A2E] ml-auto">
            pexible
          </Link>
        </div>
      </header>
    )
  }

  // ─── Default: full navigation ───

  const userName = user?.firstName || ''

  return (
    <>
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:bg-[#F5B731] focus:text-[#1A1A2E] focus:px-4 focus:py-2 focus:rounded-xl focus:font-semibold focus:shadow-lg focus:outline-none"
      >
        Zum Inhalt springen
      </a>

      <header
        className={`sticky top-0 z-50 bg-[#FDF8F0]/80 backdrop-blur-xl border-b border-[#E8E0D4]/60 nav-header transition-transform duration-300 ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <nav aria-label="Hauptnavigation" className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="text-2xl font-bold italic tracking-tight text-[#1A1A2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2 rounded-lg"
            >
              pexible
            </Link>

            {/* ─── Desktop nav links (center) ─── */}
            <ul className="hidden md:flex items-center gap-1" role="list">
              {visibleItems.map((item) => {
                const href = resolveHref(item)
                const active = isActive(item.href)
                const linkClasses = `relative px-3 py-2 text-sm transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2 ${
                  active
                    ? 'font-medium text-[#1A1A2E]'
                    : 'text-[#4A5568] hover:text-[#1A1A2E] hover:bg-[#F5EFE3]/60'
                }`

                return (
                  <li key={item.href}>
                    {isAnchor(item) ? (
                      <a href={href} className={linkClasses}>
                        {item.label}
                        {active && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#F5B731] rounded-full" />}
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className={linkClasses}
                        {...(active ? { 'aria-current': 'page' as const } : {})}
                      >
                        {item.label}
                        {active && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#F5B731] rounded-full" />}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>

            {/* ─── Desktop right side (auth) ─── */}
            <div className="hidden md:flex items-center gap-2">
              {isLoading ? (
                // Invisible placeholder to prevent layout shift
                <div className="flex items-center gap-3">
                  <span className="text-sm px-4 py-2 invisible">Anmelden</span>
                  <span className="text-sm px-5 py-2.5 rounded-full invisible">Jetzt starten</span>
                </div>
              ) : user ? (
                <div className="flex items-center gap-2">
                  {userName && (
                    <div className="flex items-center gap-2 px-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#F5B731] to-[#E8930C] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-[#4A5568]">{userName}</span>
                    </div>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="text-xs text-[#9CA3AF] hover:text-[#1A1A2E] transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2"
                    title="Abmelden"
                    aria-label="Abmelden"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-[#4A5568] hover:text-[#1A1A2E] transition-colors px-4 py-2 min-h-[44px] flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2"
                  >
                    Anmelden
                  </Link>
                  <Link
                    href="/chat"
                    className="text-sm font-semibold bg-[#1A1A2E] text-white px-5 py-2.5 min-h-[44px] flex items-center rounded-full hover:bg-[#2D2D44] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2"
                  >
                    Jetzt starten
                  </Link>
                </div>
              )}
            </div>

            {/* ─── Mobile menu button ─── */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#4A5568] hover:text-[#1A1A2E] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2"
              aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <div className="relative w-6 h-6">
                {/* Animated hamburger → X */}
                <span
                  className={`absolute left-0 block w-6 h-0.5 bg-current rounded-full transition-transform duration-200 ${
                    mobileMenuOpen ? 'top-[11px] rotate-45' : 'top-[4px]'
                  }`}
                />
                <span
                  className={`absolute left-0 top-[11px] block w-6 h-0.5 bg-current rounded-full transition-opacity duration-200 ${
                    mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute left-0 block w-6 h-0.5 bg-current rounded-full transition-transform duration-200 ${
                    mobileMenuOpen ? 'top-[11px] -rotate-45' : 'top-[18px]'
                  }`}
                />
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* ─── Mobile menu overlay ─── */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 md:hidden transition-visibility ${
          mobileMenuOpen ? 'visible' : 'invisible pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-[#1A1A2E]/20 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMobile}
          aria-hidden="true"
        />

        {/* Menu panel */}
        <div
          ref={menuRef}
          onKeyDown={handleMenuKeyDown}
          className={`absolute top-0 right-0 w-full max-w-sm h-full bg-[#FDF8F0] shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Mobile menu header */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-[#E8E0D4]/60">
            <Link href="/" onClick={closeMobile} className="text-xl font-bold italic tracking-tight text-[#1A1A2E]">
              pexible
            </Link>
            <button
              onClick={closeMobile}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#4A5568] hover:text-[#1A1A2E] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2"
              aria-label="Menü schließen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation links */}
          <nav aria-label="Mobile Navigation" className="px-4 pt-4 pb-6">
            <ul className="space-y-1" role="list">
              {visibleItems.map((item) => {
                const href = resolveHref(item)
                const active = isActive(item.href)
                const mobileLinkClasses = `flex items-center gap-3 px-3 py-3 min-h-[48px] text-sm rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2 ${
                  active
                    ? 'font-medium text-[#1A1A2E] bg-[#F5EFE3]'
                    : 'text-[#4A5568] hover:text-[#1A1A2E] active:bg-[#F5EFE3]'
                }`

                const icon = item.iconPath ? (
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.iconPath} />
                  </svg>
                ) : null

                return (
                  <li key={item.href}>
                    {isAnchor(item) ? (
                      <a href={href} onClick={closeMobile} className={mobileLinkClasses}>
                        {icon}
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={href}
                        onClick={closeMobile}
                        className={mobileLinkClasses}
                        {...(active ? { 'aria-current': 'page' as const } : {})}
                      >
                        {icon}
                        {item.label}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>

            {/* Auth section */}
            {!isLoading && (
              <div className="mt-6 pt-6 border-t border-[#E8E0D4]/60">
                {user ? (
                  <div className="space-y-2">
                    {userName && (
                      <div className="flex items-center gap-3 px-3 py-3 min-h-[48px]">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#F5B731] to-[#E8930C] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-[#1A1A2E]">{userName}</span>
                      </div>
                    )}
                    <button
                      onClick={() => { signOut(); closeMobile() }}
                      className="w-full flex items-center justify-center gap-2 text-sm text-[#9CA3AF] hover:text-[#1A1A2E] px-4 py-3 min-h-[48px] rounded-xl transition-colors active:bg-[#F5EFE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      Abmelden
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/login"
                      onClick={closeMobile}
                      className="block text-center text-sm font-medium text-[#4A5568] px-4 py-3 min-h-[48px] rounded-xl active:bg-[#F5EFE3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2"
                    >
                      Anmelden
                    </Link>
                    <Link
                      href="/chat"
                      onClick={closeMobile}
                      className="block text-center text-sm font-semibold bg-[#1A1A2E] text-white px-4 py-3 min-h-[48px] rounded-full active:bg-[#2D2D44] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2"
                    >
                      Jetzt starten
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  )
}
