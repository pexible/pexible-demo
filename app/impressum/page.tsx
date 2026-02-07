import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Impressum',
  description:
    'Impressum der pexible GmbH. Angaben gemaess § 5 TMG, Kontaktdaten, Registergericht und Widerrufsbelehrung.',
}

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F0] text-[#1A1A2E]">
      <Navbar />

      <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[#9CA3AF]">
          <ol className="flex items-center gap-0">
            <li><Link href="/" className="hover:text-[#1A1A2E] transition-colors">Startseite</Link></li>
            <li><span className="mx-2" aria-hidden="true">/</span></li>
            <li aria-current="page"><span className="text-[#1A1A2E] font-medium">Impressum</span></li>
          </ol>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-10">
          Impressum
        </h1>

        <div className="prose-legal space-y-8 text-[#4A5568] text-sm sm:text-base leading-relaxed">
          {/* Angaben */}
          <section>
            <p className="font-semibold text-[#1A1A2E] text-base sm:text-lg">
              pexible GmbH
            </p>
            <p>
              Bornaer Chaussee 67a
              <br />
              04416 Markkleeberg
              <br />
              Deutschland
            </p>
            <p className="mt-4">
              Tel.: 034297/608893
              <br />
              E-Mail:{' '}
              <a
                href="mailto:impressum@pexible.de"
                className="text-[#F5B731] hover:text-[#E8930C] transition-colors"
              >
                impressum@pexible.de
              </a>
            </p>
            <p className="mt-4">
              Registergericht: Amtsgericht Leipzig
              <br />
              Registernummer: 43822
            </p>
            <p className="mt-4">
              Geschaeftsfuehrer: Timm Schindler
            </p>
            <p className="mt-4">
              Umsatzsteuer-Identifikationsnummer: DE452906191
            </p>
            <p className="mt-4">
              Verantwortliche/r i.S.d. &sect; 18 Abs. 2 MStV:
              <br />
              Timm Schindler, Bornaer Chaussee 67a, 04416 Markkleeberg
            </p>
          </section>

          {/* Widerruf */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A2E] mb-4">
              Widerruf
            </h2>
            <p>
              Verbrauchern steht ein Widerrufsrecht nach folgender Massgabe zu,
              wobei Verbraucher jede natuerliche Person ist, die ein
              Rechtsgeschaeft zu Zwecken abschliesst, die ueberwiegend weder
              ihrer gewerblichen noch ihrer selbstaendigen beruflichen
              Taetigkeit zugerechnet werden koennen:
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-3">
              A. Widerrufsbelehrung
            </h3>

            <h4 className="font-semibold text-[#1A1A2E] mb-2">
              Widerrufsrecht
            </h4>
            <p>
              Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von
              Gruenden diesen Vertrag zu widerrufen.
            </p>
            <p className="mt-3">
              Bei Vertraegen zur Lieferung von Waren betraegt die
              Widerrufsfrist vierzehn Tage ab dem Tag, an dem Sie oder ein von
              Ihnen benannter Dritter, der nicht der Befoerderer ist, die letzte
              Ware in Besitz genommen haben bzw. hat.
            </p>
            <p className="mt-3">
              Bei Vertraegen zur Lieferung von nicht auf einem koerperlichen
              Datentraeger befindlichen Daten, die in digitaler Form hergestellt
              und bereitgestellt werden (digitale Inhalte) betraegt die
              Widerrufsfrist vierzehn Tage ab dem Tag des Vertragsabschlusses.
            </p>
            <p className="mt-3">
              Um Ihr Widerrufsrecht auszuueben, muessen Sie uns (pexible GmbH,
              Bornaer Chaussee 67a, 04416 Markkleeberg, Deutschland, Tel.:
              034297/608893, E-Mail: impressum@pexible.de) mittels einer
              eindeutigen Erklaerung (z.&nbsp;B. ein mit der Post versandter
              Brief oder E-Mail) ueber Ihren Entschluss, diesen Vertrag zu
              widerrufen, informieren. Sie koennen dafuer das beigefuegte
              Muster-Widerrufsformular verwenden, das jedoch nicht
              vorgeschrieben ist.
            </p>
            <p className="mt-3">
              Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die
              Mitteilung ueber die Ausuebung des Widerrufsrechts vor Ablauf der
              Widerrufsfrist absenden.
            </p>

            <h4 className="font-semibold text-[#1A1A2E] mt-6 mb-2">
              Folgen des Widerrufs
            </h4>
            <p>
              Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle
              Zahlungen, die wir von Ihnen erhalten haben, einschliesslich der
              Lieferkosten (mit Ausnahme der zusaetzlichen Kosten, die sich
              daraus ergeben, dass Sie eine andere Art der Lieferung als die von
              uns angebotene, guenstigste Standardlieferung gewaehlt haben),
              unverzueglich und spaetestens binnen vierzehn Tagen ab dem Tag
              zurueckzuzahlen, an dem die Mitteilung ueber Ihren Widerruf
              dieses Vertrags bei uns eingegangen ist. Fuer diese Rueckzahlung
              verwenden wir dasselbe Zahlungsmittel, das Sie bei der
              urspruenglichen Transaktion eingesetzt haben, es sei denn, mit
              Ihnen wurde ausdruecklich etwas anderes vereinbart; in keinem Fall
              werden Ihnen wegen dieser Rueckzahlung Entgelte berechnet.
            </p>
            <p className="mt-3">
              Bei Vertraegen zur Lieferung von Waren koennen wir die
              Rueckzahlung verweigern, bis wir die Waren wieder zurueckerhalten
              haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren
              zurueckgesandt haben, je nachdem, welches der fruehere Zeitpunkt
              ist.
            </p>
            <p className="mt-3">
              Sie haben die Waren unverzueglich und in jedem Fall spaetestens
              binnen vierzehn Tagen ab dem Tag, an dem Sie uns ueber den
              Widerruf dieses Vertrags unterrichten, an uns zurueckzusenden oder
              zu uebergeben. Die Frist ist gewahrt, wenn Sie die Waren vor
              Ablauf der Frist von vierzehn Tagen absenden.
            </p>
            <p className="mt-3">
              Sie tragen die unmittelbaren Kosten der Ruecksendung der Waren.
            </p>
            <p className="mt-3">
              Sie muessen fuer einen etwaigen Wertverlust der Waren nur
              aufkommen, wenn dieser Wertverlust auf einen zur Pruefung der
              Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht
              notwendigen Umgang mit ihnen zurueckzufuehren ist.
            </p>

            <h4 className="font-semibold text-[#1A1A2E] mt-6 mb-2">
              Ausschluss bzw. vorzeitiges Erloeschen des Widerrufsrechts
            </h4>
            <p>
              Das Widerrufsrecht besteht nicht bei Vertraegen zur Lieferung von
              Waren, die nicht vorgefertigt sind und fuer deren Herstellung eine
              individuelle Auswahl oder Bestimmung durch den Verbraucher
              massgeblich ist oder die eindeutig auf die persoenlichen
              Beduerfnisse des Verbrauchers zugeschnitten sind.
            </p>
            <p className="mt-3">
              Das Widerrufsrecht erlischt vorzeitig bei Vertraegen zur
              Bereitstellung von digitalen Inhalten, wenn wir mit der
              Vertragserfuellung begonnen haben, nachdem Sie ausdruecklich
              zugestimmt haben, dass wir mit der Vertragserfuellung vor Ablauf
              der Widerrufsfrist beginnen, Sie uns Ihre Kenntnis davon
              bestaetigt haben, dass Sie durch Ihre Zustimmung mit Beginn der
              Vertragserfuellung Ihr Widerrufsrecht verlieren, und wir Ihnen
              eine Bestaetigung des Vertrags, in der der Vertragsinhalt
              einschliesslich der vorgenannten Voraussetzungen zum vorzeitigen
              Erloeschen des Widerrufsrechts wiedergegeben ist, auf einem
              dauerhaften Datentraeger zur Verfuegung gestellt haben.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-3">
              B. Widerrufsformular
            </h3>
            <p>
              Wenn Sie den Vertrag widerrufen wollen, dann fuellen Sie bitte
              dieses Formular aus und senden es zurueck.
            </p>

            <div className="mt-4 bg-white rounded-xl border border-[#E8E0D4]/60 p-5 sm:p-6">
              <p className="text-sm">An</p>
              <p className="mt-2 text-sm">
                pexible GmbH
                <br />
                Bornaer Chaussee 67a
                <br />
                04416 Markkleeberg
                <br />
                Deutschland
              </p>
              <p className="mt-2 text-sm">
                E-Mail:{' '}
                <a
                  href="mailto:impressum@pexible.de"
                  className="text-[#F5B731] hover:text-[#E8930C] transition-colors"
                >
                  impressum@pexible.de
                </a>
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <p>
                  Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*)
                  abgeschlossenen Vertrag ueber den Kauf der folgenden Waren (*)
                  / die Erbringung der folgenden Dienstleistung (*)
                </p>
                <div className="border-b border-[#E8E0D4] pt-4" />
                <div className="border-b border-[#E8E0D4] pt-4" />
                <p>
                  Bestellt am (*) ____________ / erhalten am (*)
                  __________________
                </p>
                <div className="border-b border-[#E8E0D4] pt-4" />
                <p>Name des/der Verbraucher(s)</p>
                <div className="border-b border-[#E8E0D4] pt-4" />
                <p>Anschrift des/der Verbraucher(s)</p>
                <div className="border-b border-[#E8E0D4] pt-4" />
                <p>
                  Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf
                  Papier)
                </p>
                <div className="border-b border-[#E8E0D4] pt-4" />
                <p>Datum</p>
                <p className="mt-4 text-[#9CA3AF]">
                  (*) Unzutreffendes streichen
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
