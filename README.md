# pexible Demo - AI Job-Makler

Eine vollstaendige Demo-Anwendung fuer pexible: ein KI-gesteuerter Job-Makler, der Nutzer im Gespraech durch die Jobsuche fuehrt -- von der Berufsklaerung bis zur Bezahlung.

> **Fuer Entwickler und Claude Code Sessions:** Siehe [CLAUDE.md](./CLAUDE.md) fuer detaillierte Architektur, Projekt-Regeln (R1-R7), Datenmodelle, API-Schemas, Aenderungsanleitungen und Verhaltensregeln (V1-V6, P1-P4).

## Features

- **Konversationaler AI-Agent** (GPT-4o) mit 8-Phasen-Gespraechsablauf
- **Passwortgeschuetzter Demo-Zugang** (NextAuth, ein geteiltes Passwort)
- **Chat-Interface** mit Streaming, Audio-Modus (Spracheingabe + TTS) und PDF-Export
- **Freemium-Modell**: 3 kostenlose Ergebnisse, alle Ergebnisse fuer 49 EUR (Stripe)
- **Account-Erstellung** im Chat-Flow (Registrierungs-Modal)
- **Admin-Upload** fuer echte Job-Ergebnisse (JSON-Datei)
- **Landing Page** mit Produkt-Showcase, Testimonials, FAQ
- **Blog-Seite** mit statischen Artikeln
- **Responsive Design** mit warmem Cream/Gold-Farbschema

## Tech-Stack

- **Framework:** Next.js 15.1.11 (App Router) + React 19 + TypeScript 5
- **AI:** Vercel AI SDK (@ai-sdk/openai) mit GPT-4o Streaming + Tool Calling
- **Styling:** Tailwind CSS 3.4.1 (Custom Cream/Gold/Navy-Palette)
- **Auth:** next-auth 4.24 (Credentials Provider, JWT)
- **Payment:** Stripe (PaymentIntent API, React Elements)
- **TTS:** OpenAI tts-1 (Stimme: nova)
- **Storage:** Datei-basiertes JSON (kein Datenbank-Server noetig)

---

## Setup

### 1. Dependencies installieren

```bash
npm install
```

### 2. Umgebungsvariablen konfigurieren

```bash
cp .env.local.example .env.local
```

Bearbeite `.env.local`:

```env
# PFLICHT
OPENAI_API_KEY=sk-proj-dein-key-hier
NEXTAUTH_SECRET=generiere-mit-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
DEMO_PASSWORD=pexible2025

# OPTIONAL (fuer Zahlungsfunktion)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Hinweis:** Ohne Stripe-Keys funktioniert die Zahlungsfunktion nicht, aber der Rest der Demo laeuft.

### 3. Entwicklungsserver starten

```bash
npm run dev
```

Oeffne: http://localhost:3000

---

## Demo-Ablauf

### 1. Login
- URL: http://localhost:3000
- Klicke "Jetzt starten" oder navigiere zu `/login`
- Passwort: `pexible2025` (oder dein `DEMO_PASSWORD`)

### 2. Chat starten
- Der AI-Agent beginnt automatisch das Gespraech
- Beispiel-Eingaben:
  - Beruf: "Controller im Krankenhaus"
  - PLZ: "04416" (oder Stadtname wie "Leipzig")
  - Vorname: "Max"
  - Email: "max@test.de"

### 3. Registrierung
- Agent oeffnet Registrierungs-Modal
- Passwort eingeben (mind. 8 Zeichen): z.B. "test1234"
- Account wird erstellt, 7-10 Demo-Ergebnisse werden generiert

### 4. Ergebnisse ansehen
- Agent zeigt 3 kostenlose Treffer
- PDF-Download ist verfuegbar

### 5. Upgrade (optional)
- Sage: "Ja, zeig mir alle Treffer"
- Agent oeffnet Stripe-Zahlungsformular (49 EUR)
- Nach Zahlung: alle Ergebnisse sichtbar

### 6. Echte Ergebnisse hochladen (Admin)
- URL: http://localhost:3000/upload
- Search-ID eingeben (aus dem Chat oder `data/searches.json`)
- JSON-Datei hochladen (Format siehe `example-results.json`)

---

## Projektstruktur

```
pexible-demo/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root-Layout
│   ├── globals.css               # Globale Styles
│   ├── page.tsx                  # Landing Page
│   ├── login/page.tsx            # Passwort-Gate
│   ├── chat/page.tsx             # Chat-Interface (Haupt-Feature)
│   ├── blog/page.tsx             # Blog
│   ├── upload/page.tsx           # Admin-Upload
│   └── api/
│       ├── auth/[...nextauth]/   # Auth-Handler
│       ├── chat/                 # AI Streaming + Tools
│       ├── register/             # Registrierung
│       ├── create-payment-intent/# Stripe PaymentIntent
│       ├── payment-confirm/      # Zahlungsbestaetigung
│       ├── tts/                  # Text-to-Speech
│       └── upload/               # Ergebnis-Upload
├── components/
│   └── SessionProvider.tsx       # NextAuth Client-Wrapper
├── lib/
│   ├── auth.ts                   # Auth-Konfiguration
│   └── storage.ts                # JSON-basierter Storage + Datenmodelle
├── data/                         # JSON-Datenbank (lokal)
│   ├── users.json
│   ├── searches.json
│   └── results.json
├── example-results.json          # Beispiel fuer Upload-Format
├── CLAUDE.md                     # Kontext fuer Claude Code Sessions
└── .env.local.example            # Env-Template
```

---

## API-Endpunkte

| Route | Methode | Auth | Beschreibung |
|---|---|---|---|
| `/api/chat` | POST | Ja | AI Chat Streaming mit Tool Calling |
| `/api/register` | POST | Nein | Nutzer-Registrierung + Demo-Ergebnisse |
| `/api/create-payment-intent` | POST | Nein | Stripe PaymentIntent (49 EUR) |
| `/api/payment-confirm` | POST | Nein | Zahlungsbestaetigung |
| `/api/tts` | POST | Nein | Text-to-Speech (MP3-Stream) |
| `/api/upload` | POST | Ja | Admin JSON-Upload |

---

## Datenmodelle

Die Anwendung nutzt datei-basiertes JSON-Storage (`lib/storage.ts`):

**User** - Registrierte Nutzer
```json
{ "id": "...", "email": "...", "password_hash": "...", "first_name": "...", "created_at": "..." }
```

**Search** - Job-Suchen
```json
{ "id": "...", "user_id": "...", "job_title": "...", "postal_code": "...", "status": "completed", "paid": false, "total_results": 10, "created_at": "..." }
```

**Result** - Einzelne Ergebnisse (gehoeren zu einer Search)
```json
{ "id": "...", "search_id": "...", "company_name": "...", "job_title": "...", "job_url": "...", "description": "...", "rank": 1 }
```

---

## Eigene Results-JSON erstellen

Format (Array von Objekten):
```json
[
  {
    "company_name": "Firma XY",
    "job_title": "Position (m/w/d)",
    "job_url": "https://karriere.firma.de/stelle",
    "description": "Details zur Stelle"
  }
]
```

Siehe `example-results.json` als Vorlage.

---

## Deployment (Vercel)

Siehe [DEPLOY.md](./DEPLOY.md) fuer detaillierte Anleitung.

Kurzfassung:
```bash
npm i -g vercel
vercel                    # Preview-Deployment
vercel --prod             # Produktions-Deployment
```

Pflicht-Env-Variablen im Vercel-Dashboard setzen:
`OPENAI_API_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DEMO_PASSWORD`

> **Wichtig:** Auf Vercel ist der Storage ephemeral (`/tmp`). Daten gehen bei Cold Starts verloren.
> Fuer Produktion: Echte Datenbank (PostgreSQL/Supabase) einsetzen.

---

## Troubleshooting

| Problem | Loesung |
|---|---|
| "OpenAI API error" | `OPENAI_API_KEY` in `.env.local` pruefen |
| "Session expired" | Logout: http://localhost:3000/api/auth/signout |
| "Results not found" | `search_id` korrekt? Upload erfolgreich? Check `data/searches.json` |
| Chat antwortet nicht | Browser-Console (F12) + Terminal-Logs pruefen |
| Stripe-Fehler | Stripe-Keys korrekt? Test-Modus nutzen (`sk_test_...`) |
| Login funktioniert nicht | `DEMO_PASSWORD` und `NEXTAUTH_SECRET` gesetzt? |

---

## Produktions-Checkliste

Vor dem Go-Live:

- [ ] Echte Datenbank (PostgreSQL/Supabase) statt JSON-Dateien
- [ ] Echtes Stripe Payment (Produktions-Keys + Webhook-Verifizierung)
- [ ] Email-Versand (SendGrid/Resend)
- [ ] Rate Limiting (Upstash/Redis)
- [ ] Monitoring (Sentry)
- [ ] Analytics (PostHog/Plausible)
- [ ] DSGVO-konformes Cookie Banner
- [ ] Impressum + Datenschutzerklaerung
- [ ] Tests (Unit, Integration, E2E)
- [ ] Linting + Formatting (ESLint, Prettier)
- [ ] CI/CD-Pipeline (GitHub Actions)

---

## Kontakt

Fragen? Erstelle ein Issue oder kontaktiere timm.schindler@pexible.ai
