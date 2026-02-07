import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FaqAccordion from '@/components/FaqAccordion'

// ─── FAQ Data ───

const faqItems = [
  {
    q: 'Was genau ist pexible?',
    a: 'Pexible ist dein persönlicher KI Job-Makler. Statt auf Jobportale zu warten, durchsuchen unsere KI-Agenten tausende Karriereseiten von Unternehmen direkt — und finden Stellen, die nirgendwo sonst ausgeschrieben sind.',
  },
  {
    q: 'Wie unterscheidet sich pexible von Indeed oder StepStone?',
    a: 'Klassische Jobportale zeigen nur Stellen, die Unternehmen dort aktiv schalten. Das ist nur ein Bruchteil aller offenen Positionen. Pexible geht direkt auf die Karriereseiten der Unternehmen und findet auch Stellen, die nie auf einem Portal erscheinen — der sogenannte versteckte Stellenmarkt.',
  },
  {
    q: 'Was kostet die Nutzung?',
    a: 'Der Einstieg ist kostenlos: Du erhältst die ersten 3 Ergebnisse ohne Kosten. Wenn du alle gefundenen Stellen sehen möchtest, kostet das einmalig 49 € — kein Abo, keine versteckten Kosten.',
  },
  {
    q: 'Wie funktioniert die KI-gestützte Suche?',
    a: 'Du beschreibst im Chat, welchen Job du suchst und wo. Unsere KI-Agenten besuchen dann die Karriereseiten relevanter Unternehmen in deiner Region, analysieren die Stellenanzeigen und liefern dir eine kuratierte Liste passender Positionen mit direkten Links.',
  },
  {
    q: 'Sind meine Daten sicher?',
    a: 'Absolut. Deine Daten werden SSL-verschlüsselt übertragen, Zahlungen laufen über Stripe (PCI-DSS zertifiziert) und wir geben keine persönlichen Daten an Dritte weiter. Du behältst die volle Kontrolle über deine Informationen.',
  },
  {
    q: 'Wie schnell erhalte ich Ergebnisse?',
    a: 'Sobald du deinen Suchauftrag im Chat abgeschlossen hast, erhältst du sofort deine ersten Ergebnisse. Die gesamte Suche dauert typischerweise weniger als eine Minute.',
  },
]

// ─── Blog Preview Data ───

const blogPosts = [
  {
    category: 'Bewerbungstipps',
    title: 'Die 10 besten Bewerbungstipps für 2026',
    excerpt: 'Von der perfekten Anrede bis zum Follow-up: Diese bewährten Strategien erhöhen deine Chancen auf eine Einladung zum Vorstellungsgespräch deutlich.',
    slug: 'bewerbungstipps-2026',
  },
  {
    category: 'Arbeitsmarkt',
    title: 'Arbeitsmarkt-Trends: Was sich dieses Jahr ändert',
    excerpt: 'Fachkräftemangel, KI-Revolution und New Work: Welche Branchen boomen und wo die besten Chancen für Jobsuchende liegen.',
    slug: 'arbeitsmarkt-trends',
  },
  {
    category: 'Karriere-Wissen',
    title: 'Der versteckte Stellenmarkt: So findest du unadvertierte Jobs',
    excerpt: 'Bis zu 70% aller Stellen werden nie öffentlich ausgeschrieben. Erfahre, wie du an diese versteckten Chancen kommst.',
    slug: 'versteckter-stellenmarkt',
  },
]

// ─── Main Landing Page ───

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F0] text-[#1A1A2E]">

      <Navbar />

      <main id="main-content">
      {/* ─── Hero Section ─── */}
      <section className="relative px-4 pt-16 sm:pt-24 pb-12 sm:pb-16 overflow-hidden">
        {/* Subtle background shapes */}
        <div className="absolute top-[60px] right-[-100px] w-[400px] h-[400px] bg-[#F5B731]/[0.06] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-50px] left-[-150px] w-[350px] h-[350px] bg-[#E8930C]/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-[#E8E0D4] rounded-full text-xs sm:text-sm mb-6 sm:mb-8 shadow-sm">
            <span className="bg-[#E8930C] text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">NEU</span>
            <span className="text-[#4A5568]">Dein KI Job-Makler &ndash; jetzt verfügbar</span>
            <Link href="/chat" className="text-[#1A1A2E] font-medium hover:underline flex-shrink-0" aria-label="Chat starten">&rarr;</Link>
          </div>

          {/* Main Headline */}
          <h1 className="text-[2.5rem] sm:text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
            <span className="block">Wo deine Jobsuche</span>
            <span className="inline-block relative mr-2 sm:mr-4">
              <span className="relative">
                <span className="text-[#9CA3AF]">aufhört</span>
                <svg className="absolute left-[-4px] top-1/2 w-[calc(100%+8px)]" viewBox="0 0 200 8" preserveAspectRatio="none" style={{ transform: 'translateY(-50%) rotate(-1.5deg)' }}>
                  <line x1="0" y1="4" x2="200" y2="4" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </span>
            <span className="italic text-[#F5B731]">anfängt</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-[#6B7280] max-w-2xl mx-auto leading-relaxed mb-10">
            Vergiss Jobportale: Unser KI-Makler durchsucht tausende Karriereseiten direkt &ndash; und findet Stellen, die nirgendwo ausgeschrieben sind.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/chat"
              className="w-full sm:w-auto text-center px-8 py-3.5 min-h-[48px] flex items-center justify-center bg-[#1A1A2E] text-white font-semibold rounded-full hover:bg-[#2D2D44] transition-all text-sm shadow-lg shadow-[#1A1A2E]/10"
            >
              Kostenlos starten
            </Link>
            <a
              href="#so-funktionierts"
              className="w-full sm:w-auto text-center px-8 py-3.5 min-h-[48px] flex items-center justify-center bg-white text-[#1A1A2E] font-semibold rounded-full border border-[#E8E0D4] hover:border-[#D1C9BD] hover:bg-[#F9F5EE] transition-all text-sm"
            >
              So funktioniert&apos;s
            </a>
          </div>
        </div>
      </section>

      {/* ─── Product Showcase ─── */}
      <section className="px-4 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto relative">
          {/* Floating Testimonial - Left */}
          <div className="hidden lg:block absolute -left-12 top-16 z-10 bg-white rounded-2xl shadow-xl shadow-black/5 border border-[#E8E0D4]/60 p-4 max-w-[240px] animate-float">
            <p className="text-sm text-[#4A5568] leading-relaxed mb-3">
              &ldquo;In 2 Wochen hatte ich 3 Vorstellungsgespräche!&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#F5B731]/40 to-[#F5B731]/10 rounded-full flex items-center justify-center text-xs font-bold text-[#E8930C]">J</div>
              <div>
                <p className="text-xs font-semibold text-[#1A1A2E]">Julia M.</p>
                <p className="text-xs text-[#9CA3AF]">Marketing Managerin</p>
              </div>
            </div>
          </div>

          {/* Floating Testimonial - Right */}
          <div className="hidden lg:block absolute -right-8 top-48 z-10 bg-white rounded-2xl shadow-xl shadow-black/5 border border-[#E8E0D4]/60 p-4 max-w-[260px] animate-float" style={{ animationDelay: '3s' }}>
            <p className="text-sm text-[#4A5568] leading-relaxed mb-3">
              &ldquo;12 Unternehmen gefunden, die perfekt passen. Auf keinem Portal sichtbar!&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400/30 to-blue-400/10 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">S</div>
              <div>
                <p className="text-xs font-semibold text-[#1A1A2E]">Samir R.</p>
                <p className="text-xs text-[#9CA3AF]">IT-Spezialist, Berlin</p>
              </div>
            </div>
          </div>

          {/* Chat Mockup */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-b from-[#F5B731]/10 via-[#F5B731]/5 to-transparent rounded-[2rem] blur-xl pointer-events-none" />

            <div className="relative bg-white rounded-2xl shadow-2xl shadow-black/8 border border-[#E8E0D4]/80 overflow-hidden">
              {/* Chat Header */}
              <div className="px-5 py-3.5 border-b border-[#F0EBE2] flex items-center gap-3 bg-[#FDFBF7]">
                <div className="w-10 h-10 bg-gradient-to-br from-[#F5B731] to-[#E8930C] rounded-full flex items-center justify-center shadow-md shadow-[#F5B731]/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A2E] text-sm">pexible Job-Makler</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-[#9CA3AF]">Online</span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="px-4 sm:px-5 py-4 sm:py-6 space-y-3 sm:space-y-4 bg-[#FEFCF9]">
                <div className="flex justify-start">
                  <div className="max-w-[85%] bg-[#F5F0E8] rounded-2xl rounded-tl-md px-4 py-3 text-sm text-[#1A1A2E] leading-relaxed">
                    Hey! Ich bin dein persönlicher Job-Makler. Ich finde Stellen, die nicht auf den großen Portalen stehen. In welchem Bereich suchst du?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-[#F5B731] rounded-2xl rounded-tr-md px-4 py-3 text-sm text-[#1A1A2E] font-medium">
                    Marketing Manager in München
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[85%] bg-[#F5F0E8] rounded-2xl rounded-tl-md px-4 py-3 text-sm text-[#1A1A2E] leading-relaxed">
                    Super! Ich durchsuche jetzt über 2.000 Karriereseiten in der Region München...
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[85%] bg-[#F5F0E8] rounded-2xl rounded-tl-md px-4 py-3 text-sm text-[#1A1A2E] leading-relaxed">
                    <span className="font-semibold">12 passende Stellen gefunden!</span> Darunter BMW, Siemens und 10 weitere. Soll ich dir die Ergebnisse zeigen?
                  </div>
                </div>
              </div>

              {/* Chat Input Mock */}
              <div className="border-t border-[#F0EBE2] px-4 py-3 bg-white">
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 bg-[#F9F5EE] border border-[#E8E0D4] rounded-xl text-sm text-[#9CA3AF]">
                    z.B. Software Entwickler in Berlin...
                  </div>
                  <Link href="/chat" className="px-4 py-3 bg-[#F5B731] hover:bg-[#E8930C] rounded-xl transition-colors flex items-center" aria-label="Nachricht senden">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-8 text-xs text-[#9CA3AF]">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <span>SSL-verschlüsselt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#F5B731]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span>KI-gestützt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              <span>Sichere Zahlung via Stripe</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <span>DSGVO-konform</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Social Proof Bar ─── */}
      <section className="py-12 sm:py-16 border-y border-[#E8E0D4]/60 bg-[#F9F5EE]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 mb-10">
            {[
              { value: '2.000+', label: 'Karriereseiten durchsucht' },
              { value: '4.8/5', label: 'Nutzerbewertung' },
              { value: '85%', label: 'erhalten Rückmeldungen' },
              { value: '1.200+', label: 'erfolgreiche Suchen' },
            ].map((stat, i) => (
              <div key={i} className="text-center flex items-center gap-6 sm:gap-12">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E]">{stat.value}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{stat.label}</p>
                </div>
                {i < 3 && <div className="hidden sm:block w-px h-10 bg-[#E8E0D4]" />}
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-[#9CA3AF] mb-6">Unsere KI durchsucht Karriereseiten von führenden Unternehmen</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-40 grayscale">
            {['Siemens', 'BMW', 'SAP', 'Bosch', 'Allianz', 'Mercedes-Benz', 'BASF'].map((name) => (
              <span key={name} className="text-lg sm:text-xl font-bold text-[#1A1A2E] tracking-tight">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="so-funktionierts" className="px-4 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              In 3 Schritten zum{' '}
              <span className="text-[#F5B731]">Traumjob</span>
            </h2>
            <p className="mt-4 text-[#6B7280] max-w-lg mx-auto text-base sm:text-lg">
              Kein langes Suchen, kein endloses Scrollen. Einfach chatten und passende Stellen erhalten.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: '01',
                icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
                title: 'Starte den Chat',
                text: 'Beschreibe einfach, welchen Job du suchst und wo. Unser KI-Makler stellt gezielte Fragen, um dein Profil zu verstehen.',
              },
              {
                step: '02',
                icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>,
                title: 'KI durchsucht Karriereseiten',
                text: 'Unsere KI-Agenten besuchen tausende Unternehmenswebsites und analysieren offene Stellen — in Echtzeit.',
              },
              {
                step: '03',
                icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>,
                title: 'Ergebnisse erhalten',
                text: 'Du erhältst eine kuratierte Liste passender Jobs mit direkten Links zu den Karriereseiten — inklusive PDF-Download.',
              },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-2xl border border-[#E8E0D4]/60 p-6 sm:p-8 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 group">
                <span className="text-xs font-bold text-[#F5B731] bg-[#F5B731]/10 px-2.5 py-1 rounded-full">{s.step}</span>
                <div className="w-12 h-12 bg-[#FDF8F0] rounded-xl flex items-center justify-center mt-5 mb-5 text-[#F5B731] group-hover:bg-[#F5B731] group-hover:text-white transition-all duration-300">
                  {s.icon}
                </div>
                <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{s.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Feature Highlight ─── */}
      <section id="funktionen" className="px-4 py-20 sm:py-28 bg-[#F9F5EE]">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-8">
                Jobportale sind überfüllt.<br />
                <span className="text-[#1A1A2E]">Pexible nicht.</span>
              </h2>

              <div className="space-y-5">
                {[
                  { color: 'bg-[#F5B731]', text: 'KI-Agenten durchsuchen Karriereseiten direkt' },
                  { color: 'bg-[#E8930C]', text: 'Versteckte Stellen, die nirgendwo ausgeschrieben sind' },
                  { color: 'bg-blue-500', text: 'Individuelle Empfehlungen statt Massenanzeigen' },
                  { color: 'bg-green-500', text: 'Ergebnisse in Minuten statt Stunden' },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`w-1 h-full min-h-[40px] ${f.color} rounded-full flex-shrink-0`} />
                    <p className="text-[#4A5568] text-base leading-relaxed">{f.text}</p>
                  </div>
                ))}
              </div>

              <Link href="/chat" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-[#1A1A2E] text-white font-semibold rounded-full hover:bg-[#2D2D44] transition-colors text-sm">
                Jetzt ausprobieren
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Link>
            </div>

            {/* Visual - Search Results Card */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#F5B731]/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />
              <div className="relative bg-white rounded-2xl shadow-xl shadow-black/5 border border-[#E8E0D4]/60 overflow-hidden">
                <div className="bg-gradient-to-r from-[#FEF3D0] to-[#FDEDB8] px-6 py-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#E8930C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                    </div>
                    <span className="text-sm font-semibold text-[#1A1A2E]">Suchergebnisse</span>
                  </div>
                </div>
                <div className="px-6 py-5 space-y-4">
                  {[
                    { company: 'BMW Group', role: 'Marketing Manager', status: 'Neu', sc: 'bg-green-100 text-green-700' },
                    { company: 'Siemens AG', role: 'Brand Manager', status: 'Neu', sc: 'bg-green-100 text-green-700' },
                    { company: 'Allianz SE', role: 'Marketing Lead', status: 'Direkt', sc: 'bg-blue-100 text-blue-700' },
                    { company: 'SAP', role: 'Digital Marketing', status: 'Versteckt', sc: 'bg-amber-100 text-amber-700' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[#F0EBE2] last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-[#1A1A2E]">{r.company}</p>
                        <p className="text-xs text-[#9CA3AF]">{r.role}</p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${r.sc}`}>{r.status}</span>
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-5">
                  <div className="flex items-center justify-between text-xs text-[#9CA3AF] bg-[#FDFBF7] rounded-xl px-4 py-3 border border-[#F0EBE2]">
                    <span>12 Ergebnisse gefunden</span>
                    <span className="font-medium text-[#F5B731]">PDF herunterladen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="px-4 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Alles, was deine Jobsuche braucht</h2>
            <p className="mt-4 text-[#6B7280] max-w-lg mx-auto">Moderne Technologie trifft auf persönliche Betreuung.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>, title: 'Direkte Karriereseiten-Suche', text: 'Keine Umwege über Portale. Wir suchen direkt bei den Unternehmen.' },
              { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>, title: 'KI-gestützte Analyse', text: 'Unsere Agenten verstehen Stellenanzeigen wie ein Mensch — und finden verborgene Chancen.' },
              { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>, title: 'Sprachsteuerung', text: 'Steuere deine Jobsuche per Stimme. Einfach sprechen statt tippen.' },
              { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>, title: 'PDF-Export', text: 'Lade deine Ergebnisse als professionelles PDF herunter — jederzeit.' },
              { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>, title: 'Regionale Suche', text: 'Finde Jobs in deiner Stadt oder Region. Präzise Ergebnisse nach Postleitzahl.' },
              { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>, title: 'Datenschutz garantiert', text: 'SSL-Verschlüsselung, Stripe-Zahlung und DSGVO-Konformität. Deine Daten sind sicher.' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E8E0D4]/60 p-6 hover:shadow-lg hover:shadow-black/5 hover:border-[#E8E0D4] transition-all duration-300 group">
                <div className="w-11 h-11 bg-[#FDF8F0] rounded-xl flex items-center justify-center mb-4 text-[#F5B731] group-hover:bg-[#F5B731] group-hover:text-white transition-all duration-300">{f.icon}</div>
                <h3 className="font-bold text-[#1A1A2E] mb-2">{f.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Industries ─── */}
      <section className="px-4 py-20 sm:py-28 bg-[#F9F5EE]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Für jeden Bereich die richtigen Stellen</h2>
          <p className="text-[#6B7280] mb-12 max-w-lg mx-auto">Egal welche Branche — unser KI-Makler kennt die Karriereseiten und findet passende Positionen.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['IT & Software', 'Marketing', 'Vertrieb', 'Ingenieurwesen', 'Gesundheit & Pflege', 'Finanzen', 'Personal (HR)', 'Logistik', 'Design & Kreativ', 'Recht', 'Bildung', 'Handwerk'].map((cat) => (
              <span key={cat} className="px-5 py-2.5 bg-white rounded-full border border-[#E8E0D4]/80 text-sm text-[#4A5568] hover:border-[#F5B731] hover:text-[#1A1A2E] hover:shadow-md hover:shadow-[#F5B731]/5 transition-all cursor-default">{cat}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="erfolgsgeschichten" className="px-4 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Echte Erfolgsgeschichten</h2>
            <p className="mt-4 text-[#6B7280]">Was unsere Nutzer über pexible sagen.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Julia M.', role: 'Marketing Managerin, Leipzig', quote: 'Ich hatte monatelang nichts Passendes gefunden. Pexible hat mir 9 Firmen geschickt, von denen ich noch nie gehört hatte. Zwei Wochen später saß ich im Bewerbungsgespräch.' },
              { name: 'Samir R.', role: 'IT-Spezialist, Berlin', quote: 'Der Agent hat tatsächlich 12 neue Unternehmen gefunden, die genau zu meinem Profil passen. 5 Bewerbungen, 3 Rückmeldungen — in nur einer Woche!' },
              { name: 'Lena K.', role: 'Projektmanagerin, München', quote: 'Die Sprachsteuerung ist genial. Ich konnte meine Jobsuche komplett unterwegs erledigen. Die Ergebnisse waren überraschend gut und relevant.' },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E8E0D4]/60 p-6 hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-[#F5B731]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-sm text-[#4A5568] leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#F0EBE2]">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#F5B731]/30 to-[#F5B731]/10 rounded-full flex items-center justify-center text-sm font-bold text-[#E8930C]">{t.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A2E]">{t.name}</p>
                    <p className="text-xs text-[#9CA3AF]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Blog Preview ─── */}
      <section className="px-4 py-20 sm:py-28 bg-[#F9F5EE]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Aktuelles &amp; Tipps</h2>
              <p className="mt-3 text-[#6B7280]">Wissen rund um Bewerbung, Karriere und Arbeitsmarkt.</p>
            </div>
            <Link href="/blog" className="mt-4 sm:mt-0 text-sm font-semibold text-[#1A1A2E] hover:text-[#F5B731] transition-colors flex items-center gap-1">
              Alle Artikel
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {blogPosts.map((post, i) => (
              <Link key={i} href={`/blog#${post.slug}`} className="group bg-white rounded-2xl border border-[#E8E0D4]/60 overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
                <div className="h-40 bg-gradient-to-br from-[#FEF3D0] to-[#FDEDB8] flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#E8930C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-[#F5B731] bg-[#F5B731]/10 px-2.5 py-1 rounded-full">{post.category}</span>
                  <h3 className="mt-3 font-bold text-[#1A1A2E] group-hover:text-[#F5B731] transition-colors leading-snug">{post.title}</h3>
                  <p className="mt-2 text-sm text-[#6B7280] leading-relaxed line-clamp-2">{post.excerpt}</p>
                  <span className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-[#1A1A2E] group-hover:text-[#F5B731] transition-colors">
                    Weiterlesen
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="px-4 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Häufige Fragen</h2>
            <p className="mt-4 text-[#6B7280]">Alles, was du über pexible wissen musst.</p>
          </div>

          <FaqAccordion items={faqItems} />
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="px-4 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-[#1A1A2E] to-[#2D2D44] rounded-3xl px-8 sm:px-16 py-14 sm:py-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5B731]/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">Bereit, deinen<br />Traumjob zu finden?</h2>
              <p className="text-[#9CA3AF] mb-8 max-w-md mx-auto">Starte jetzt deine kostenlose Suche und entdecke Stellen, die du auf keinem Portal findest.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/chat" className="w-full sm:w-auto text-center px-8 py-3.5 min-h-[48px] flex items-center justify-center bg-[#F5B731] text-[#1A1A2E] font-semibold rounded-full hover:bg-[#E8930C] transition-colors text-sm shadow-lg shadow-[#F5B731]/20">
                  Kostenlos starten
                </Link>
                <a href="#so-funktionierts" className="w-full sm:w-auto text-center px-8 py-3.5 min-h-[48px] flex items-center justify-center text-white/80 hover:text-white font-medium rounded-full border border-white/20 hover:border-white/40 transition-all text-sm">
                  Mehr erfahren
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      </main>

      <Footer />

      {/* FAQPage JSON-LD structured data for search engine rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.a,
              },
            })),
          }),
        }}
      />
    </div>
  )
}
