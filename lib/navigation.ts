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
    href: '/cv-check',
    label: 'CV-Check',
    iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    href: '/blog',
    label: 'Blog',
    iconPath: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  },
  {
    href: '/chat',
    label: 'Mein Pex',
    authOnly: true,
    iconPath: 'M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z',
  },
]

// ─── Landing page anchor links (guests only, center of header) ───

export const guestNavItems: NavItem[] = [
  {
    href: '#funktionen',
    label: 'Funktionen',
    guestOnly: true,
    anchorOnHome: true,
    iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    href: '#so-funktionierts',
    label: "So funktioniert\u2019s",
    guestOnly: true,
    anchorOnHome: true,
    iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
]

// ─── User menu items (inside the avatar dropdown, logged-in only) ───

export const userMenuItems: NavItem[] = [
  {
    href: '/chat',
    label: 'Meine Chats',
    authOnly: true,
    iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
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
      { href: '/chat', label: 'Mein Pex' },
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
