import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-[#E8E0D4]/60 bg-[#F9F5EE]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl font-bold italic text-[#1A1A2E] tracking-tight">pexible</span>
            <p className="text-sm text-[#6B7280] mt-3 leading-relaxed">Dein pers&ouml;nlicher KI Job-Makler. Finde Stellen, die andere nicht sehen.</p>
          </div>
          <div>
            <h4 className="font-semibold text-[#1A1A2E] text-sm mb-4">Produkt</h4>
            <ul className="space-y-2.5">
              <li><Link href="/#funktionen" className="text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Funktionen</Link></li>
              <li><Link href="/#so-funktionierts" className="text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors">So funktioniert&apos;s</Link></li>
              <li><Link href="/chat" className="text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Job-Suche starten</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#1A1A2E] text-sm mb-4">Ressourcen</h4>
            <ul className="space-y-2.5">
              <li><Link href="/blog" className="text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Blog</Link></li>
              <li><Link href="/#erfolgsgeschichten" className="text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Erfolgsgeschichten</Link></li>
              <li><Link href="/blog#bewerbungstipps-2026" className="text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Bewerbungstipps</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#1A1A2E] text-sm mb-4">Rechtliches</h4>
            <ul className="space-y-2.5">
              <li><Link href="/impressum" className="text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Impressum</Link></li>
              <li><Link href="/datenschutz" className="text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Datenschutz</Link></li>
              <li><Link href="/impressum#widerruf" className="text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors">AGB</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-[#E8E0D4]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#9CA3AF]">&copy; {new Date().getFullYear()} pexible. Alle Rechte vorbehalten.</p>
          <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
            <span>SSL-verschl&uuml;sselt</span>
            <span>&bull;</span>
            <span>DSGVO-konform</span>
            <span>&bull;</span>
            <span>Made in Germany</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
