'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NavAuthButtons, { NavAuthButtonsMobile } from '@/components/NavAuthButtons'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
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

  const anchor = (hash: string) => isHome ? hash : `/${hash}`

  const navLinks = [
    { href: anchor('#funktionen'), label: 'Funktionen' },
    { href: anchor('#so-funktionierts'), label: "So funktioniert\u2019s" },
    { href: anchor('#erfolgsgeschichten'), label: 'Erfolgsgeschichten' },
  ]

  const isBlog = pathname.startsWith('/blog')

  return (
    <nav className="sticky top-0 z-50 bg-[#FDF8F0]/80 backdrop-blur-xl border-b border-[#E8E0D4]/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold italic tracking-tight text-[#1A1A2E]">
          pexible
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[#4A5568] hover:text-[#1A1A2E] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/blog"
            className={`text-sm transition-colors ${
              isBlog
                ? 'font-medium text-[#1A1A2E]'
                : 'text-[#4A5568] hover:text-[#1A1A2E]'
            }`}
          >
            Blog
          </Link>
        </div>

        <div className="hidden md:flex">
          <NavAuthButtons />
        </div>

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
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8E0D4]/60 bg-[#FDF8F0] px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-[#4A5568] hover:text-[#1A1A2E] py-3 min-h-[44px] flex items-center"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-sm py-3 min-h-[44px] flex items-center ${
              isBlog
                ? 'font-medium text-[#1A1A2E]'
                : 'text-[#4A5568] hover:text-[#1A1A2E]'
            }`}
          >
            Blog
          </Link>
          <NavAuthButtonsMobile onNavigate={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </nav>
  )
}
