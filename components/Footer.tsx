import Link from 'next/link'
import { footerGroups } from '@/lib/navigation'

export default function Footer() {
  return (
    <footer className="border-t border-[#E8E0D4]/60 bg-[#F9F5EE]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl font-bold italic text-[#1A1A2E] tracking-tight">pexible</span>
            <p className="text-sm text-[#6B7280] mt-3 leading-relaxed">Dein pers&ouml;nlicher KI Job-Makler. Finde Stellen, die andere nicht sehen.</p>
          </div>

          {/* Dynamic footer groups from navigation config */}
          {footerGroups.map((group) => (
            <nav key={group.title} aria-label={`${group.title}-Navigation`}>
              <h3 className="font-semibold text-[#1A1A2E] text-sm mb-4">{group.title}</h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2 rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
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
