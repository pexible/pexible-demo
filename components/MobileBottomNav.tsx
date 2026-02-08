'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/hooks/useUser'

const TABS = [
  {
    href: '/jobs',
    label: 'Jobs',
    iconPath: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M3.41 7.41A2 2 0 013 6.586V6a2 2 0 012-2h14a2 2 0 012 2v.586a2 2 0 01-.41.828l-.59.586a2 2 0 00-.41.828V19a2 2 0 01-2 2H6a2 2 0 01-2-2v-9.172a2 2 0 00-.41-.828l-.59-.586z',
  },
  {
    href: '/cv-check',
    label: 'Lebenslauf',
    iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    href: '/blog',
    label: 'Blog',
    iconPath: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  },
]

const PROFILE_ICON_PATH = 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { user, isLoading } = useUser()

  const profileHref = user ? '/mein-pex' : '/login'

  const isActive = (href: string) => {
    if (href === '/mein-pex') return pathname === '/mein-pex' || pathname.startsWith('/mein-pex/')
    return pathname.startsWith(href)
  }

  // Hide on pages with full-screen layouts or where it conflicts
  const hiddenPaths = ['/login', '/register']
  const isJobDetail = pathname.match(/^\/jobs\/.+$/)
  if (hiddenPaths.some(p => pathname.startsWith(p)) || isJobDetail) return null

  // Don't render during SSR loading to avoid flash
  if (isLoading) return null

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#FDF8F0]/95 backdrop-blur-xl border-t border-[#E8E0D4]/60"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch justify-around">
        {TABS.map(tab => {
          const active = isActive(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[56px] min-w-[44px] py-2 transition-colors ${
                active ? 'text-[#F5B731]' : 'text-[#9CA3AF]'
              }`}
              {...(active ? { 'aria-current': 'page' as const } : {})}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5} d={tab.iconPath} />
              </svg>
              <span className={`text-[10px] leading-tight ${active ? 'font-semibold' : 'font-medium'}`}>{tab.label}</span>
            </Link>
          )
        })}

        {/* Profile tab */}
        <Link
          href={profileHref}
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[56px] min-w-[44px] py-2 transition-colors ${
            isActive('/mein-pex') ? 'text-[#F5B731]' : 'text-[#9CA3AF]'
          }`}
          {...(isActive('/mein-pex') ? { 'aria-current': 'page' as const } : {})}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/mein-pex') ? 2 : 1.5} d={PROFILE_ICON_PATH} />
          </svg>
          <span className={`text-[10px] leading-tight ${isActive('/mein-pex') ? 'font-semibold' : 'font-medium'}`}>Profil</span>
        </Link>
      </div>
    </nav>
  )
}
