# SEO Audit pro Seite - pexible.de

> Phase 2: Detaillierte Pruefung jeder existierenden Seite
> Erstellt: 2026-02-07

---

## Seite 1: Homepage (/)

**Datei:** `app/page.tsx` (535 Zeilen, 'use client')
**Rendering:** Client-Side Rendering (React hydration)

### 1. KEYWORD-PLATZIERUNG
- [x] Primaeres Keyword "Jobsuche" im Root-Layout `<title>` (via layout.tsx)
- [ ] Primaeres Keyword "KI Jobsuche" NICHT im `<title>` - VERBESSERUNG NOETIG
- [x] Primaeres Keyword in `<h1>`: "Wo deine Jobsuche aufhoert anfaengt"
- [x] Keyword in ersten 100 Woertern: "KI-Makler", "Karriereseiten", "Stellen"
- [x] URL-Slug: `/` (Root - kein Slug noetig)
- [ ] Meta Description: Enthaelt "Jobs" und "KI-Makler" - OPTIMIERBAR
- [x] Keyword erscheint natuerlich mehrfach im Text
- [x] Kein Keyword-Stuffing

### 2. TITLE TAG
- [ ] Primaeres Keyword NICHT am Anfang ("pexible" steht vorne)
- [x] Unter 60 Zeichen (52 Zeichen)
- [ ] Kein Modifier (kein "Tipps", "beste", etc.)
- [ ] Keine Zahl
- [ ] Kein Jahr
- [ ] Klick-Attraktivitaet: Mittel

**Aktuell:** `pexible - Dein persoenlicher KI Job-Makler`
**Empfohlen:** `KI-Jobsuche: Versteckte Stellen finden | pexible`

### 3. META DESCRIPTION
- [x] Keyword vorhanden
- [ ] 165 Zeichen - ETWAS ZU LANG (Ziel: 155-160)
- [x] Klarer Nutzen
- [ ] Kein expliziter CTA am Ende
- [x] Passt zur Suchintention

**Aktuell:** `Finde Jobs, die andere nicht sehen. Unser KI-Makler durchsucht tausende Karriereseiten direkt und findet versteckte Stellen fuer dich.`
**Empfohlen:** `Finde Jobs, die auf keinem Portal stehen. Der pexible KI-Makler durchsucht tausende Karriereseiten und findet versteckte Stellen. Jetzt kostenlos starten.`

### 4. URL-STRUKTUR
- [x] Root-URL `/` - optimal

### 5. UEBERSCHRIFTEN-HIERARCHIE
- [x] Genau EIN `<h1>`
- [x] 8 `<h2>` fuer Hauptabschnitte
- [x] `<h3>` fuer Unterabschnitte
- [x] Semantische Keywords in Ueberschriften
- [x] Scannbarer Ueberblick
- [x] Logische Hierarchie (kein Sprung)

### 6. CONTENT-QUALITAET
- [x] Beantwortet Suchintention (Was ist pexible? Wie funktioniert es?)
- [x] Einzigartiger Blickwinkel (KI-Makler statt Portal)
- [x] Konkrete Beispiele (Chat-Mockup, Firmenbeispiele)
- [x] Umsetzbare Takeaways (CTAs)
- [x] Kein Fuelltext
- [ ] FAQ-Sektion vorhanden aber ohne Schema-Markup

### 7. LESBARKEIT
- [x] Kurze Absaetze
- [x] Regelmaessige Zwischenueberschriften
- [x] Aufzaehlungen und Listen
- [x] Einfache Sprache
- [x] Mobile-optimiert (responsive Design)

### 8. VISUELLE ELEMENTE
- [x] Chat-Mockup als visuelles Element
- [x] SVG-Icons fuer Features
- [x] Keine Textwuesten
- [ ] Keine echten Bilder/Screenshots

### 9. BILD-OPTIMIERUNG
- N/A - Keine Bilder, nur SVG-Icons (kein Handlungsbedarf)

### 10. INTERNE VERLINKUNG
- [x] /chat (mehrfach als CTA)
- [x] /blog (Blog-Preview-Sektion)
- [x] Anchor-Links zu Sektionen (#so-funktionierts, #funktionen)
- [ ] Kein Link zu Impressum/Datenschutz (nur Platzhalter im Footer)

### 11. EXTERNE VERLINKUNG
- [ ] Keine externen Links vorhanden
- [ ] Keine Quellen-Belege fuer Statistiken ("70% der Stellen werden nie ausgeschrieben")

### 12. E-E-A-T-SIGNALE
- [ ] Keine Autoreninfo
- [ ] Keine Expertenzitate
- [ ] Keine Quellen zitiert
- [ ] Testimonials vorhanden (Julia M., Samir R., Lena K.) - aber keine Verifizierung
- [ ] Kein Veroeffentlichungsdatum

### 13. TECHNISCHE CHECKS
- [ ] 'use client' - Content wird per React hydration gerendert (CSR)
- [x] Mobile-responsive
- [ ] Kein Canonical-Tag
- [ ] Kein noindex (korrekt - soll indexiert werden)
- [ ] Kein Schema-Markup (FAQPage, Organization, WebSite FEHLEN)

### 14. VORVEROEFENTLICHUNGS-CHECKS
- [x] Keine Tippfehler erkannt
- [ ] Footer-Links Impressum/Datenschutz/AGB sind Platzhalter (#)
- [x] Mobile-Design gut

### PRIORITAET: KRITISCH
**Handlungsbedarf:**
1. Title Tag optimieren (Keyword vorne)
2. Meta Description mit CTA
3. Open Graph + Twitter Meta-Tags hinzufuegen
4. JSON-LD: Organization, WebSite mit SearchAction, FAQPage Schema
5. Canonical Tag setzen

---

## Seite 2: Blog (/blog)

**Datei:** `app/blog/page.tsx` (192 Zeilen, Server Component)
**Rendering:** SSR (Server-Side Rendering) - optimal fuer SEO

### 1. KEYWORD-PLATZIERUNG
- [x] "Karriere-Tipps" und "Arbeitsmarkt-Wissen" im Title
- [x] Keywords in H1: "Karriere-Tipps & Arbeitsmarkt-Wissen"
- [x] Keywords in Meta Description
- [x] URL: /blog - sauber
- [x] Natuerliche Keyword-Verteilung

### 2. TITLE TAG
- [x] Unter 60 Zeichen (57 Zeichen)
- [x] Beschreibend
- [ ] Keyword nicht ganz am Anfang ("Blog - pexible" vorne)

**Aktuell:** `Blog - pexible | Karriere-Tipps & Arbeitsmarkt-Wissen`
**Empfohlen:** `Karriere-Tipps & Arbeitsmarkt-Wissen | pexible Blog`

### 3. META DESCRIPTION
- [x] 155 Zeichen - gut
- [x] Keywords enthalten
- [ ] Kein CTA am Ende

**Aktuell:** `Aktuelle Artikel zu Bewerbungstipps, Arbeitsmarkt-Trends und Karriere-Wissen. Bleibe informiert mit dem pexible Blog.`
**Empfohlen:** `Bewerbungstipps, Arbeitsmarkt-Trends und Karriere-Ratgeber. Expertenwissen fuer deine erfolgreiche Jobsuche. Jetzt lesen auf pexible.`

### 4. URL-STRUKTUR
- [x] /blog - kurz, sauber

### 5. UEBERSCHRIFTEN-HIERARCHIE
- [x] EIN H1
- [x] H2 fuer Featured-Artikel
- [ ] H3 "Alle Artikel" sollte H2 sein
- [x] H3 fuer einzelne Artikel-Titel

### 6. CONTENT-QUALITAET
- [x] Artikel-Uebersicht mit Excerpts
- [ ] Artikel-Inhalte teilweise Lorem Ipsum (Platzhalter)
- [ ] Alle Artikel auf einer Seite (keine einzelnen Blog-Routen)
- [ ] Keine echten Artikel-URLs (/blog/[slug]) - nur Anchor-Links

### 7. INTERNE VERLINKUNG
- [x] /chat CTA-Banner
- [ ] Keine zurueck-Links zur Homepage
- [ ] Blog-Artikel verlinken nicht untereinander

### 12. E-E-A-T-SIGNALE
- [ ] Keine Autoreninfo bei Artikeln
- [ ] Kein Veroeffentlichungsdatum im Meta (nur visuell)
- [ ] Kein BlogPosting Schema-Markup

### 13. TECHNISCHE CHECKS
- [x] Server Component (SSR) - optimal
- [ ] Kein Canonical-Tag
- [ ] Kein Schema-Markup (BlogPosting, BreadcrumbList FEHLEN)
- [ ] Keine Open Graph Tags

### PRIORITAET: HOCH
**Handlungsbedarf:**
1. Title Tag optimieren (Keyword vorne)
2. Meta Description mit CTA
3. Open Graph + Twitter Meta-Tags
4. JSON-LD: BlogPosting fuer Artikel, BreadcrumbList
5. Canonical Tag

---

## Seite 3: Login (/login)

**Datei:** `app/login/page.tsx` (452 Zeilen, 'use client')

### Zusammenfassung
- Sollte **noindex, nofollow** sein
- Keine SEO-Optimierung noetig (Auth-Seite)
- Hat 3 H1-Tags (je einer pro Step) - kein Problem da noindex

### PRIORITAET: MITTEL
**Handlungsbedarf:**
1. `robots: 'noindex, nofollow'` Metadata hinzufuegen
2. Eigener Title: `Anmelden | pexible`

---

## Seite 4: Register (/register)

**Datei:** `app/register/page.tsx` (24 Zeilen, 'use client')
**Funktion:** Redirect zu /login

### PRIORITAET: NIEDRIG
**Handlungsbedarf:**
1. `robots: 'noindex, nofollow'` Metadata hinzufuegen

---

## Seite 5: Chat (/chat)

**Datei:** `app/chat/page.tsx` (898 Zeilen, 'use client')
**Funktion:** Dual - Chat-Liste (auth) oder anonymer Chat (unauth)

### Zusammenfassung
- Anonymer Chat: oeffentlich zugaenglich, hat SEO-relevanten H1-Text
- Chat-Liste: nur fuer eingeloggte Nutzer
- Chat-Inhalte sind privat und sollten NICHT indexiert werden
- Die anonyme Chat-Ansicht koennte theoretisch indexiert werden, aber der Hauptzweck ist Interaktion, nicht Content

### PRIORITAET: MITTEL
**Handlungsbedarf:**
1. `robots: 'noindex, nofollow'` fuer die gesamte Chat-Seite
2. Eigener Title: `Job-Makler Chat | pexible`

---

## Seite 6: Chat Detail (/chat/[id])

**Datei:** `app/chat/[id]/page.tsx` ('use client')
**Auth:** Geschuetzt (Middleware Redirect)

### PRIORITAET: NIEDRIG
**Handlungsbedarf:**
1. `robots: 'noindex, nofollow'` via generateMetadata oder layout
2. Bereits durch Middleware geschuetzt (guter Fallback)

---

## Seite 7: Upload (/upload)

**Datei:** `app/upload/page.tsx` ('use client')
**Auth:** Geschuetzt (Middleware Redirect)

### PRIORITAET: NIEDRIG
**Handlungsbedarf:**
1. `robots: 'noindex, nofollow'` Metadata hinzufuegen

---

## Zusammenfassung aller Seiten

| Seite | Prioritaet | Hauptprobleme |
|---|---|---|
| `/` (Landing) | KRITISCH | Title, OG-Tags, Schema, Canonical |
| `/blog` | HOCH | Title, OG-Tags, Schema, Canonical |
| `/login` | MITTEL | noindex fehlt |
| `/register` | NIEDRIG | noindex fehlt |
| `/chat` | MITTEL | noindex fehlt |
| `/chat/[id]` | NIEDRIG | noindex fehlt (Middleware schuetzt) |
| `/upload` | NIEDRIG | noindex fehlt (Middleware schuetzt) |
