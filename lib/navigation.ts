// Centralized navigation configuration
// ─── Structure ───
// serviceNavItems: Main offerings (always visible in header center)
// userMenuItems:   Personal area items (shown in user avatar dropdown)
// guestNavItems:   Landing page anchor links (only for non-logged-in users)
// footerGroups:    Footer column links

export interface NavItem {
  href: string
  label: string
  /** SVG icon path – uses 24x24 viewBox, stroke style */
  iconPath: string
  /** Show only when user is logged in */
  authOnly?: boolean
  /** Show only when user is NOT logged in */
  guestOnly?: boolean
  /** Anchor link on the landing page (e.g. "#funktionen") */
  anchorOnHome?: boolean
}

// ─── Service links (center of header – the product offerings) ───

export const serviceNavItems: NavItem[] = [
  {
    href: '/jobs',
    label: 'Jobs finden',
    iconPath: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M3.41 7.41A2 2 0 013 6.586V6a2 2 0 012-2h14a2 2 0 012 2v.586a2 2 0 01-.41.828l-.59.586a2 2 0 00-.41.828V19a2 2 0 01-2 2H6a2 2 0 01-2-2v-9.172a2 2 0 00-.41-.828l-.59-.586z',
  },
  {
    href: '/cv-check',
    label: 'CV-Check',
    iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    href: '/blog',
    label: 'Blog',
    iconPath: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  },
]

// ─── Landing page anchor links (guests only, center of header) ───

export const guestNavItems: NavItem[] = []

// ─── User menu items (inside the avatar dropdown, logged-in only) ───

export const userMenuItems: NavItem[] = [
  {
    href: '/mein-pex',
    label: 'Mein Pex',
    authOnly: true,
    iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z',
  },
  {
    href: '/cv-check',
    label: 'Meine CV-Ergebnisse',
    authOnly: true,
    iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
]

// ─── Footer navigation groups ───

export interface FooterGroup {
  title: string
  links: { href: string; label: string }[]
}

export const footerGroups: FooterGroup[] = [
  {
    title: 'Produkt',
    links: [
      { href: '/mein-pex', label: 'Mein Pex' },
      { href: '/cv-check', label: 'CV-Check' },
      { href: '/#funktionen', label: 'Funktionen' },
      { href: '/#so-funktionierts', label: "So funktioniert\u2019s" },
    ],
  },
  {
    title: 'Ressourcen',
    links: [
      { href: '/blog', label: 'Blog' },
      { href: '/#erfolgsgeschichten', label: 'Erfolgsgeschichten' },
      { href: '/blog#bewerbungstipps-2026', label: 'Bewerbungstipps' },
    ],
  },
  {
    title: 'Rechtliches',
    links: [
      { href: '/impressum', label: 'Impressum' },
      { href: '/datenschutz', label: 'Datenschutz' },
      { href: '/impressum#widerruf', label: 'AGB' },
    ],
  },
]
