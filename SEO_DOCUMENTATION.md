# SEO Dokumentation - pexible.de

> Phase 7: Uebersicht aller implementierten Aenderungen
> Erstellt: 2026-02-07

---

## 1. Implementierte Aenderungen

### 1.1 Root Layout (app/layout.tsx)

**Vorher:**
- Einfaches `metadata`-Objekt mit nur Title und Description
- Keine OG-Tags, keine Twitter Cards, kein Canonical

**Nachher:**
- Vollstaendiges `Metadata`-Objekt mit typisierter Next.js Metadata API
- `metadataBase`: `https://pexible.de` (Basis fuer alle relativen URLs)
- `title.template`: `%s | pexible` (automatisches Title-Suffix auf Unterseiten)
- `title.default`: `KI-Jobsuche: Versteckte Stellen finden | pexible` (optimiert, Keyword vorne)
- `description`: Optimiert mit CTA "Kostenlos starten."
- `keywords`: 7 relevante Keywords
- `authors`, `creator`, `publisher`: pexible
- `robots`: Index/follow mit erweiterten GoogleBot-Direktiven
- `alternates.canonical`: Relatives Canonical (`./`)
- Open Graph: Vollstaendig (type, locale, url, siteName, title, description, images)
- Twitter Cards: summary_large_image mit Title, Description, Image
- JSON-LD Organization Schema (globales Skript im `<head>`)
- JSON-LD WebSite Schema mit SearchAction (globales Skript im `<head>`)

### 1.2 robots.ts (app/robots.ts) - NEU

Native Next.js robots.txt-Generierung:
- Allow: `/` (Root)
- Disallow: `/api/`, `/chat/`, `/login`, `/register`, `/upload`
- Sitemap: `https://pexible.de/sitemap.xml`

### 1.3 sitemap.ts (app/sitemap.ts) - NEU

Native Next.js XML-Sitemap:
- `/` (priority 1.0, weekly)
- `/blog` (priority 0.8, weekly)
- Dynamisch erweiterbar fuer zukuenftige Seiten

### 1.4 noindex Layouts - NEU

Alle nicht-SEO-relevanten Routen mit noindex/nofollow geschuetzt:
- `app/login/layout.tsx`: Title "Anmelden", noindex
- `app/chat/layout.tsx`: Title "Job-Makler Chat", noindex
- `app/register/layout.tsx`: Title "Registrierung", noindex
- `app/upload/layout.tsx`: Title "Admin Upload", noindex

### 1.5 Landing Page (app/page.tsx)

- FAQPage JSON-LD Schema hinzugefuegt (6 FAQ-Items)
- Verwendet `next/script` Component fuer optimiertes Laden
- FAQ-Daten aus dem bestehenden `faqItems`-Array wiederverwendet

### 1.6 Blog (app/blog/page.tsx)

- Title optimiert: "Karriere-Tipps & Arbeitsmarkt-Wissen | pexible Blog" (Keyword vorne)
- Description optimiert mit CTA
- Open Graph Tags hinzugefuegt (page-spezifisch)
- Twitter Card Tags hinzugefuegt
- CollectionPage JSON-LD mit ItemList der BlogPostings
- BreadcrumbList JSON-LD (Startseite > Blog)

---

## 2. Keyword-Mapping

| Seite | URL | Primaeres Keyword | Title |
|---|---|---|---|
| Homepage | `/` | KI Jobsuche | KI-Jobsuche: Versteckte Stellen finden \| pexible |
| Blog | `/blog` | Karriere-Tipps | Karriere-Tipps & Arbeitsmarkt-Wissen \| pexible Blog |
| Login | `/login` | - (noindex) | Anmelden \| pexible |
| Chat | `/chat` | - (noindex) | Job-Makler Chat \| pexible |
| Register | `/register` | - (noindex) | Registrierung \| pexible |
| Upload | `/upload` | - (noindex) | Admin Upload \| pexible |

---

## 3. Schema-Markup Uebersicht

| Schema | Seite | Datei | Beschreibung |
|---|---|---|---|
| Organization | Global | `app/layout.tsx` | Firmen-Identitaet, Logo, URL |
| WebSite + SearchAction | Global | `app/layout.tsx` | Site-Suche, Sitelinks-Suchfeld |
| FAQPage | Homepage `/` | `app/page.tsx` | 6 Frage-Antwort-Paare |
| CollectionPage + BlogPosting | Blog `/blog` | `app/blog/page.tsx` | Artikel-Liste mit Metadaten |
| BreadcrumbList | Blog `/blog` | `app/blog/page.tsx` | Startseite > Blog |

---

## 4. Dateien die geaendert/erstellt wurden

### Neue Dateien:
- `app/robots.ts` - robots.txt Generierung
- `app/sitemap.ts` - XML-Sitemap Generierung
- `app/login/layout.tsx` - noindex fuer Login
- `app/chat/layout.tsx` - noindex fuer Chat
- `app/register/layout.tsx` - noindex fuer Register
- `app/upload/layout.tsx` - noindex fuer Upload
- `SEO_AUDIT_BASELINE.md` - Phase 0 Dokumentation
- `SEO_KEYWORD_STRATEGY.md` - Phase 1 Dokumentation
- `SEO_AUDIT_PER_PAGE.md` - Phase 2 Dokumentation
- `SEO_TECHNICAL_FIXES.md` - Phase 3+4 Dokumentation
- `SEO_ACTION_PLAN.md` - Phase 5 Dokumentation
- `SEO_DOCUMENTATION.md` - Phase 7 Dokumentation (diese Datei)
- `SEO_GO_LIVE_CHECKLIST.md` - Phase 7 Go-Live Checkliste

### Geaenderte Dateien:
- `app/layout.tsx` - Komplett ueberarbeitetes Metadata + JSON-LD
- `app/page.tsx` - FAQPage JSON-LD hinzugefuegt, next/script Import
- `app/blog/page.tsx` - Metadata optimiert, OG/Twitter Tags, JSON-LD

### Nicht angefasst (bewusst):
- `app/chat/page.tsx` - Kein SEO-relevanter Content (noindex via Layout)
- `app/chat/[id]/page.tsx` - Geschuetzt via Middleware (noindex via Layout)
- `app/login/page.tsx` - Auth-Seite (noindex via Layout)
- `app/register/page.tsx` - Redirect (noindex via Layout)
- `app/upload/page.tsx` - Admin (noindex via Layout)
- `components/Navbar.tsx` - Gute interne Verlinkung, keine Aenderung noetig
- `components/Footer.tsx` - Platzhalter-Links (#) bleiben bis Impressum/Datenschutz erstellt
- `middleware.ts` - Funktioniert korrekt, keine Aenderung noetig
- `next.config.js` - Security-Headers ok, keine SEO-Aenderung noetig
- `tailwind.config.js` - Design-System, keine SEO-Relevanz
- `lib/*` - Backend/Storage, keine SEO-Relevanz
- `app/api/*` - API-Routen, keine SEO-Relevanz

---

## 5. Content-Kalender-Vorschlag (erste 10 Blog-Artikel)

| # | Titel | Primaer-Keyword | Prioritaet |
|---|---|---|---|
| 1 | Lebenslauf schreiben: Der ultimative Leitfaden 2026 | Lebenslauf schreiben | Hoch |
| 2 | Vorstellungsgespraech vorbereiten: 15 typische Fragen | Vorstellungsgespraech Tipps | Hoch |
| 3 | Jobportal Vergleich: Indeed, StepStone, LinkedIn | Jobportal Vergleich | Hoch |
| 4 | Karriereseiten richtig nutzen: Versteckte Jobs finden | Karriereseiten nutzen | Hoch |
| 5 | Kuendigungsfrist beachten: Rechte und Pflichten | Kuendigungsfrist | Mittel |
| 6 | Quereinsteiger Jobs: Die besten Branchen 2026 | Quereinsteiger Jobs | Mittel |
| 7 | Arbeitszeugnis entschluesseln: Geheimcodes verstehen | Arbeitszeugnis Codes | Mittel |
| 8 | Initiativbewerbung: Muster, Tipps und Beispiele | Initiativbewerbung | Mittel |
| 9 | Gehaltsrechner 2026: Brutto-Netto Vergleich | Gehaltsrechner | Mittel |
| 10 | Beste Staedte fuer Jobsuchende in Deutschland | Jobs Deutschland Staedte | Niedrig |

---

## 6. Offene Punkte (nach Go-Live)

1. **OG-Image erstellen** (1200x630px) und in `public/og-image.png` ablegen
2. **Logo-Datei** fuer Organization Schema in `public/logo.png` ablegen
3. **Favicon** in `app/favicon.ico` oder `public/favicon.ico` ablegen
4. **Impressum-Seite** erstellen (gesetzliche Pflicht)
5. **Datenschutz-Seite** erstellen (gesetzliche Pflicht)
6. **AGB-Seite** erstellen
7. **Footer-Links** aktualisieren (Platzhalter # ersetzen)
8. **Google Search Console** einrichten und Sitemap einreichen
9. **Blog-Einzelseiten** (/blog/[slug]) fuer bessere Indexierung erstellen
10. **Individuelle Blog-Artikel mit echtem Content** (kein Lorem Ipsum) schreiben
