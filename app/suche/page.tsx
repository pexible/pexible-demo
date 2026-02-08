'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Blog articles available for search (can be extended with other content types later)
const SEARCHABLE_ITEMS = [
  {
    type: 'blog' as const,
    slug: 'bewerbungstipps-2026',
    title: 'Die 10 besten Bewerbungstipps für 2026',
    excerpt: 'Von der perfekten Anrede bis zum Follow-up: Diese bewährten Strategien erhöhen deine Chancen.',
    category: 'Bewerbungstipps',
  },
  {
    type: 'blog' as const,
    slug: 'arbeitsmarkt-trends',
    title: 'Arbeitsmarkt-Trends: Was sich dieses Jahr ändert',
    excerpt: 'Fachkräftemangel, KI-Revolution und New Work: Welche Branchen boomen.',
    category: 'Arbeitsmarkt',
  },
  {
    type: 'blog' as const,
    slug: 'versteckter-stellenmarkt',
    title: 'Der versteckte Stellenmarkt: So findest du unadvertierte Jobs',
    excerpt: 'Bis zu 70% aller Stellen werden nie öffentlich ausgeschrieben.',
    category: 'Karriere-Wissen',
  },
  {
    type: 'blog' as const,
    slug: 'ki-jobsuche',
    title: 'KI in der Jobsuche: Revolution oder Risiko?',
    excerpt: 'Wie künstliche Intelligenz die Art verändert, wie wir nach Jobs suchen.',
    category: 'Technologie',
  },
  {
    type: 'blog' as const,
    slug: 'gehaltsverhandlung',
    title: 'Gehaltsverhandlung: 7 Strategien für mehr Gehalt',
    excerpt: 'Mit der richtigen Vorbereitung holst du das Maximum aus deinem nächsten Gehaltsgespräch.',
    category: 'Karriere-Wissen',
  },
  {
    type: 'blog' as const,
    slug: 'remote-work-2026',
    title: 'Remote Work 2026: Die besten Branchen und Positionen',
    excerpt: 'Welche Jobs bieten die besten Remote-Möglichkeiten?',
    category: 'Arbeitsmarkt',
  },
]

export default function SuchePage() {
  const [query, setQuery] = useState('')

  const normalizedQuery = query.trim().toLowerCase()
  const results = normalizedQuery.length >= 2
    ? SEARCHABLE_ITEMS.filter(item =>
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.excerpt.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery)
      )
    : []

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] mb-6">Suche</h1>

        {/* Search input */}
        <div className="relative mb-8">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Blog-Artikel durchsuchen..."
            autoFocus
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E8E0D4] rounded-xl text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F5B731]/40 focus:border-[#F5B731] transition-colors"
          />
        </div>

        {/* Results */}
        {normalizedQuery.length >= 2 ? (
          results.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-[#9CA3AF] mb-4">{results.length} Ergebnis{results.length !== 1 ? 'se' : ''}</p>
              {results.map(item => (
                <Link
                  key={item.slug}
                  href={`/blog#${item.slug}`}
                  className="block bg-white rounded-xl border border-[#E8E0D4]/80 p-4 sm:p-5 hover:border-[#F5B731]/40 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#F5EFE3] flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#4A5568]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-medium text-[#F5B731] uppercase tracking-wider">{item.category}</span>
                      <h3 className="text-sm font-semibold text-[#1A1A2E] group-hover:text-[#F5B731] transition-colors mt-0.5">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#9CA3AF] mt-1 line-clamp-2">{item.excerpt}</p>
                    </div>
                    <svg className="w-5 h-5 text-[#D1C9BD] group-hover:text-[#F5B731] transition-colors flex-shrink-0 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F5EFE3] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#D1C9BD]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#1A1A2E] mb-1">Keine Ergebnisse</h3>
              <p className="text-sm text-[#4A5568]">Versuche einen anderen Suchbegriff.</p>
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F5EFE3] flex items-center justify-center">
              <svg className="w-8 h-8 text-[#D1C9BD]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A2E] mb-1">Wonach suchst du?</h3>
            <p className="text-sm text-[#4A5568]">Gib mindestens 2 Zeichen ein, um Blog-Artikel zu durchsuchen.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
