# Technische SEO Fixes - pexible.de

> Phase 3 (AI Visibility) + Phase 4 (Technisches SEO)
> Erstellt: 2026-02-07

---

## Phase 3: KI-Sichtbarkeit & Zukunftssicherheit

### AI Visibility / Generative Engine Optimization (GEO)

| Kriterium | Status | Massnahme |
|---|---|---|
| Klare Fakten, Tabellen, Listen | Teilweise | FAQ vorhanden, Statistiken im Hero, Features als Liste |
| Eigene Daten/Insights | Fehlt | "2.000+ Karriereseiten", "85% Rueckmeldungen" - Quellen noetig |
| Kein KI-Junk | OK | Authentischer Content, kein generischer Text |
| FAQ mit Q&A-Paaren | Vorhanden | 6 FAQ-Items auf Landing Page - Schema-Markup FEHLT |
| llms.txt | Fehlt | Optional, experimentell - niedrige Prioritaet |

**Empfehlung:** FAQPage Schema-Markup hinzufuegen, Statistiken belegen oder als "Beispielwerte" kennzeichnen.

### Machine-Readable Structure

| Schema-Typ | Seite | Status | Prioritaet |
|---|---|---|---|
| Organization | Layout (global) | FEHLT | KRITISCH |
| WebSite + SearchAction | Layout (global) | FEHLT | HOCH |
| FAQPage | Homepage (/) | FEHLT | HOCH |
| BlogPosting | Blog (/blog) | FEHLT | HOCH |
| BreadcrumbList | Alle Unterseiten | FEHLT | MITTEL |
| JobPosting | - | N/A (noch keine Job-Detailseiten) | ZUKUNFT |

### Open Graph + Twitter Cards

| Element | Status | Massnahme |
|---|---|---|
| og:title | FEHLT | Pro Seite in Metadata API setzen |
| og:description | FEHLT | Pro Seite in Metadata API setzen |
| og:image | FEHLT | OG-Image erstellen (1200x630px) |
| og:url | FEHLT | Canonical URL verwenden |
| og:type | FEHLT | website / article |
| og:site_name | FEHLT | "pexible" |
| og:locale | FEHLT | "de_DE" |
| twitter:card | FEHLT | "summary_large_image" |
| twitter:title | FEHLT | Pro Seite setzen |
| twitter:description | FEHLT | Pro Seite setzen |

### Topical Authority

| Kriterium | Status |
|---|---|
| Content-Cluster geplant | Siehe SEO_KEYWORD_STRATEGY.md |
| Interne Verlinkung bildet Cluster | Teilweise (Blog -> Homepage CTA) |
| Blog deckt verwandte Themen ab | Ja (6 Artikel zu verschiedenen Aspekten) |

### E-E-A-T Staerkung

| Kriterium | Status | Massnahme |
|---|---|---|
| Ueber-uns-Seite | FEHLT | Zukuenftig erstellen |
| Autorenprofile | FEHLT | Zukuenftig fuer Blog |
| Impressum | FEHLT (Platzhalter #) | Vor Go-Live erstellen (gesetzlich Pflicht!) |
| Datenschutz | FEHLT (Platzhalter #) | Vor Go-Live erstellen (gesetzlich Pflicht!) |
| Testimonials | Vorhanden | Auf Landing Page (3 Testimonials) |

### Content-Driven Commerce

| Kriterium | Status |
|---|---|
| CTAs auf Content-Seiten | Vorhanden (Blog -> /chat) |
| CTAs spezifisch | Ja ("Jetzt Jobsuche starten", "Kostenlos starten") |
| Informieren + Konvertieren | Ja (Blog informiert, CTAs leiten zum Chat) |

---

## Phase 4: Technisches SEO fuer Next.js

### Rendering & Crawlability

| Kriterium | Status | Details |
|---|---|---|
| SEO-Seiten SSR/SSG | TEILWEISE | Blog = SSR (gut). Landing = CSR ('use client') |
| Chat von Crawlern ausgeschlossen | NEIN | robots.txt fehlt, kein noindex |
| Metadata API korrekt genutzt | TEILWEISE | Root + Blog haben metadata, Rest fehlt |
| Content im initialen HTML | TEILWEISE | Blog ja (SSR). Landing: React hydration liefert HTML |

**Wichtiger Hinweis zur Landing Page:** Die Landing Page ist `'use client'`, was bedeutet dass React den HTML-Content beim Build/Server-Render ausfuehrt und als HTML ausliefert. Next.js rendert auch Client Components server-seitig (Server-Side Rendering + Hydration). Der Content ist also im initialen HTML verfuegbar. Das ist KEIN SEO-Problem.

### Meta-Management

| Kriterium | Status | Fix |
|---|---|---|
| Konsistentes Head-Management | JA | Next.js Metadata API wird verwendet |
| Kein doppeltes Meta-Rendering | OK | Keine Konflikte erkannt |
| Dynamische Meta pro Seite | TEILWEISE | Root + Blog ok, Rest fehlt |

### Routing & URLs

| Kriterium | Status | Details |
|---|---|---|
| Saubere URL-Struktur | JA | /blog, /chat, /login |
| Kein Hash-Routing | JA | App Router, kein Hash |
| Trailing Slashes konsistent | PRUEFEN | next.config.js hat keine trailingSlash config |
| Redirects geplant | N/A | Noch nicht live |

### Performance

| Kriterium | Status | Details |
|---|---|---|
| next/image | NICHT VERWENDET | Keine Bilder vorhanden (nur SVGs) |
| next/font | JA | Inter via next/font/google, display: swap |
| Code Splitting | JA | Next.js Standard, automatisch |
| Unnoetige Client-Bundles auf SEO-Seiten | BEACHTEN | Landing Page hat 'use client' (React + State) |

### Sitemap & Robots

| Kriterium | Status | Fix |
|---|---|---|
| robots.txt | FEHLT | app/robots.ts erstellen (native Next.js) |
| XML-Sitemap | FEHLT | app/sitemap.ts erstellen (native Next.js) |
| Chat-Routen ausgeschlossen | NEIN | In robots.txt Disallow hinzufuegen |
| Sitemap-URL in robots.txt | NEIN | Wird automatisch von Next.js gesetzt |

### Internationalisierung

| Kriterium | Status |
|---|---|
| html lang="de" | JA (layout.tsx) |
| hreflang | Nicht noetig (nur Deutsch) |

---

## Implementierungsplan (Code-Aenderungen)

### 1. app/robots.ts erstellen
```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/chat/', '/login', '/register', '/upload'],
      },
    ],
    sitemap: 'https://pexible.de/sitemap.xml',
  }
}
```

### 2. app/sitemap.ts erstellen
```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://pexible.de', lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: 'https://pexible.de/blog', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]
}
```

### 3. app/layout.tsx erweitern (Metadata + JSON-LD)
- Open Graph Tags
- Twitter Card Tags
- Canonical URL
- Organization JSON-LD
- WebSite JSON-LD

### 4. app/blog/page.tsx erweitern
- Title optimieren
- Open Graph Tags
- BlogPosting JSON-LD

### 5. noindex auf geschuetzte Seiten
- app/login/page.tsx -> layout.tsx mit metadata
- app/chat/layout.tsx mit metadata
- app/upload/page.tsx -> Metadata hinzufuegen

### 6. FAQPage JSON-LD auf Landing Page
- Schema-Markup fuer die 6 FAQ-Items
