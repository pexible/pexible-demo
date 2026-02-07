# SEO Audit Baseline - pexible.de

> Phase 0: Bestandsaufnahme vor Aenderungen
> Erstellt: 2026-02-07

---

## 1. Projektstruktur

```
app/
  page.tsx              Landing Page (/) - 'use client', ~535 Zeilen
  layout.tsx            Root-Layout: Inter-Font, <html lang="de">, Basis-Metadata
  globals.css           CSS-Variablen, Scrollbar-Styling, Animationen
  login/page.tsx        OTP-Login (Email -> Code -> Name) - 'use client'
  register/page.tsx     Redirect zu /login - 'use client'
  chat/page.tsx         Dual-Mode: Chat-Liste (auth) / Anon-Chat (unauth) - 'use client'
  chat/[id]/page.tsx    Einzelner Chat - 'use client'
  blog/page.tsx         Blog-Uebersicht (6 statische Artikel) - Server Component
  upload/page.tsx       Admin-Upload - 'use client'

  api/
    auth/callback/route.ts    Supabase Auth Callback
    chat/route.ts             AI-Streaming + Tools
    register/route.ts         Profil + Suche erstellen
    create-payment-intent/    Stripe PaymentIntent
    payment-confirm/          Zahlungsbestaetigung
    tts/route.ts              OpenAI Text-to-Speech
    upload/route.ts           Admin JSON-Upload
    conversations/            CRUD fuer Chat-Konversationen

components/
  Navbar.tsx            Client-Component, kontextabhaengige Navigation
  Footer.tsx            Server-Component, Footer mit Links

lib/
  supabase/client.ts    Supabase Browser-Client
  supabase/server.ts    Supabase Server-Client
  hooks/useUser.ts      Auth-Hook
```

---

## 2. Existierende Routen

| Route | Typ | Auth | SEO-relevant | Rendering |
|---|---|---|---|---|
| `/` | Landing Page | Nein | Ja (Kritisch) | CSR ('use client') |
| `/login` | OTP-Login | Nein | Nein (noindex) | CSR |
| `/register` | Redirect -> /login | Nein | Nein (noindex) | CSR |
| `/chat` | Chat-Liste / Anon-Chat | Optional | Bedingt | CSR |
| `/chat/[id]` | Einzel-Chat | Ja | Nein (noindex) | CSR |
| `/blog` | Blog-Uebersicht | Nein | Ja (Hoch) | SSR (Server Component) |
| `/upload` | Admin-Upload | Ja | Nein (noindex) | CSR |

---

## 3. Metadata IST-Zustand

### Root Layout (app/layout.tsx)
```typescript
export const metadata = {
  title: 'pexible - Dein persoenlicher KI Job-Makler',
  description: 'Finde Jobs, die andere nicht sehen. Unser KI-Makler durchsucht tausende Karriereseiten direkt und findet versteckte Stellen fuer dich.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover' as const,
  themeColor: '#FDF8F0',
}
```

### Blog (app/blog/page.tsx)
```typescript
export const metadata = {
  title: 'Blog - pexible | Karriere-Tipps & Arbeitsmarkt-Wissen',
  description: 'Aktuelle Artikel zu Bewerbungstipps, Arbeitsmarkt-Trends und Karriere-Wissen. Bleibe informiert mit dem pexible Blog.',
}
```

### Alle anderen Seiten
- Keine eigene Metadata (erben Root-Layout)
- Keine noindex-Direktiven
- Keine Open Graph Tags
- Keine Twitter Card Tags
- Keine Canonical Tags

---

## 4. Ueberschriften-Hierarchie IST-Zustand

### Landing Page (/)
- H1: "Wo deine Jobsuche aufhoert anfaengt" (Zeile 85)
- H2: "In 3 Schritten zum Traumjob" (Zeile 264)
- H2: "Jobportale sind ueberfuellt. Pexible nicht." (Zeile 312)
- H2: "Alles, was deine Jobsuche braucht" (Zeile 381)
- H2: "Fuer jeden Bereich die richtigen Stellen" (Zeile 407)
- H2: "Echte Erfolgsgeschichten" (Zeile 421)
- H2: "Aktuelles & Tipps" (Zeile 456)
- H2: "Haeufige Fragen" (Zeile 490)
- H2: "Bereit, deinen Traumjob zu finden?" (Zeile 517)
- H3: Step-Titel, Feature-Titel, Blog-Titel (korrekt unter H2)
- Bewertung: Gute Hierarchie

### Blog (/blog)
- H1: "Karriere-Tipps & Arbeitsmarkt-Wissen" (Zeile 101)
- H2: Featured-Artikel-Titel (Zeile 123)
- H3: "Alle Artikel" (Zeile 140)
- H3: Einzelne Artikel-Titel (Zeile 152)
- Bewertung: Akzeptabel, aber H3 "Alle Artikel" koennte H2 sein

### Login (/login)
- H1: "Willkommen bei pexible" (Zeile 245, Step 1)
- H1: "Code eingeben" (Zeile 312, Step 2)
- H1: "Wie heisst du?" (Zeile 407, Step 3)
- Bewertung: PROBLEM - 3 H1-Tags (nur je einer sichtbar, aber HTML enthaelt alle)
- Hinweis: Da 'use client' mit conditionalem Rendering, wird jeweils nur ein H1 gerendert. Kein SEO-Problem da Seite noindex sein sollte.

### Chat (/chat)
- H1: "Chats" (Zeile 150, auth) / "Dein persoenlicher Job-Makler" (Zeile 590, anon)
- Bewertung: OK, nur einer je nach Auth-Status gerendert

---

## 5. Technische SEO Infrastruktur

| Element | Status | Details |
|---|---|---|
| `<html lang="de">` | Vorhanden | Korrekt in layout.tsx |
| `<title>` | Vorhanden | Root + Blog, Rest fehlt |
| `<meta description>` | Vorhanden | Root + Blog, Rest fehlt |
| Open Graph Tags | FEHLT | Keine OG-Tags vorhanden |
| Twitter Card Tags | FEHLT | Keine Twitter-Tags vorhanden |
| Canonical Tags | FEHLT | Kein Canonical-Setup |
| robots.txt | FEHLT | Keine Datei vorhanden |
| sitemap.xml | FEHLT | Kein Sitemap-Setup |
| JSON-LD / Schema | FEHLT | Keine strukturierten Daten |
| public/ Ordner | FEHLT | Kein public/ Verzeichnis |
| next-sitemap | FEHLT | Nicht in package.json |
| next-seo | FEHLT | Nicht in package.json |
| Favicon | FEHLT | Kein Favicon |
| noindex auf Auth-Seiten | FEHLT | Login, Chat, Upload nicht ausgeschlossen |

---

## 6. Interne Verlinkung IST-Zustand

### Navbar (components/Navbar.tsx)
- Logo -> `/` (Link)
- Logged-out: #funktionen, #so-funktionierts, #erfolgsgeschichten (Anchors), /blog (Link)
- CTA: /login, /chat
- Logged-in: /, /blog, /chat

### Footer (components/Footer.tsx)
- Logo-Text "pexible"
- Produkt: /#funktionen, /#so-funktionierts, /chat
- Ressourcen: /blog, /#erfolgsgeschichten, # (Bewerbungstipps - Platzhalter)
- Rechtliches: # (Impressum), # (Datenschutz), # (AGB) - ALLE PLATZHALTER

### Landing Page (app/page.tsx)
- /chat (Hauptseiten-CTAs, mehrfach)
- /blog (Blog-Preview-Sektion)
- #so-funktionierts (Anchor-Link)

### Blog (app/blog/page.tsx)
- /blog#[slug] (Artikel-Anchors)
- /chat (CTA-Banner)

---

## 7. Bilder IST-Zustand

- Keine `<img>` Tags im gesamten Projekt
- Kein `next/image` Import
- Alle Icons sind inline SVGs
- Dekorative Elemente sind CSS-Gradients
- Kein Favicon, kein OG-Image, keine Apple Touch Icons

---

## 8. Security Headers (next.config.js)

| Header | Wert | SEO-Relevanz |
|---|---|---|
| X-Content-Type-Options | nosniff | Sicherheit |
| X-Frame-Options | DENY | Verhindert Framing |
| X-DNS-Prefetch-Control | on | Performance |
| Referrer-Policy | strict-origin-when-cross-origin | Datenschutz |
| HSTS | max-age=63072000 | HTTPS-Erzwingung |

---

## 9. Abhaengigkeiten (SEO-relevant)

- next: ^15.5.12 (unterstuetzt Metadata API, App Router)
- Keine SEO-spezifischen Pakete installiert
- Font: Inter via next/font/google (korrekt, kein Layout-Shift)

---

## 10. Zusammenfassung

**SEO-Reifegrad: 2/10**

Staerken:
- Saubere HTML-Struktur (Headings, semantisches Layout)
- Gute interne Verlinkung mit Next.js Link-Component
- html lang="de" korrekt gesetzt
- Font-Optimierung via next/font
- HTTPS-Headers konfiguriert
- Blog als Server Component (SSR)

Kritische Luecken:
- Kein robots.txt
- Keine Sitemap
- Keine Open Graph / Twitter Meta-Tags
- Keine strukturierten Daten (JSON-LD)
- Kein public/ Ordner (kein Favicon, kein OG-Image)
- Keine noindex-Direktiven auf Auth/Admin-Seiten
- Landing Page ist 'use client' (CSR) - Content wird initial im HTML ausgeliefert (React hydration), aber kein SSR-Vorteil
- Footer-Links zu Impressum/Datenschutz/AGB sind Platzhalter (#)
