'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/hooks/useUser'

interface BreadcrumbsProps {
  /** Override the label for the last breadcrumb segment (e.g. conversation title) */
  title?: string
}

// Route definitions: maps paths to their breadcrumb label and parent path
const ROUTE_MAP: Record<string, { label: string; parent?: string }> = {
  '/mein-pex': { label: 'Mein Pex' },
  '/jobs': { label: 'Meine Jobsuchen', parent: '/mein-pex' },
  '/jobs/neu': { label: 'Neue Jobsuche', parent: '/jobs' },
  '/cv-check': { label: 'CV-Check', parent: '/mein-pex' },
  '/mein-pex/einstellungen': { label: 'Einstellungen', parent: '/mein-pex' },
}

export default function Breadcrumbs({ title }: BreadcrumbsProps) {
  const pathname = usePathname()
  const { user } = useUser()

  // Only show for logged-in users, never on /mein-pex itself
  if (!user || pathname === '/mein-pex') return null

  // Find matching route config (exact match or /jobs/[id] dynamic pattern)
  let routeConfig = ROUTE_MAP[pathname]
  let lastLabel = routeConfig?.label

  if (!routeConfig && pathname.match(/^\/jobs\/.+$/)) {
    // Dynamic /jobs/[id] route
    lastLabel = title || 'Jobsuche'
    routeConfig = { label: lastLabel, parent: '/jobs' }
  }

  if (!routeConfig) return null

  // Build the breadcrumb chain by following parent references
  const chain: Array<{ label: string; href: string }> = []
  let parentPath = routeConfig.parent
  while (parentPath && ROUTE_MAP[parentPath]) {
    chain.unshift({ label: ROUTE_MAP[parentPath].label, href: parentPath })
    parentPath = ROUTE_MAP[parentPath].parent
  }

  // Override last label with title prop if provided
  const finalLabel = title || lastLabel || ''

  return (
    <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto px-4 sm:px-6 py-2">
      <ol className="flex items-center gap-1.5 text-sm">
        {chain.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-[#D1C9BD]" aria-hidden="true">&rsaquo;</span>}
            <Link href={crumb.href} className="text-[#9CA3AF] hover:text-[#1A1A2E] transition-colors">
              {crumb.label}
            </Link>
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          {chain.length > 0 && <span className="text-[#D1C9BD]" aria-hidden="true">&rsaquo;</span>}
          <span className="text-[#4A5568]">{finalLabel}</span>
        </li>
      </ol>
    </nav>
  )
}
