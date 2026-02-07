import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const articles = [
  {
    slug: 'bewerbungstipps-2026',
    category: 'Bewerbungstipps',
    date: '28. Januar 2026',
    readTime: '8 Min. Lesezeit',
    title: 'Die 10 besten Bewerbungstipps für 2026',
    excerpt: 'Von der perfekten Anrede bis zum Follow-up: Diese bewährten Strategien erhöhen deine Chancen auf eine Einladung zum Vorstellungsgespräch deutlich.',
    content: [
      'Der Arbeitsmarkt 2026 ist dynamischer denn je. Mit dem zunehmenden Einsatz von KI in Recruiting-Prozessen und der wachsenden Bedeutung von Soft Skills haben sich die Anforderungen an Bewerbungen grundlegend verändert.',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    ],
  },
  {
    slug: 'arbeitsmarkt-trends',
    category: 'Arbeitsmarkt',
    date: '24. Januar 2026',
    readTime: '10 Min. Lesezeit',
    title: 'Arbeitsmarkt-Trends: Was sich dieses Jahr ändert',
    excerpt: 'Fachkräftemangel, KI-Revolution und New Work: Welche Branchen boomen und wo die besten Chancen für Jobsuchende liegen.',
    content: [
      'Das Jahr 2026 bringt tiefgreifende Veränderungen am deutschen Arbeitsmarkt. Der Fachkräftemangel hat sich in vielen Branchen verschärft, während gleichzeitig neue Berufsbilder durch KI und Automatisierung entstehen.',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.',
      'Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.',
    ],
  },
  {
    slug: 'versteckter-stellenmarkt',
    category: 'Karriere-Wissen',
    date: '20. Januar 2026',
    readTime: '7 Min. Lesezeit',
    title: 'Der versteckte Stellenmarkt: So findest du unadvertierte Jobs',
    excerpt: 'Bis zu 70% aller Stellen werden nie öffentlich ausgeschrieben. Erfahre, wie du an diese versteckten Chancen kommst.',
    content: [
      'Wusstest du, dass ein Großteil aller offenen Stellen nie auf klassischen Jobportalen erscheint? Der sogenannte versteckte Stellenmarkt umfasst Positionen, die intern besetzt, über Netzwerke vergeben oder direkt auf Unternehmens-Karriereseiten veröffentlicht werden.',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quis lorem ut libero malesuada feugiat. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi.',
      'Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.',
    ],
  },
  {
    slug: 'ki-jobsuche',
    category: 'Technologie',
    date: '16. Januar 2026',
    readTime: '6 Min. Lesezeit',
    title: 'KI in der Jobsuche: Revolution oder Risiko?',
    excerpt: 'Wie künstliche Intelligenz die Art verändert, wie wir nach Jobs suchen — und worauf du achten solltest.',
    content: [
      'Künstliche Intelligenz transformiert den Recruiting-Markt von beiden Seiten: Unternehmen setzen KI für Bewerberauswahl ein, während Jobsuchende KI-Tools nutzen, um passende Stellen zu finden.',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Curabitur aliquet quam id dui posuere blandit.',
      'Nulla porttitor accumsan tincidunt. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Nulla quis lorem ut libero malesuada feugiat.',
    ],
  },
  {
    slug: 'gehaltsverhandlung',
    category: 'Karriere-Wissen',
    date: '12. Januar 2026',
    readTime: '9 Min. Lesezeit',
    title: 'Gehaltsverhandlung: 7 Strategien für mehr Gehalt',
    excerpt: 'Mit der richtigen Vorbereitung und diesen Verhandlungsstrategien holst du das Maximum aus deinem nächsten Gehaltsgespräch.',
    content: [
      'Die Gehaltsverhandlung ist für viele Bewerber der stressigste Teil des Bewerbungsprozesses. Dabei ist gute Vorbereitung der Schlüssel zum Erfolg.',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    ],
  },
  {
    slug: 'remote-work-2026',
    category: 'Arbeitsmarkt',
    date: '8. Januar 2026',
    readTime: '8 Min. Lesezeit',
    title: 'Remote Work 2026: Die besten Branchen und Positionen',
    excerpt: 'Welche Jobs bieten die besten Remote-Möglichkeiten? Ein Überblick über Branchen, Gehälter und Trends.',
    content: [
      'Remote Work hat sich von einem Trend zu einer festen Größe am Arbeitsmarkt entwickelt. Doch nicht alle Branchen und Positionen eignen sich gleichermaßen für ortsunabhängiges Arbeiten.',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Proin eget tortor risus.',
      'Vivamus suscipit tortor eget felis porttitor volutpat. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem.',
    ],
  },
]

export const metadata = {
  title: 'Karriere-Tipps & Arbeitsmarkt-Wissen | pexible Blog',
  description:
    'Bewerbungstipps, Arbeitsmarkt-Trends und Karriere-Ratgeber. Expertenwissen fuer deine erfolgreiche Jobsuche. Jetzt lesen auf pexible.',
  openGraph: {
    title: 'Karriere-Tipps & Arbeitsmarkt-Wissen | pexible Blog',
    description:
      'Bewerbungstipps, Arbeitsmarkt-Trends und Karriere-Ratgeber. Expertenwissen fuer deine erfolgreiche Jobsuche.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Karriere-Tipps & Arbeitsmarkt-Wissen | pexible Blog',
    description:
      'Bewerbungstipps, Arbeitsmarkt-Trends und Karriere-Ratgeber. Expertenwissen fuer deine erfolgreiche Jobsuche.',
  },
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F0] text-[#1A1A2E]">

      <Navbar />

      {/* ─── Header ─── */}
      <section className="px-4 pt-16 sm:pt-24 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold text-[#F5B731] bg-[#F5B731]/10 px-3 py-1.5 rounded-full">BLOG</span>
          <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Karriere-Tipps &amp;<br />Arbeitsmarkt-Wissen
          </h1>
          <p className="mt-4 text-lg text-[#6B7280] max-w-xl mx-auto">
            Aktuelle Artikel zu Bewerbungsstrategien, Arbeitsmarkt-Trends und allem, was deine Karriere voranbringt.
          </p>
        </div>
      </section>

      {/* ─── Featured Article ─── */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <Link href={`/blog#${articles[0].slug}`} className="group block bg-white rounded-2xl border border-[#E8E0D4]/60 overflow-hidden hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="h-44 sm:h-56 md:h-auto bg-gradient-to-br from-[#FEF3D0] via-[#FDEDB8] to-[#F5B731]/20 flex items-center justify-center">
                <svg className="w-16 h-16 text-[#E8930C]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              </div>
              <div className="p-5 sm:p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold text-[#F5B731] bg-[#F5B731]/10 px-2.5 py-1 rounded-full">{articles[0].category}</span>
                  <span className="text-xs text-[#9CA3AF]">{articles[0].date}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] group-hover:text-[#F5B731] transition-colors leading-tight mb-3">
                  {articles[0].title}
                </h2>
                <p className="text-[#6B7280] leading-relaxed mb-4">{articles[0].excerpt}</p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A1A2E] group-hover:text-[#F5B731] transition-colors">
                  Weiterlesen
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ─── Article Grid ─── */}
      <section className="px-4 pb-20 sm:pb-28">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-xl font-bold text-[#1A1A2E] mb-8">Alle Artikel</h3>
          <div className="grid md:grid-cols-3 gap-5">
            {articles.slice(1).map((article) => (
              <article key={article.slug} id={article.slug} className="group bg-white rounded-2xl border border-[#E8E0D4]/60 overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
                <div className="h-32 sm:h-40 bg-gradient-to-br from-[#FEF3D0] to-[#FDEDB8] flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#E8930C]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-semibold text-[#F5B731] bg-[#F5B731]/10 px-2.5 py-1 rounded-full">{article.category}</span>
                    <span className="text-xs text-[#9CA3AF]">{article.readTime}</span>
                  </div>
                  <h3 className="font-bold text-[#1A1A2E] group-hover:text-[#F5B731] transition-colors leading-snug mb-2">{article.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed line-clamp-2 mb-4">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9CA3AF]">{article.date}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1A1A2E] group-hover:text-[#F5B731] transition-colors">
                      Lesen
                      <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="px-4 pb-20 sm:pb-28">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-[#1A1A2E] to-[#2D2D44] rounded-2xl px-8 sm:px-12 py-10 sm:py-14 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#F5B731]/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
                Statt lesen &ndash; direkt finden
              </h2>
              <p className="text-[#9CA3AF] mb-6 max-w-md mx-auto text-sm">
                Unser KI-Makler findet passende Stellen für dich. Kostenlos starten, Ergebnisse sofort erhalten.
              </p>
              <Link href="/chat" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 min-h-[48px] bg-[#F5B731] text-[#1A1A2E] font-semibold rounded-full hover:bg-[#E8930C] transition-colors text-sm shadow-lg shadow-[#F5B731]/20">
                Jetzt Jobsuche starten
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* BlogPosting JSON-LD structured data for search engine rich snippets */}
      <Script
        id="blog-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'pexible Blog - Karriere-Tipps & Arbeitsmarkt-Wissen',
            description:
              'Bewerbungstipps, Arbeitsmarkt-Trends und Karriere-Ratgeber.',
            url: 'https://pexible.de/blog',
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: articles.map((article, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'BlogPosting',
                  headline: article.title,
                  description: article.excerpt,
                  datePublished: article.date,
                  author: {
                    '@type': 'Organization',
                    name: 'pexible',
                  },
                  publisher: {
                    '@type': 'Organization',
                    name: 'pexible',
                    url: 'https://pexible.de',
                  },
                },
              })),
            },
          }),
        }}
      />

      {/* BreadcrumbList JSON-LD */}
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Startseite',
                item: 'https://pexible.de',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: 'https://pexible.de/blog',
              },
            ],
          }),
        }}
      />
    </div>
  )
}
