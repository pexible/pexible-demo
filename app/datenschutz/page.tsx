import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Datenschutzerklaerung',
  description:
    'Datenschutzerklaerung der pexible GmbH. Informationen zur Verarbeitung personenbezogener Daten gemaess DSGVO.',
}

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F0] text-[#1A1A2E]">
      <Navbar />

      <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[#9CA3AF]">
          <ol className="flex items-center gap-0">
            <li><Link href="/" className="hover:text-[#1A1A2E] transition-colors">Startseite</Link></li>
            <li><span className="mx-2" aria-hidden="true">/</span></li>
            <li aria-current="page"><span className="text-[#1A1A2E] font-medium">Datenschutzerklaerung</span></li>
          </ol>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-10">
          Datenschutzerklaerung
        </h1>

        <div className="prose-legal space-y-8 text-[#4A5568] text-sm sm:text-base leading-relaxed">
          {/* 1. Einleitung */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A2E] mb-4">
              1) Einleitung und Kontaktdaten des Verantwortlichen
            </h2>
            <p>
              <strong>1.1</strong> Wir freuen uns, dass Sie unsere Website
              besuchen, und bedanken uns fuer Ihr Interesse. Im Folgenden
              informieren wir Sie ueber den Umgang mit Ihren personenbezogenen
              Daten bei der Nutzung unserer Website. Personenbezogene Daten sind
              hierbei alle Daten, mit denen Sie persoenlich identifiziert werden
              koennen.
            </p>
            <p className="mt-3">
              <strong>1.2</strong> Verantwortlicher fuer die Datenverarbeitung
              auf dieser Website im Sinne der Datenschutz-Grundverordnung
              (DSGVO) ist pexible GmbH, Bornaer Chaussee 67a, 04416
              Markkleeberg, Deutschland, Tel.: 034297/608893, E-Mail:{' '}
              <a
                href="mailto:impressum@pexible.de"
                className="text-[#F5B731] hover:text-[#E8930C] transition-colors"
              >
                impressum@pexible.de
              </a>
              . Der fuer die Verarbeitung von personenbezogenen Daten
              Verantwortliche ist diejenige natuerliche oder juristische Person,
              die allein oder gemeinsam mit anderen ueber die Zwecke und Mittel
              der Verarbeitung von personenbezogenen Daten entscheidet.
            </p>
          </section>

          {/* 2. Datenerfassung */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A2E] mb-4">
              2) Datenerfassung beim Besuch unserer Website
            </h2>
            <p>
              <strong>2.1</strong> Bei der bloss informatorischen Nutzung
              unserer Website, also wenn Sie sich nicht registrieren oder uns
              anderweitig Informationen uebermitteln, erheben wir nur solche
              Daten, die Ihr Browser an den Seitenserver uebermittelt (sog.
              &bdquo;Server-Logfiles&ldquo;). Wenn Sie unsere Website aufrufen,
              erheben wir die folgenden Daten, die fuer uns technisch
              erforderlich sind, um Ihnen die Website anzuzeigen:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Unsere besuchte Website</li>
              <li>Datum und Uhrzeit zum Zeitpunkt des Zugriffes</li>
              <li>Menge der gesendeten Daten in Byte</li>
              <li>
                Quelle/Verweis, von welchem Sie auf die Seite gelangten
              </li>
              <li>Verwendeter Browser</li>
              <li>Verwendetes Betriebssystem</li>
              <li>Verwendete IP-Adresse (ggf.: in anonymisierter Form)</li>
            </ul>
            <p className="mt-3">
              Die Verarbeitung erfolgt gemaess Art. 6 Abs. 1 lit. f DSGVO auf
              Basis unseres berechtigten Interesses an der Verbesserung der
              Stabilitaet und Funktionalitaet unserer Website. Eine Weitergabe
              oder anderweitige Verwendung der Daten findet nicht statt. Wir
              behalten uns allerdings vor, die Server-Logfiles nachtraeglich zu
              ueberpruefen, sollten konkrete Anhaltspunkte auf eine
              rechtswidrige Nutzung hinweisen.
            </p>
            <p className="mt-3">
              <strong>2.2</strong> Diese Website nutzt aus Sicherheitsgruenden
              und zum Schutz der Uebertragung personenbezogener Daten und
              anderer vertraulicher Inhalte (z.B. Bestellungen oder Anfragen an
              den Verantwortlichen) eine SSL-bzw. TLS-Verschluesselung. Sie
              koennen eine verschluesselte Verbindung an der Zeichenfolge
              &bdquo;https://&ldquo; und dem Schloss-Symbol in Ihrer
              Browserzeile erkennen.
            </p>
          </section>

          {/* 3. Hosting */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A2E] mb-4">
              3) Hosting &amp; Content-Delivery-Network
            </h2>
            <p>
              Fuer das Hosting unserer Website und die Darstellung der
              Seiteninhalte nutzen wir einen Anbieter, der seine Leistungen
              selbst oder durch ausgewaehlte Sub-Unternehmer ausschliesslich auf
              Servern innerhalb der Europaeischen Union erbringt.
            </p>
            <p className="mt-3">
              Saemtliche auf unserer Website erhobenen Daten werden auf diesen
              Servern verarbeitet.
            </p>
            <p className="mt-3">
              Wir haben mit dem Anbieter einen Auftragsverarbeitungsvertrag
              geschlossen, der den Schutz der Daten unserer Seitenbesucher
              sicherstellt und eine unberechtigte Weitergabe an Dritte
              untersagt.
            </p>
          </section>

          {/* 4. Cookies */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A2E] mb-4">
              4) Cookies
            </h2>
            <p>
              Um den Besuch unserer Website attraktiv zu gestalten und die
              Nutzung bestimmter Funktionen zu ermoeglichen, verwenden wir
              Cookies, also kleine Textdateien, die auf Ihrem Endgeraet abgelegt
              werden. Teilweise werden diese Cookies nach Schliessen des
              Browsers automatisch wieder geloescht (sog.
              &bdquo;Session-Cookies&ldquo;), teilweise verbleiben diese Cookies
              laenger auf Ihrem Endgeraet und ermoeglichen das Speichern von
              Seiteneinstellungen (sog. &bdquo;persistente Cookies&ldquo;). Im
              letzteren Fall koennen Sie die Speicherdauer der Uebersicht zu den
              Cookie-Einstellungen Ihres Webbrowsers entnehmen.
            </p>
            <p className="mt-3">
              Sofern durch einzelne von uns eingesetzte Cookies auch
              personenbezogene Daten verarbeitet werden, erfolgt die
              Verarbeitung gemaess Art. 6 Abs. 1 lit. b DSGVO entweder zur
              Durchfuehrung des Vertrages, gemaess Art. 6 Abs. 1 lit. a DSGVO
              im Falle einer erteilten Einwilligung oder gemaess Art. 6 Abs. 1
              lit. f DSGVO zur Wahrung unserer berechtigten Interessen an der
              bestmoeglichen Funktionalitaet der Website sowie einer
              kundenfreundlichen und effektiven Ausgestaltung des Seitenbesuchs.
            </p>
            <p className="mt-3">
              Sie koennen Ihren Browser so einstellen, dass Sie ueber das Setzen
              von Cookies informiert werden und einzeln ueber deren Annahme
              entscheiden oder die Annahme von Cookies fuer bestimmte Faelle
              oder generell ausschliessen koennen.
            </p>
            <p className="mt-3">
              Bitte beachten Sie, dass bei Nichtannahme von Cookies die
              Funktionalitaet unserer Website eingeschraenkt sein kann.
            </p>
          </section>

          {/* 5. Kontaktaufnahme */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A2E] mb-4">
              5) Kontaktaufnahme
            </h2>
            <p>
              Im Rahmen der Kontaktaufnahme mit uns (z.B. per Kontaktformular
              oder E-Mail) werden &ndash; ausschliesslich zum Zweck der
              Bearbeitung und Beantwortung Ihres Anliegens und nur im dafuer
              erforderlichen Umfang &ndash; personenbezogene Daten verarbeitet.
            </p>
            <p className="mt-3">
              Rechtsgrundlage fuer die Verarbeitung dieser Daten ist unser
              berechtigtes Interesse an der Beantwortung Ihres Anliegens gemaess
              Art. 6 Abs. 1 lit. f DSGVO. Zielt Ihre Kontaktierung auf einen
              Vertrag ab, so ist zusaetzliche Rechtsgrundlage fuer die
              Verarbeitung Art. 6 Abs. 1 lit. b DSGVO. Ihre Daten werden
              geloescht, wenn sich aus den Umstaenden entnehmen laesst, dass der
              betroffene Sachverhalt abschliessend geklaert ist und sofern keine
              gesetzlichen Aufbewahrungspflichten entgegenstehen.
            </p>
          </section>

          {/* 6. Kundenkonto */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A2E] mb-4">
              6) Datenverarbeitung bei Eroeffnung eines Kundenkontos
            </h2>
            <p>
              Gemaess Art. 6 Abs. 1 lit. b DSGVO werden personenbezogene Daten
              im jeweils erforderlichen Umfang weiterhin erhoben und
              verarbeitet, wenn Sie uns diese bei der Eroeffnung eines
              Kundenkontos mitteilen. Welche Daten fuer die Kontoeroeffnung
              erforderlich sind, entnehmen Sie der Eingabemaske des
              entsprechenden Formulars auf unserer Website.
            </p>
            <p className="mt-3">
              Eine Loeschung Ihres Kundenkontos ist jederzeit moeglich und kann
              durch eine Nachricht an die o.g. Adresse des Verantwortlichen
              erfolgen. Nach Loeschung Ihres Kundenkontos werden Ihre Daten
              geloescht, sofern alle darueber geschlossenen Vertraege
              vollstaendig abgewickelt sind, keine gesetzlichen
              Aufbewahrungsfristen entgegenstehen und unsererseits kein
              berechtigtes Interesse an der Weiterspeicherung fortbesteht.
            </p>
          </section>

          {/* 7. Bestellabwicklung */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A2E] mb-4">
              7) Datenverarbeitung zur Bestellabwicklung
            </h2>
            <p>
              <strong>7.1</strong> Soweit fuer die Vertragsabwicklung zu Liefer-
              und Zahlungszwecken erforderlich, werden die von uns erhobenen
              personenbezogenen Daten gemaess Art. 6 Abs. 1 lit. b DSGVO an das
              beauftragte Transportunternehmen und das beauftragte
              Kreditinstitut weitergegeben.
            </p>
            <p className="mt-3">
              Sofern wir Ihnen auf Grundlage eines entsprechenden Vertrages
              Aktualisierungen fuer Waren mit digitalen Elementen oder fuer
              digitale Produkte schulden, verarbeiten wir die von Ihnen bei der
              Bestellung uebermittelten Kontaktdaten, um Sie im Rahmen unserer
              gesetzlichen Informationspflichten gemaess Art. 6 Abs. 1 lit. c
              DSGVO persoenlich zu informieren. Ihre Kontaktdaten werden hierbei
              streng zweckgebunden fuer Mitteilungen ueber von uns geschuldete
              Aktualisierungen verwendet und zu diesem Zweck durch uns nur
              insoweit verarbeitet, wie dies fuer die jeweilige Information
              erforderlich ist.
            </p>
            <p className="mt-3">
              Zur Abwicklung Ihrer Bestellung arbeiten wir ferner mit dem/den
              nachstehenden Dienstleister(n) zusammen, die uns ganz oder
              teilweise bei der Durchfuehrung geschlossener Vertraege
              unterstuetzen. An diese Dienstleister werden nach Massgabe der
              folgenden Informationen gewisse personenbezogene Daten
              uebermittelt.
            </p>

            <h3 className="text-lg font-bold text-[#1A1A2E] mt-6 mb-3">
              7.2 Verwendung von Paymentdienstleistern (Zahlungsdiensten)
            </h3>

            {/* Apple Pay */}
            <h4 className="font-semibold text-[#1A1A2E] mt-4 mb-2">
              &ndash; Apple Pay
            </h4>
            <p>
              Wenn Sie sich fuer die Zahlungsart &bdquo;Apple Pay&ldquo; der
              Apple Distribution International (Apple), Hollyhill Industrial
              Estate, Hollyhill, Cork, Irland, entscheiden, erfolgt die
              Zahlungsabwicklung ueber die &bdquo;Apple Pay&ldquo;-Funktion
              Ihres mit iOS, watchOS oder macOS betriebenen Endgeraetes durch
              die Belastung einer bei &bdquo;Apple Pay&ldquo; hinterlegten
              Zahlungskarte. Apple Pay verwendet hierbei Sicherheitsfunktionen,
              die in die Hardware und Software Ihres Geraets integriert sind, um
              Ihre Transaktionen zu schuetzen. Fuer die Freigabe einer Zahlung
              ist somit die Eingabe eines zuvor durch Sie festgelegten Codes
              sowie die Verifizierung mittels der &bdquo;Face
              ID&ldquo;-&nbsp;oder &bdquo;Touch ID&ldquo;-Funktion Ihres
              Endgeraetes erforderlich.
            </p>
            <p className="mt-3">
              Zum Zwecke der Zahlungsabwicklung werden Ihre im Rahmen des
              Bestellvorgangs mitgeteilten Informationen nebst den Informationen
              ueber Ihre Bestellung in verschluesselter Form an Apple
              weitergegeben. Apple verschluesselt diese Daten sodann erneut mit
              einem entwicklerspezifischen Schluessel, bevor die Daten zur
              Durchfuehrung der Zahlung an den Zahlungsdienstleister der in
              Apple Pay hinterlegten Zahlungskarte uebermittelt werden. Die
              Verschluesselung sorgt dafuer, dass nur die Website, ueber die
              der Einkauf getaetigt wurde, auf die Zahlungsdaten zugreifen kann.
              Nachdem die Zahlung getaetigt wurde, sendet Apple zur Bestaetigung
              des Zahlungserfolges Ihre Geraeteaccountnummer sowie einen
              transaktionsspezifischen, dynamischen Sicherheitscode an die
              Ausgangswebsite.
            </p>
            <p className="mt-3">
              Sofern bei den beschriebenen Uebermittlungen personenbezogene
              Daten verarbeitet werden, erfolgt die Verarbeitung ausschliesslich
              zum Zwecke der Zahlungsabwicklung gemaess Art. 6 Abs. 1 lit. b
              DSGVO.
            </p>
            <p className="mt-3">
              Apple bewahrt anonymisierte Transaktionsdaten auf, darunter der
              ungefaehre Kaufbetrag, das ungefaehre Datum und die ungefaehre
              Uhrzeit sowie die Angabe, ob die Transaktion erfolgreich
              abgeschlossen wurde. Durch die Anonymisierung wird ein
              Personenbezug vollstaendig ausgeschlossen. Apple nutzt die
              anonymisierten Daten zur Verbesserung von &bdquo;Apple
              Pay&ldquo; und anderen Apple-Produkten und Diensten.
            </p>
            <p className="mt-3">
              Weitere Hinweise zum Datenschutz bei Apple Pay finden Sie unter:{' '}
              <a
                href="https://support.apple.com/de-de/HT203027"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F5B731] hover:text-[#E8930C] transition-colors break-all"
              >
                https://support.apple.com/de-de/HT203027
              </a>
            </p>

            {/* Google Pay */}
            <h4 className="font-semibold text-[#1A1A2E] mt-6 mb-2">
              &ndash; Google Pay
            </h4>
            <p>
              Wenn Sie sich fuer die Zahlungsart &bdquo;Google Pay&ldquo; der
              Google Ireland Limited, Gordon House, 4 Barrow St, Dublin, D04
              E5W5, Irland (&bdquo;Google&ldquo;) entscheiden, erfolgt die
              Zahlungsabwicklung ueber die &bdquo;Google Pay&ldquo;-Applikation
              Ihres mit mindestens Android 4.4 (&bdquo;KitKat&ldquo;)
              betriebenen und ueber eine NFC-Funktion verfuegenden mobilen
              Endgeraets durch die Belastung einer bei Google Pay hinterlegten
              Zahlungskarte oder einem dort verifizierten Bezahlsystem (z.B.
              PayPal). Fuer die Freigabe einer Zahlung ueber Google Pay in
              Hoehe von mehr als 25,- &euro; ist das vorherige Entsperren Ihres
              mobilen Endgeraetes durch die jeweils eingerichtete
              Verifikationsmassnahme (etwa Gesichtserkennung, Passwort,
              Fingerabdruck oder Muster) erforderlich.
            </p>
            <p className="mt-3">
              Sofern bei den beschriebenen Uebermittlungen personenbezogene
              Daten verarbeitet werden, erfolgt die Verarbeitung ausschliesslich
              zum Zwecke der Zahlungsabwicklung gemaess Art. 6 Abs. 1 lit. b
              DSGVO.
            </p>
            <p className="mt-3">
              Die Nutzungsbedingungen von Google Pay finden sich hier:{' '}
              <a
                href="https://payments.google.com/payments/apis-secure/u/0/get_legal_document?ldo=0&ldt=googlepaytos&ldl=de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F5B731] hover:text-[#E8930C] transition-colors break-all"
              >
                Google Pay Nutzungsbedingungen
              </a>
            </p>
            <p className="mt-3">
              Weitere Hinweise zum Datenschutz bei Google Pay:{' '}
              <a
                href="https://payments.google.com/payments/apis-secure/get_legal_document?ldo=0&ldt=privacynotice&ldl=de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F5B731] hover:text-[#E8930C] transition-colors break-all"
              >
                Google Pay Datenschutz
              </a>
            </p>

            {/* Klarna */}
            <h4 className="font-semibold text-[#1A1A2E] mt-6 mb-2">
              &ndash; Klarna
            </h4>
            <p>
              Auf dieser Website stehen eine oder mehrere Online-Zahlungsarten
              des folgenden Anbieters zur Verfuegung: Klarna Bank AB,
              Sveavaegen 46, 111 34 Stockholm, Schweden.
            </p>
            <p className="mt-3">
              Bei Auswahl einer Zahlungsart des Anbieters, bei der Sie in
              Vorleistung gehen (etwa Kreditkartenzahlung), werden an diesen
              Ihre im Rahmen des Bestellvorgangs mitgeteilten Zahlungsdaten
              (darunter Name, Anschrift, Bank- und Zahlkarteninformationen,
              Waehrung und Transaktionsnummer) sowie Informationen ueber den
              Inhalt Ihrer Bestellung gemaess Art. 6 Abs. 1 lit. b DSGVO
              weitergegeben. Die Weitergabe Ihrer Daten erfolgt in diesem Falle
              ausschliesslich zum Zweck der Zahlungsabwicklung mit dem Anbieter
              und nur insoweit, als sie hierfuer erforderlich ist.
            </p>
            <p className="mt-3">
              Bei Auswahl einer Zahlungsart, bei der der Anbieter in
              Vorleistung geht (etwa Rechnungs- oder Ratenkauf bzw.
              Lastschrift), werden Sie im Bestellablauf auch aufgefordert,
              bestimmte persoenliche Daten (Vor- und Nachname, Strasse,
              Hausnummer, Postleitzahl, Ort, Geburtsdatum, E-Mail-Adresse,
              Telefonnummer, ggf. Daten zu einem alternativen Zahlungsmittel)
              anzugeben.
            </p>
            <p className="mt-3">
              Weitere Informationen zu den Auskunfteien, auf die Klarna
              zurueckgreifen kann:{' '}
              <a
                href="https://cdn.klarna.com/1.0/shared/content/legal/terms/0/de_de/credit_rating_agencies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F5B731] hover:text-[#E8930C] transition-colors break-all"
              >
                Klarna Auskunfteien
              </a>
            </p>

            {/* PayPal */}
            <h4 className="font-semibold text-[#1A1A2E] mt-6 mb-2">
              &ndash; PayPal
            </h4>
            <p>
              Auf dieser Website stehen eine oder mehrere Online-Zahlungsarten
              des folgenden Anbieters zur Verfuegung: PayPal (Europe) S.a.r.l.
              et Cie, S.C.A., 22-24 Boulevard Royal, L-2449 Luxemburg.
            </p>
            <p className="mt-3">
              Bei Auswahl einer Zahlungsart des Anbieters, bei der Sie in
              Vorleistung gehen, werden an diesen Ihre im Rahmen des
              Bestellvorgangs mitgeteilten Zahlungsdaten (darunter Name,
              Anschrift, Bank- und Zahlkarteninformationen, Waehrung und
              Transaktionsnummer) sowie Informationen ueber den Inhalt Ihrer
              Bestellung gemaess Art. 6 Abs. 1 lit. b DSGVO weitergegeben. Die
              Weitergabe Ihrer Daten erfolgt in diesem Falle ausschliesslich zum
              Zweck der Zahlungsabwicklung mit dem Anbieter und nur insoweit,
              als sie hierfuer erforderlich ist.
            </p>

            {/* PayPal Checkout */}
            <h4 className="font-semibold text-[#1A1A2E] mt-6 mb-2">
              &ndash; PayPal Checkout
            </h4>
            <p>
              Diese Website nutzt PayPal Checkout, ein Online-Zahlungssystem von
              PayPal, das sich aus PayPal-eigenen Zahlungsarten und lokalen
              Zahlmethoden von Drittanbietern zusammensetzt.
            </p>
            <p className="mt-3">
              Bei Zahlung via PayPal, Kreditkarte via PayPal, Lastschrift via
              PayPal oder &ndash; falls angeboten &ndash; &bdquo;Spaeter
              Bezahlen&ldquo; via PayPal geben wir Ihre Zahlungsdaten im Rahmen
              der Zahlungsabwicklung an die PayPal (Europe) S.a.r.l. et Cie,
              S.C.A., 22-24 Boulevard Royal, L-2449 Luxemburg (nachfolgend
              &bdquo;PayPal&ldquo;), weiter. Die Weitergabe erfolgt gemaess
              Art. 6 Abs. 1 lit. b DSGVO und nur insoweit, als dies fuer die
              Zahlungsabwicklung erforderlich ist.
            </p>
            <p className="mt-3">
              Weitere datenschutzrechtliche Informationen entnehmen Sie bitte
              der Datenschutzerklaerung von PayPal:{' '}
              <a
                href="https://www.paypal.com/de/legalhub/paypal/privacy-full"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F5B731] hover:text-[#E8930C] transition-colors break-all"
              >
                PayPal Datenschutz
              </a>
            </p>

            {/* Stripe */}
            <h4 className="font-semibold text-[#1A1A2E] mt-6 mb-2">
              &ndash; Stripe
            </h4>
            <p>
              Auf dieser Website stehen eine oder mehrere Online-Zahlungsarten
              des folgenden Anbieters zur Verfuegung: Stripe Payments Europe
              Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin,
              Irland.
            </p>
            <p className="mt-3">
              Bei Auswahl einer Zahlungsart des Anbieters, bei der Sie in
              Vorleistung gehen (etwa Kreditkartenzahlung), werden an diesen
              Ihre im Rahmen des Bestellvorgangs mitgeteilten Zahlungsdaten
              (darunter Name, Anschrift, Bank- und Zahlkarteninformationen,
              Waehrung und Transaktionsnummer) sowie Informationen ueber den
              Inhalt Ihrer Bestellung gemaess Art. 6 Abs. 1 lit. b DSGVO
              weitergegeben. Die Weitergabe Ihrer Daten erfolgt in diesem Falle
              ausschliesslich zum Zweck der Zahlungsabwicklung mit dem Anbieter
              und nur insoweit, als sie hierfuer erforderlich ist.
            </p>
            <p className="mt-3">
              Sie koennen dieser Verarbeitung Ihrer Daten jederzeit durch eine
              Nachricht an uns oder gegenueber dem Anbieter widersprechen.
              Jedoch bleibt der Anbieter ggf. weiterhin berechtigt, Ihre
              personenbezogenen Daten zu verarbeiten, sofern dies zur
              vertragsgemaessen Zahlungsabwicklung erforderlich ist.
            </p>
          </section>

          {/* 8. Betroffenenrechte */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A2E] mb-4">
              8) Rechte des Betroffenen
            </h2>
            <p>
              <strong>8.1</strong> Das geltende Datenschutzrecht gewaehrt Ihnen
              gegenueber dem Verantwortlichen hinsichtlich der Verarbeitung
              Ihrer personenbezogenen Daten die nachstehenden Betroffenenrechte
              (Auskunfts- und Interventionsrechte), wobei fuer die jeweiligen
              Ausuebungsvoraussetzungen auf die angefuehrte Rechtsgrundlage
              verwiesen wird:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Auskunftsrecht gemaess Art. 15 DSGVO</li>
              <li>Recht auf Berichtigung gemaess Art. 16 DSGVO</li>
              <li>Recht auf Loeschung gemaess Art. 17 DSGVO</li>
              <li>
                Recht auf Einschraenkung der Verarbeitung gemaess Art. 18 DSGVO
              </li>
              <li>Recht auf Unterrichtung gemaess Art. 19 DSGVO</li>
              <li>
                Recht auf Datenuebertragbarkeit gemaess Art. 20 DSGVO
              </li>
              <li>
                Recht auf Widerruf erteilter Einwilligungen gemaess Art. 7 Abs.
                3 DSGVO
              </li>
              <li>Recht auf Beschwerde gemaess Art. 77 DSGVO</li>
            </ul>

            <div className="mt-6 bg-white rounded-xl border border-[#E8E0D4]/60 p-5 sm:p-6">
              <p className="font-bold text-[#1A1A2E] text-sm uppercase tracking-wide mb-3">
                8.2 Widerspruchsrecht
              </p>
              <p className="text-sm">
                Wenn wir im Rahmen einer Interessenabwaegung Ihre
                personenbezogenen Daten aufgrund unseres ueberwiegenden
                berechtigten Interesses verarbeiten, haben Sie das jederzeitige
                Recht, aus Gruenden, die sich aus Ihrer besonderen Situation
                ergeben, gegen diese Verarbeitung Widerspruch mit Wirkung fuer
                die Zukunft einzulegen.
              </p>
              <p className="mt-3 text-sm">
                Machen Sie von Ihrem Widerspruchsrecht Gebrauch, beenden wir die
                Verarbeitung der betroffenen Daten. Eine Weiterverarbeitung
                bleibt aber vorbehalten, wenn wir zwingende schutzwuerdige
                Gruende fuer die Verarbeitung nachweisen koennen, die Ihre
                Interessen, Grundrechte und Grundfreiheiten ueberwiegen, oder
                wenn die Verarbeitung der Geltendmachung, Ausuebung oder
                Verteidigung von Rechtsanspruechen dient.
              </p>
              <p className="mt-3 text-sm">
                Werden Ihre personenbezogenen Daten von uns verarbeitet, um
                Direktwerbung zu betreiben, haben Sie das Recht, jederzeit
                Widerspruch gegen die Verarbeitung Sie betreffender
                personenbezogener Daten zum Zwecke derartiger Werbung
                einzulegen.
              </p>
            </div>
          </section>

          {/* 9. Speicherdauer */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A2E] mb-4">
              9) Dauer der Speicherung personenbezogener Daten
            </h2>
            <p>
              Die Dauer der Speicherung von personenbezogenen Daten bemisst sich
              anhand der jeweiligen Rechtsgrundlage, am Verarbeitungszweck und
              &ndash; sofern einschlaegig &ndash; zusaetzlich anhand der
              jeweiligen gesetzlichen Aufbewahrungsfrist (z.B. handels- und
              steuerrechtliche Aufbewahrungsfristen).
            </p>
            <p className="mt-3">
              Bei der Verarbeitung von personenbezogenen Daten auf Grundlage
              einer ausdruecklichen Einwilligung gemaess Art. 6 Abs. 1 lit. a
              DSGVO werden die betroffenen Daten so lange gespeichert, bis Sie
              Ihre Einwilligung widerrufen.
            </p>
            <p className="mt-3">
              Existieren gesetzliche Aufbewahrungsfristen fuer Daten, die im
              Rahmen rechtsgeschaeftlicher bzw. rechtsgeschaeftsaehnlicher
              Verpflichtungen auf der Grundlage von Art. 6 Abs. 1 lit. b DSGVO
              verarbeitet werden, werden diese Daten nach Ablauf der
              Aufbewahrungsfristen routinemaessig geloescht, sofern sie nicht
              mehr zur Vertragserfullung oder Vertragsanbahnung erforderlich
              sind und/oder unsererseits kein berechtigtes Interesse an der
              Weiterspeicherung fortbesteht.
            </p>
            <p className="mt-3">
              Sofern sich aus den sonstigen Informationen dieser Erklaerung
              ueber spezifische Verarbeitungssituationen nichts anderes ergibt,
              werden gespeicherte personenbezogene Daten im Uebrigen dann
              geloescht, wenn sie fuer die Zwecke, fuer die sie erhoben oder auf
              sonstige Weise verarbeitet wurden, nicht mehr notwendig sind.
            </p>
          </section>

          {/* 10. CV-Check */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A2E] mb-4">
              10) Datenverarbeitung beim CV-Check
            </h2>
            <p>
              <strong>10.1</strong> Unser CV-Check-Service ermoeglicht es Ihnen,
              Ihren Lebenslauf (PDF) hochzuladen und eine KI-gestuetzte Analyse
              sowie Optimierung zu erhalten. Im Folgenden erlaeutern wir, welche
              Daten dabei verarbeitet werden.
            </p>

            <h3 className="text-lg font-bold text-[#1A1A2E] mt-6 mb-3">
              10.2 Kostenlose CV-Analyse (Stufe 1)
            </h3>
            <p>
              Bei der kostenlosen Analyse wird der Text Ihres Lebenslaufs aus
              der hochgeladenen PDF-Datei extrahiert. Vor der Uebermittlung an
              unseren KI-Partner werden personenbezogene Kontaktdaten (Name,
              E-Mail-Adresse, Telefonnummer, Postadresse) automatisiert erkannt
              und durch Platzhalter ersetzt (z.B. [NAME], [EMAIL]). Der
              anonymisierte Text wird anschliessend an Anthropic (Claude)
              uebermittelt, um eine Bewertung und Verbesserungstipps zu
              generieren.
            </p>
            <p className="mt-3">
              Die hochgeladene PDF-Datei wird unmittelbar nach der
              Textextraktion geloescht. Der extrahierte Text wird nur im
              Arbeitsspeicher gehalten und nach Abschluss der Analyse geloescht.
              Es erfolgt kein Logging des Lebenslauf-Inhalts. Die Ergebnisse
              (Score und Tipps) werden nicht serverseitig gespeichert.
            </p>
            <p className="mt-3">
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Durchfuehrung
              vorvertraglicher Massnahmen) sowie Art. 6 Abs. 1 lit. f DSGVO
              (berechtigtes Interesse an der Bereitstellung des Services).
            </p>

            <h3 className="text-lg font-bold text-[#1A1A2E] mt-6 mb-3">
              10.3 Kostenpflichtige CV-Optimierung (Stufe 2)
            </h3>
            <p>
              Bei der kostenpflichtigen Optimierung wird der anonymisierte
              Lebenslauf-Text erneut an Anthropic (Claude) uebermittelt, um
              eine ueberarbeitete Version zu erstellen. Nach Erhalt der
              optimierten Version werden die zuvor entfernten Kontaktdaten
              wieder eingesetzt. Die generierten Dokumente (PDF, DOCX) werden
              fuer 24 Stunden zum Download bereitgestellt und anschliessend
              automatisch geloescht.
            </p>
            <p className="mt-3">
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfullung).
            </p>

            <h3 className="text-lg font-bold text-[#1A1A2E] mt-6 mb-3">
              10.4 Auftragsverarbeiter: Anthropic
            </h3>
            <p>
              Zur Durchfuehrung der KI-gestuetzten Analyse und Optimierung
              nutzen wir den Dienst Claude von Anthropic, PBC, 548 Market St,
              PMB 90375, San Francisco, CA 94104, USA. Anthropic verarbeitet
              die uebermittelten (anonymisierten) Daten ausschliesslich zur
              Erstellung der angeforderten Analyse bzw. Optimierung. Die Daten
              werden von Anthropic nicht fuer das Training von KI-Modellen
              verwendet. Wir haben mit Anthropic einen
              Auftragsverarbeitungsvertrag geschlossen, der den Anforderungen
              des Art. 28 DSGVO entspricht.
            </p>
            <p className="mt-3">
              Ihre personenbezogenen Kontaktdaten (Name, E-Mail, Telefon,
              Adresse) verlassen unseren Server nicht und werden nicht an
              Anthropic uebermittelt.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
