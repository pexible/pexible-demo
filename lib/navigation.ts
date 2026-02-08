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
    label: 'Lebenslauf-Check',
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
    href: '/jobs',
    label: 'Meine Jobsuchen',
    authOnly: true,
    iconPath: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M3.41 7.41A2 2 0 013 6.586V6a2 2 0 012-2h14a2 2 0 012 2v.586a2 2 0 01-.41.828l-.59.586a2 2 0 00-.41.828V19a2 2 0 01-2 2H6a2 2 0 01-2-2v-9.172a2 2 0 00-.41-.828l-.59-.586z',
  },
  {
    href: '/cv-check',
    label: 'Meine Lebenslauf-Ergebnisse',
    authOnly: true,
    iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
]

// ─── Secondary user menu items (settings & help, shown below primary items) ───

export const userMenuSecondaryItems: NavItem[] = [
  {
    href: '/mein-pex/einstellungen',
    label: 'Einstellungen',
    authOnly: true,
    iconPath: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z',
  },
  {
    href: '/hilfe',
    label: 'Hilfe & Feedback',
    authOnly: true,
    iconPath: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z',
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
      { href: '/cv-check', label: 'Lebenslauf-Check' },
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
