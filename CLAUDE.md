# CLAUDE.md - Kontext fuer Claude Code Sessions

## Projekt-Ueberblick

pexible-demo ist eine **Next.js 15 App Router**-Anwendung: ein KI-gesteuerter Job-Makler-Demo.
Ein konversationaler Chat-Agent (GPT-4o) fuehrt Nutzer durch einen mehrstufigen Sales-Funnel:
Jobsuche -> Registrierung -> Freemium-Ergebnisse (3 kostenlos) -> Bezahlung (49 EUR) -> alle Ergebnisse.

**Sprache der Anwendung:** Deutsch (UI, System-Prompt, Fehlermeldungen)
**Sprache des Codes:** Englisch (Variablen, Typen, Kommentare)

---

## Schnellstart

```bash
npm install
cp .env.local.example .env.local   # Dann Werte eintragen
npm run dev                         # http://localhost:3000
```

Minimal noetige Env-Variablen: `OPENAI_API_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DEMO_PASSWORD`

---

## Tech-Stack

| Technologie | Version | Zweck |
|---|---|---|
| Next.js | 15.1.11 | App Router, Server Components, API Routes |
| React | 19.0.0 | UI-Rendering |
| TypeScript | 5 | Typsicherheit |
| Tailwind CSS | 3.4.1 | Styling (Utility-first) |
| @ai-sdk/openai + ai | 1.0.0 / 4.0.0 | Vercel AI SDK: Streaming, Tool Calling |
| openai | 4.77.0 | Direkte API fuer Text-to-Speech |
| next-auth | 4.24.11 | Passwort-basierte Demo-Authentifizierung |
| bcryptjs | 2.4.3 | Passwort-Hashing |
| Stripe | 17.5.0 | Zahlungsabwicklung (Test-Modus) |
| zod | 3.24.1 | Schema-Validierung (AI Tool-Parameter) |
| nanoid | 5.0.9 | ID-Generierung |
| jspdf | 4.0.0 | PDF-Export der Ergebnisse |

---

## Projektstruktur

```
pexible-demo/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root-Layout (Inter-Font, SessionProvider)
│   ├── globals.css               # Globale Styles + Tailwind-Imports
│   ├── page.tsx                  # Landing Page (Marketing, ~630 Zeilen)
│   ├── login/page.tsx            # Passwort-Login-Gate
│   ├── chat/page.tsx             # Haupt-Chat-Interface (~800 Zeilen, groesste Datei)
│   ├── blog/page.tsx             # Blog-Seite (statische Inhalte)
│   ├── upload/page.tsx           # Admin-Upload fuer Job-Ergebnisse
│   └── api/
│       ├── auth/[...nextauth]/route.ts   # NextAuth Handler
│       ├── chat/route.ts                 # AI Chat Streaming + Tool Calling
│       ├── register/route.ts             # Nutzer-Registrierung + Demo-Ergebnisse
│       ├── create-payment-intent/route.ts # Stripe PaymentIntent (49 EUR)
│       ├── payment-confirm/route.ts       # Zahlungsbestaetigung
│       ├── tts/route.ts                   # Text-to-Speech (OpenAI tts-1, Stimme: nova)
│       └── upload/route.ts                # JSON-Upload fuer Ergebnisse
├── components/
│   └── SessionProvider.tsx       # Client-Wrapper fuer NextAuth
├── lib/
│   ├── auth.ts                   # NextAuth-Konfiguration (Credentials Provider)
│   └── storage.ts                # Datei-basierter JSON-Storage
├── data/                         # Lokale JSON-Datenbank (nur lokal, nicht auf Vercel)
│   ├── users.json
│   ├── searches.json
│   └── results.json
├── example-results.json          # Beispiel-Ergebnis-Datei fuer Upload
├── tailwind.config.js            # Farbpalette + Animationen
├── next.config.js                # Body-Size-Limit: 10MB
├── middleware.ts                  # Schuetzt /chat, /upload und deren API-Routen
├── vercel.json                   # Vercel-Deployment-Config
└── .env.local.example            # Template fuer Umgebungsvariablen
```

---

## Architektur-Entscheidungen

### Daten-Storage (lib/storage.ts)
- **Kein Datenbank-Server** - JSON-Dateien im Filesystem
- Lokal: `data/` im Projektverzeichnis
- Vercel/Serverless: `/tmp/pexible-data/` (ephemeral, Daten gehen bei Cold Start verloren)
- Erkennung via `process.env.VERCEL === '1'` oder `process.cwd().startsWith('/var/task')`
- Funktionen: `readJSON()`, `writeJSON()`, `getUsers()`, `saveUsers()`, `getSearches()`, `saveSearches()`, `getResults()`, `saveResults()`

### Authentifizierung (lib/auth.ts + middleware.ts)
- NextAuth mit **Credentials Provider** (nur Passwort, kein Username)
- Ein einziges Demo-Passwort via `DEMO_PASSWORD` Env-Variable
- JWT-Session-Strategie
- Middleware schuetzt: `/chat/*`, `/upload/*`, `/api/chat/*`, `/api/upload/*`
- Nicht geschuetzt: `/api/register`, `/api/create-payment-intent`, `/api/payment-confirm`, `/api/tts`

### AI Chat (app/api/chat/route.ts)
- Modell: **GPT-4o** via Vercel AI SDK (`@ai-sdk/openai`)
- Streaming mit `streamText()` und `toDataStreamResponse()`
- `maxDuration: 30` Sekunden, `maxSteps: 5` Tool-Aufrufe
- System-Prompt definiert 8-Phasen-Gespraechsablauf (deutsch)
- **3 Tools:**
  - `request_registration(email, first_name, job_title, postal_code)` -> zeigt Registrierungs-Modal
  - `check_results(search_id)` -> liest Ergebnisse aus Storage
  - `create_payment(search_id)` -> zeigt Stripe-Zahlungsformular

### Registrierung (app/api/register/route.ts)
- Erstellt User + Search + generiert 7-10 Demo-Ergebnisse
- Demo-Firmen: Siemens, BMW, SAP, Deutsche Bank, Bosch, Allianz, Mercedes-Benz, Volkswagen, BASF, Bayer
- Validierung: Email mit @, Passwort 8+ Zeichen, PLZ 5 Ziffern
- Gibt `search_id` und Ergebnisse direkt zurueck

### Zahlungsablauf
1. `create_payment(search_id)` Tool im Chat -> Frontend zeigt Modal
2. Frontend ruft `/api/create-payment-intent` -> Stripe PaymentIntent (4900 Cent = 49 EUR)
3. Nutzer bezahlt via Stripe Elements
4. Frontend ruft `/api/payment-confirm` -> setzt `search.paid = true`

---

## Datenmodelle (lib/storage.ts)

```typescript
type User = {
  id: string              // nanoid
  email: string
  password_hash: string   // bcrypt, 10 Runden
  first_name: string
  created_at: string      // ISO 8601
}

type Search = {
  id: string              // nanoid
  user_id: string
  job_title: string
  postal_code: string     // 5-stellig
  status: 'pending' | 'completed'
  paid: boolean           // false = Freemium (3 Ergebnisse), true = alle
  total_results: number
  created_at: string
}

type Result = {
  id: string              // nanoid
  search_id: string
  company_name: string
  job_title: string
  job_url: string
  description: string
  rank: number            // Sortierung (1 = bester Treffer)
}
```

---

## API-Referenz

| Endpunkt | Methode | Auth | Beschreibung |
|---|---|---|---|
| `/api/chat` | POST | Ja (Middleware) | AI Chat Streaming. Body: `{ messages: Message[] }` |
| `/api/register` | POST | Nein | Registrierung. Body: `{ email, password, first_name, job_title, postal_code }` |
| `/api/create-payment-intent` | POST | Nein | Stripe Intent. Body: `{ search_id }`. Returns: `{ clientSecret }` |
| `/api/payment-confirm` | POST | Nein | Bestaetigung. Body: `{ payment_intent_id, search_id }` |
| `/api/tts` | POST | Nein | Text-to-Speech. Body: `{ text }`. Returns: Audio-Stream (MP3) |
| `/api/upload` | POST | Ja (Middleware) | Admin JSON-Upload. Body: FormData mit `file` + `search_id` |
| `/api/auth/[...nextauth]` | GET/POST | - | NextAuth Endpoints |

---

## Design-System (tailwind.config.js)

### Farbpalette
- **Cream** (Hintergrund): `cream-50` (#FEFCF8) bis `cream-400` (#D1C9BD)
- **Brand/Gold** (Akzente, CTAs): `brand` (#F5B731), `brand-dark` (#E5A820), `brand-light` (#F9D06C)
- **Navy** (Text, dunkle Elemente): `navy` (#1A1A2E), `navy-light` (#2D2D44), `navy-muted` (#4A4A5C)

### Animationen
- `animate-fade-in` - Einblenden (0.6s)
- `animate-slide-up` - Von unten einblenden (0.6s)
- `animate-float` - Schwebeeffekt (6s, endlos)

### Typografie
- Font: **Inter** (Google Fonts, Subset: latin)
- Headings: `font-bold` / `font-extrabold`, `tracking-tight`

---

## Umgebungsvariablen

| Variable | Pflicht | Beschreibung |
|---|---|---|
| `OPENAI_API_KEY` | Ja | OpenAI API-Key fuer Chat und TTS |
| `NEXTAUTH_SECRET` | Ja | Geheimschluessel fuer Session-Verschluesselung (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Ja | Basis-URL der App (`http://localhost:3000` oder Produktions-URL) |
| `DEMO_PASSWORD` | Ja | Passwort fuer den Demo-Zugang |
| `STRIPE_SECRET_KEY` | Nein | Stripe Secret Key (Test-Modus: `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Nein | Stripe Webhook Secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Nein | Stripe Publishable Key (Frontend) |
| `NEXT_PUBLIC_SITE_URL` | Nein | Oeffentliche URL der Seite |

---

## Haeufige Aenderungsszenarien

### Neuen API-Endpunkt hinzufuegen
1. Datei erstellen: `app/api/<name>/route.ts`
2. Exportiere `POST` (oder `GET`) async-Funktion
3. Falls geschuetzt: Endpunkt-Pattern in `middleware.ts` config.matcher eintragen

### Chat-Verhalten aendern
- System-Prompt: `app/api/chat/route.ts` Zeile 115-197 (langer String am Ende der Datei)
- Neues Tool: In der `tools`-Map in derselben Datei (Zeile 24-113)
- Tool-Parameter werden mit `zod` definiert

### Neue Seite hinzufuegen
1. Ordner erstellen: `app/<seitenname>/page.tsx`
2. React-Komponente als Default-Export
3. Falls geschuetzt: Pfad in `middleware.ts` matcher eintragen

### Styling aendern
- Globale Farben: `tailwind.config.js` -> theme.extend.colors
- Globale Animationen: `tailwind.config.js` -> theme.extend.animation/keyframes
- Seiten-spezifisch: Inline Tailwind-Klassen in den jeweiligen `page.tsx`-Dateien
- CSS-Variablen und Scrollbar-Styling: `app/globals.css`

### Datenmodell erweitern
1. Typ in `lib/storage.ts` erweitern/hinzufuegen
2. Getter/Setter-Funktionen hinzufuegen (Pattern: `getX()` / `saveX()`)
3. Default-Value in `readJSON()` Aufruf beachten (leeres Array als Fallback)

### Demo-Firmen aendern
- Liste in `app/api/register/route.ts` Zeile 7-18 (`DEMO_COMPANIES` Array)

---

## Bekannte Einschraenkungen

1. **Kein persistenter Storage auf Vercel** - JSON-Dateien in `/tmp` gehen bei Cold Start verloren
2. **Keine Tests** - Kein Test-Framework eingerichtet
3. **Kein Linting/Formatting** - Kein ESLint oder Prettier konfiguriert
4. **Keine CI/CD** - Keine GitHub Actions oder Pre-Commit-Hooks
5. **Demo-Auth** - Ein einziges Passwort fuer alle Nutzer (keine echte User-Authentifizierung)
6. **API-Routen ohne Rate-Limiting** - /api/register und /api/tts sind ungeschuetzt
7. **Stripe nur Test-Modus** - Keine Webhook-Verifizierung implementiert
8. **Chat-Seite ist monolithisch** - ~800 Zeilen in einer Datei, koennte in Komponenten aufgeteilt werden

---

## Build & Deployment

```bash
npm run dev       # Entwicklungsserver (Port 3000)
npm run build     # Produktions-Build
npm run start     # Produktionsserver starten
```

- Deployment-Ziel: **Vercel** (optimiert, vercel.json vorhanden)
- `next.config.js`: Body-Size-Limit 10MB fuer Datei-Uploads
- Vercel erkennt Next.js automatisch, Env-Variablen im Vercel-Dashboard setzen

---

## Wichtige Dateien fuer Aenderungen (nach Prioritaet)

| Datei | Zeilen | Warum wichtig |
|---|---|---|
| `app/chat/page.tsx` | ~800 | Haupt-UI: Chat, Modals, Audio, PDF-Export |
| `app/api/chat/route.ts` | ~200 | AI-Logik: System-Prompt, Tools, Streaming |
| `lib/storage.ts` | ~100 | Daten-Schicht: Typen, CRUD-Operationen |
| `app/api/register/route.ts` | ~137 | Registrierung + Demo-Ergebnis-Generierung |
| `app/page.tsx` | ~630 | Landing Page (Marketing) |
| `tailwind.config.js` | ~53 | Design-System: Farben, Animationen |
| `middleware.ts` | ~21 | Routen-Schutz |
| `lib/auth.ts` | ~34 | Auth-Konfiguration |
