'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/hooks/useUser'
import { serviceNavItems, guestNavItems, userMenuItems, type NavItem } from '@/lib/navigation'

// ─── Types ───

export interface NavbarProps {
  /**
   * "default"  – full navigation (header links + auth area)
   * "minimal"  – logo only (used on login page)
   * "back"     – logo + back button (used inside chat detail)
   */
  variant?: 'default' | 'minimal' | 'back'
  backHref?: string
  backLabel?: string
}

// ─── Scroll-direction hook ───

function useScrollDirection() {
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const currentY = window.scrollY
        if (currentY < 10) {
          setVisible(true)
        } else if (currentY < lastScrollY.current - 4) {
          setVisible(true)
        } else if (currentY > lastScrollY.current + 4) {
          setVisible(false)
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

// ─── Shared: render a nav link (anchor or Next Link) ───

function NavLink({
  item,
  isHome,
  active,
  className,
  onClick,
  children,
}: {
  item: NavItem
  isHome: boolean
  active: boolean
  className: string
  onClick?: () => void
  children: React.ReactNode
}) {
  const isPageAnchor = item.anchorOnHome && isHome
  const href = item.anchorOnHome ? (isHome ? item.href : `/${item.href}`) : item.href

  if (isPageAnchor) {
    return (
      <a href={href} onClick={onClick} className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} onClick={onClick} className={className} {...(active ? { 'aria-current': 'page' as const } : {})}>
      {children}
    </Link>
  )
}

// ─── Icon helper ───

function NavIcon({ path, className = 'w-5 h-5' }: { path: string; className?: string }) {
  return (
    <svg className={`${className} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
    </svg>
  )
}

// ─── Main Navbar component ───

export default function Navbar({ variant = 'default', backHref = '/jobs', backLabel = 'Zurück' }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const pathname = usePathname()
  const { user, isLoading, signOut } = useUser()
  const headerVisible = useScrollDirection()
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isHome = pathname === '/'
  const userName = user?.firstName || ''

  const isActive = (href: string) => {
    if (href === '/') return isHome
    if (href.startsWith('#')) return false
    return pathname.startsWith(href)
  }

  // Build the center nav items: services always + guest anchors when logged out
  const centerItems = user
    ? serviceNavItems
    : [...serviceNavItems, ...guestNavItems]

  // ─── Body scroll lock for mobile menu ───
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('modal-open')
      return () => document.body.classList.remove('modal-open')
    }
  }, [mobileMenuOpen])

  // ─── Close menus on route change ───
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserDropdownOpen(false)
  }, [pathname])

  // ─── Close on Escape ───
  useEffect(() => {
    if (!mobileMenuOpen && !userDropdownOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [mobileMenuOpen, userDropdownOpen])

  // ─── Close user dropdown on outside click ───
  useEffect(() => {
    if (!userDropdownOpen) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [userDropdownOpen])

  // ─── Focus trap for mobile menu ───
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !mobileMenuRef.current) return
    const focusable = mobileMenuRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
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
  }, [])

  const closeMobile = () => setMobileMenuOpen(false)

  // Shared link class builders
  const desktopLinkClass = (active: boolean) =>
    `relative px-3 py-2 text-sm transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2 ${
      active ? 'font-medium text-[#1A1A2E]' : 'text-[#4A5568] hover:text-[#1A1A2E] hover:bg-[#F5EFE3]/60'
    }`

  const mobileLinkClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-3 min-h-[48px] text-sm rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2 ${
      active ? 'font-medium text-[#1A1A2E] bg-[#F5EFE3]' : 'text-[#4A5568] hover:text-[#1A1A2E] active:bg-[#F5EFE3]'
    }`

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
      <header className="sticky top-0 z-50 bg-[#FDF8F0]/80 backdrop-blur-xl border-b border-[#E8E0D4]/60">
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

  return (
    <>
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:bg-[#F5B731] focus:text-[#1A1A2E] focus:px-4 focus:py-2 focus:rounded-xl focus:font-semibold focus:shadow-lg focus:outline-none"
      >
        Zum Inhalt springen
      </a>

      <header
        className={`sticky top-0 z-50 bg-[#FDF8F0]/80 backdrop-blur-xl border-b border-[#E8E0D4]/60 transition-transform duration-300 ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <nav aria-label="Hauptnavigation" className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* ── Logo ── */}
            <Link
              href="/"
              className="text-2xl font-bold italic tracking-tight text-[#1A1A2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2 rounded-lg"
            >
              pexible
            </Link>

            {/* ── Desktop: center service links ── */}
            <ul className="hidden md:flex items-center gap-1" role="list">
              {centerItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <li key={item.href + item.label}>
                    <NavLink item={item} isHome={isHome} active={active} className={desktopLinkClass(active)}>
                      {item.label}
                      {active && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#F5B731] rounded-full" />}
                    </NavLink>
                  </li>
                )
              })}
            </ul>

            {/* ── Desktop: right side ── */}
            <div className="hidden md:flex items-center gap-2">
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm px-4 py-2 invisible">Anmelden</span>
                  <span className="text-sm px-5 py-2.5 rounded-full invisible">Starten</span>
                </div>
              ) : user ? (
                /* ── User avatar dropdown ── */
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-[#F5EFE3]/80 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2"
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                    aria-label="Benutzermenu öffnen"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#F5B731] to-[#E8930C] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {userName ? userName.charAt(0).toUpperCase() : '?'}
                    </div>
                    {userName && (
                      <span className="text-sm font-medium text-[#4A5568] max-w-[100px] truncate">{userName}</span>
                    )}
                    <svg
                      className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown panel */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-[#E8E0D4]/80 shadow-xl shadow-black/8 py-1 z-50">
                      {/* User info header */}
                      {userName && (
                        <div className="px-4 py-3 border-b border-[#E8E0D4]/60">
                          <p className="text-sm font-medium text-[#1A1A2E] truncate">{userName}</p>
                          <p className="text-xs text-[#9CA3AF] mt-0.5">Eingeloggt</p>
                        </div>
                      )}

                      {/* Personal area links */}
                      <div className="py-1">
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.href + item.label}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#4A5568] hover:text-[#1A1A2E] hover:bg-[#F9F5EE] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F5B731]"
                          >
                            <NavIcon path={item.iconPath} className="w-4 h-4" />
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      {/* Sign out */}
                      <div className="border-t border-[#E8E0D4]/60 py-1">
                        <button
                          onClick={() => { signOut(); setUserDropdownOpen(false) }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#9CA3AF] hover:text-red-600 hover:bg-red-50/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F5B731]"
                        >
                          <NavIcon path="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" className="w-4 h-4" />
                          Abmelden
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Guest: login + CTA ── */
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-[#4A5568] hover:text-[#1A1A2E] transition-colors px-4 py-2 min-h-[44px] flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2"
                  >
                    Anmelden
                  </Link>
                  <Link
                    href="/jobs"
                    className="text-sm font-semibold bg-[#1A1A2E] text-white px-5 py-2.5 min-h-[44px] flex items-center rounded-full hover:bg-[#2D2D44] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2"
                  >
                    Los geht's
                  </Link>
                </div>
              )}
            </div>

            {/* ── Mobile: hamburger button ── */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#4A5568] hover:text-[#1A1A2E] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2"
              aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <div className="relative w-6 h-6">
                <span className={`absolute left-0 block w-6 h-0.5 bg-current rounded-full transition-transform duration-200 ${mobileMenuOpen ? 'top-[11px] rotate-45' : 'top-[4px]'}`} />
                <span className={`absolute left-0 top-[11px] block w-6 h-0.5 bg-current rounded-full transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                <span className={`absolute left-0 block w-6 h-0.5 bg-current rounded-full transition-transform duration-200 ${mobileMenuOpen ? 'top-[11px] -rotate-45' : 'top-[18px]'}`} />
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

        {/* Panel */}
        <div
          ref={mobileMenuRef}
          onKeyDown={handleMenuKeyDown}
          className={`absolute top-0 right-0 w-full max-w-sm h-full bg-[#FDF8F0] shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
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

          <nav aria-label="Mobile Navigation" className="px-4 pt-4 pb-8">
            {/* ── Section 1: Angebote (services) ── */}
            <p className="px-3 mb-2 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Angebote</p>
            <ul className="space-y-1" role="list">
              {serviceNavItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <li key={item.href}>
                    <NavLink item={item} isHome={isHome} active={active} className={mobileLinkClass(active)} onClick={closeMobile}>
                      <NavIcon path={item.iconPath} />
                      {item.label}
                    </NavLink>
                  </li>
                )
              })}
            </ul>

            {/* ── Section 2: Guest anchors (not logged in, on landing page) ── */}
            {!user && guestNavItems.length > 0 && (
              <>
                <div className="my-4 border-t border-[#E8E0D4]/60" />
                <p className="px-3 mb-2 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Mehr erfahren</p>
                <ul className="space-y-1" role="list">
                  {guestNavItems.map((item) => (
                    <li key={item.href}>
                      <NavLink item={item} isHome={isHome} active={false} className={mobileLinkClass(false)} onClick={closeMobile}>
                        <NavIcon path={item.iconPath} />
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* ── Section 3: Personal area (logged in) ── */}
            {!isLoading && user && (
              <>
                <div className="my-4 border-t border-[#E8E0D4]/60" />
                <p className="px-3 mb-2 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Mein Bereich</p>

                {/* User info */}
                {userName && (
                  <div className="flex items-center gap-3 px-3 py-3 mb-1">
                    <div className="w-9 h-9 bg-gradient-to-br from-[#F5B731] to-[#E8930C] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-[#1A1A2E]">{userName}</span>
                  </div>
                )}

                <ul className="space-y-1" role="list">
                  {userMenuItems.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <li key={item.href + item.label}>
                        <Link
                          href={item.href}
                          onClick={closeMobile}
                          className={mobileLinkClass(active)}
                          {...(active ? { 'aria-current': 'page' as const } : {})}
                        >
                          <NavIcon path={item.iconPath} />
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>

                <button
                  onClick={() => { signOut(); closeMobile() }}
                  className="w-full flex items-center gap-3 px-3 py-3 mt-1 min-h-[48px] text-sm text-[#9CA3AF] hover:text-red-600 rounded-xl transition-colors active:bg-red-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2"
                >
                  <NavIcon path="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  Abmelden
                </button>
              </>
            )}

            {/* ── Guest auth buttons ── */}
            {!isLoading && !user && (
              <div className="mt-6 pt-6 border-t border-[#E8E0D4]/60 space-y-3">
                <Link
                  href="/login"
                  onClick={closeMobile}
                  className="block text-center text-sm font-medium text-[#4A5568] px-4 py-3 min-h-[48px] rounded-xl active:bg-[#F5EFE3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2"
                >
                  Anmelden
                </Link>
                <Link
                  href="/jobs"
                  onClick={closeMobile}
                  className="block text-center text-sm font-semibold bg-[#1A1A2E] text-white px-4 py-3 min-h-[48px] rounded-full active:bg-[#2D2D44] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2"
                >
                  Los geht's
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  )
}
