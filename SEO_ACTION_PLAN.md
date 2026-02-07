# SEO Aktionsplan - pexible.de

> Phase 5: Priorisierte Umsetzung
> Erstellt: 2026-02-07

---

## KRITISCH (sofort umsetzen)

### 1. robots.txt erstellen
- **Problem:** Keine robots.txt vorhanden - Suchmaschinen haben keine Crawl-Direktiven
- **Datei:** `app/robots.ts` (neu)
- **Fix:** Native Next.js robots.ts mit Disallow fuer /api/, /chat/, /login, /register, /upload
- **Begruendung:** Ohne robots.txt koennen Auth-Seiten und API-Endpunkte indexiert werden

### 2. XML-Sitemap erstellen
- **Problem:** Keine Sitemap - Suchmaschinen kennen die Seitenstruktur nicht
- **Datei:** `app/sitemap.ts` (neu)
- **Fix:** Native Next.js sitemap.ts mit /, /blog
- **Begruendung:** Sitemap beschleunigt Indexierung und signalisiert Seitenpriorisierung

### 3. Homepage Title Tag optimieren
- **Problem:** "pexible - Dein persoenlicher KI Job-Makler" - Brand vorne, kein Hauptkeyword
- **Datei:** `app/layout.tsx:10`
- **Fix:** `title: { default: 'KI-Jobsuche: Versteckte Stellen finden | pexible', template: '%s | pexible' }`
- **Begruendung:** Primaeres Keyword am Anfang = besseres Ranking + CTR

### 4. Open Graph + Twitter Meta-Tags (global)
- **Problem:** Social Shares zeigen keinen Custom-Preview
- **Datei:** `app/layout.tsx`
- **Fix:** openGraph und twitter Objekte in metadata
- **Begruendung:** OG-Tags steuern die Darstellung in Social Media und Messaging-Apps

### 5. noindex auf geschuetzte Seiten
- **Problem:** Login, Chat, Upload, Register koennen indexiert werden
- **Dateien:** `app/login/layout.tsx`, `app/chat/layout.tsx`, `app/upload/layout.tsx`, `app/register/layout.tsx` (alle neu)
- **Fix:** `export const metadata = { robots: 'noindex, nofollow' }`
- **Begruendung:** Auth-Seiten in Suchresultaten schaden der User Experience und verschwenden Crawl-Budget

### 6. JSON-LD Organization Schema
- **Problem:** Suchmaschinen verstehen nicht, was pexible ist
- **Datei:** `app/layout.tsx`
- **Fix:** JSON-LD Script mit Organization-Schema im Layout
- **Begruendung:** Ermoeglicht Rich Snippets und Knowledge Panel

---

## WICHTIG (zeitnah umsetzen)

### 7. FAQPage JSON-LD auf Landing Page
- **Problem:** 6 FAQ-Items ohne Schema-Markup = verpasste Rich-Snippet-Chance
- **Datei:** `app/page.tsx` (via separates Script-Tag oder Component)
- **Fix:** FAQPage JSON-LD mit allen 6 Frage-Antwort-Paaren
- **Begruendung:** FAQ Rich Snippets koennen die SERP-Flaeche deutlich vergroessern

### 8. Blog Metadata optimieren
- **Problem:** Blog-Title beginnt mit "Blog - pexible" statt mit Keyword
- **Datei:** `app/blog/page.tsx:86-89`
- **Fix:** Title + Description optimieren, OG-Tags hinzufuegen
- **Begruendung:** Keyword-optimierter Title verbessert Ranking und CTR

### 9. Meta Description optimieren (Homepage)
- **Problem:** Aktuelle Description hat keinen CTA und ist leicht zu lang
- **Datei:** `app/layout.tsx:11`
- **Fix:** Neue Description mit CTA am Ende
- **Begruendung:** CTAs in Meta Descriptions erhoehen die Klickrate

### 10. WebSite JSON-LD mit SearchAction
- **Problem:** Google weiss nicht, dass pexible eine Suchfunktion hat
- **Datei:** `app/layout.tsx`
- **Fix:** WebSite Schema mit potentialAction SearchAction
- **Begruendung:** Kann Sitelinks-Suchfeld in Google aktivieren

### 11. Canonical Tags
- **Problem:** Keine expliziten Canonical-URLs gesetzt
- **Datei:** `app/layout.tsx` (metadataBase + alternates)
- **Fix:** metadataBase: 'https://pexible.de', alternates: { canonical: './' }
- **Begruendung:** Verhindert Duplicate-Content-Probleme und konsolidiert Link-Juice

---

## NICE-TO-HAVE (inkrementelle Verbesserungen)

### 12. BlogPosting JSON-LD
- **Problem:** Blog-Artikel haben kein Artikel-Schema
- **Datei:** `app/blog/page.tsx`
- **Fix:** BlogPosting Schema pro Artikel (Titel, Datum, Beschreibung)
- **Begruendung:** Kann Rich Snippets fuer Blog-Artikel in der Suche aktivieren

### 13. BreadcrumbList JSON-LD
- **Problem:** Keine Breadcrumb-Daten fuer Google
- **Dateien:** Blog und zukuenftige Unterseiten
- **Fix:** BreadcrumbList Schema (Home > Blog)
- **Begruendung:** Verbesserte Navigation in SERPs

### 14. Trailing Slash Konsistenz
- **Problem:** Keine explizite trailingSlash-Konfiguration
- **Datei:** `next.config.js`
- **Fix:** `trailingSlash: false` (explizit setzen)
- **Begruendung:** Verhindert Duplicate-Content durch /-Varianten

---

## NACH GO-LIVE

### 15. Google Search Console einrichten
- Sitemap einreichen
- Indexierung pruefen
- Core Web Vitals messen

### 16. Impressum + Datenschutz erstellen
- Gesetzlich Pflicht fuer deutsche Websites
- Footer-Links aktualisieren (aktuell Platzhalter #)

### 17. OG-Image erstellen
- 1200x630px Bild mit pexible-Branding
- In public/ ablegen und in Metadata referenzieren

### 18. Lighthouse SEO-Audit
- Ziel: Score 95+
- Core Web Vitals pruefen

### 19. Monitoring einrichten
- Ranking-Tracker
- Search Console Alerts
- Content-Update-Zyklus alle 6 Monate
