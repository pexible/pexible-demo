# SEO Go-Live Checkliste - pexible.de

> Phase 7: Alle Schritte fuer den Launch
> Erstellt: 2026-02-07

---

## Vor dem Launch

### Domain & Hosting
- [ ] DNS korrekt konfiguriert (pexible.de -> Vercel)
- [ ] HTTPS erzwungen (automatisch bei Vercel)
- [ ] www -> non-www Redirect konfiguriert (oder umgekehrt)
- [ ] Custom Domain in Vercel-Projekt eingetragen

### Statische Assets
- [ ] OG-Image erstellen (1200x630px, pexible-Branding) -> `public/og-image.png`
- [ ] Logo-Datei erstellen -> `public/logo.png`
- [ ] Favicon erstellen -> `app/favicon.ico` oder `public/favicon.ico`
- [ ] Apple Touch Icon erstellen -> `public/apple-touch-icon.png` (180x180px)

### Rechtliche Seiten (gesetzlich Pflicht in Deutschland)
- [ ] Impressum-Seite erstellen (`app/impressum/page.tsx`)
- [ ] Datenschutzerklaerung erstellen (`app/datenschutz/page.tsx`)
- [ ] AGB-Seite erstellen (`app/agb/page.tsx`)
- [ ] Footer-Links aktualisieren (Platzhalter # ersetzen)
- [ ] Cookie-Banner implementieren (falls Tracking eingesetzt wird)

### Content-Qualitaet
- [ ] Blog-Artikel: Lorem-Ipsum-Texte durch echten Content ersetzen
- [ ] Statistiken auf der Landing Page verifizieren oder als Beispielwerte kennzeichnen
- [ ] Testimonials verifizieren (echte Personen oder als fiktiv kennzeichnen)

---

## Am Launch-Tag

### Crawlability pruefen
- [ ] `https://pexible.de/robots.txt` aufrufen und verifizieren
- [ ] `https://pexible.de/sitemap.xml` aufrufen und verifizieren
- [ ] robots.txt: `/api/`, `/chat/`, `/login`, `/register`, `/upload` sind ausgeschlossen
- [ ] sitemap.xml: `/` und `/blog` sind enthalten

### Indexierung starten
- [ ] Google Search Console einrichten: https://search.google.com/search-console
- [ ] Domain-Property verifizieren (DNS-TXT-Record oder HTML-Tag)
- [ ] Sitemap einreichen (Sitemaps > Neue Sitemap hinzufuegen > `sitemap.xml`)
- [ ] Bing Webmaster Tools einrichten: https://www.bing.com/webmasters
- [ ] Sitemap bei Bing einreichen

### Meta-Tags verifizieren
- [ ] Homepage aufrufen > View Source: `<title>` pruefen
- [ ] Homepage aufrufen > View Source: `<meta name="description">` pruefen
- [ ] Homepage aufrufen > View Source: `og:title`, `og:description`, `og:image` pruefen
- [ ] Blog aufrufen > View Source: Eigene Title + Description pruefen
- [ ] Login aufrufen > View Source: `<meta name="robots" content="noindex">` pruefen

### Strukturierte Daten validieren
- [ ] Google Rich Results Test: https://search.google.com/test/rich-results
  - [ ] Homepage: Organization + WebSite + FAQPage pruefen
  - [ ] Blog: CollectionPage + BlogPosting + BreadcrumbList pruefen
- [ ] Schema.org Validator: https://validator.schema.org/

### Social Sharing testen
- [ ] Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
  - [ ] Homepage-URL eingeben, Preview pruefen
- [ ] Twitter Card Validator: https://cards-dev.twitter.com/validator
  - [ ] Homepage-URL eingeben, Preview pruefen
- [ ] LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

### Performance messen
- [ ] Google PageSpeed Insights: https://pagespeed.web.google.com/
  - [ ] Homepage Mobile-Score pruefen (Ziel: 90+)
  - [ ] Blog Mobile-Score pruefen (Ziel: 90+)
- [ ] Google Lighthouse im Browser (DevTools > Lighthouse)
  - [ ] SEO-Score pruefen (Ziel: 95+)
  - [ ] Accessibility-Score pruefen (Ziel: 90+)
- [ ] Core Web Vitals pruefen:
  - [ ] LCP (Largest Contentful Paint) < 2.5s
  - [ ] FID/INP (Interaction to Next Paint) < 200ms
  - [ ] CLS (Cumulative Layout Shift) < 0.1

---

## Erste Woche nach Launch

### Indexierung ueberwachen
- [ ] Google Search Console: "URL-Pruefung" fuer Homepage und Blog
- [ ] Google: `site:pexible.de` suchen -> Wie viele Seiten indexiert?
- [ ] Fehlende Seiten manuell zur Indexierung einreichen
- [ ] Crawl-Fehler in Search Console pruefen

### Links pruefen
- [ ] Alle internen Links testen (404-Fehler?)
- [ ] Footer-Links funktionieren (Impressum, Datenschutz, AGB)
- [ ] Blog-Artikel-Links funktionieren

### Analytics einrichten
- [ ] Google Analytics 4 (GA4) einrichten
  - [ ] Oder datenschutzfreundliche Alternative (Plausible, Fathom, Umami)
- [ ] Events tracken: Chat-Start, Registrierung, Zahlung
- [ ] Search Console mit Analytics verknuepfen

---

## Erster Monat nach Launch

### Rankings beobachten
- [ ] Ranking-Tracker einrichten (z.B. Sistrix, Ahrefs, SEMrush)
- [ ] Ziel-Keywords tracken:
  - [ ] "KI Jobsuche"
  - [ ] "Versteckter Stellenmarkt"
  - [ ] "pexible"
- [ ] Search Console: Impressionen und Klicks beobachten

### Content erweitern
- [ ] Ersten echten Blog-Artikel schreiben (siehe Content-Kalender)
- [ ] Blog-Einzelseiten implementieren (`/blog/[slug]`)
- [ ] Sitemap um neue Blog-URLs erweitern

### Backlink-Aufbau planen
- [ ] Branchenverzeichnisse eintragen
- [ ] Gastartikel auf Karriere-Portalen platzieren
- [ ] PR-Artikel bei Startup-Medien

---

## Laufend (alle 3-6 Monate)

### Content aktualisieren
- [ ] Blog-Artikel auf Aktualitaet pruefen (Jahreszahlen, Fakten)
- [ ] FAQ-Bereich erweitern basierend auf Nutzerfragen
- [ ] Neue Blog-Artikel basierend auf Search-Console-Daten erstellen

### Technisches SEO pflegen
- [ ] Core Web Vitals regelmaessig pruefen
- [ ] Crawl-Fehler in Search Console beheben
- [ ] Sitemap bei neuen Seiten aktualisieren
- [ ] Kaputte Links finden und beheben

### Wettbewerb beobachten
- [ ] SERP-Positionen gegenueber Wettbewerbern pruefen
- [ ] Content-Luecken identifizieren
- [ ] Neue Keywords aus Search Console ableiten
