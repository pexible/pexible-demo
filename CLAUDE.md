# CLAUDE.md - Kontext fuer Claude Code Sessions

> Diese Datei ist die primaere Referenz fuer Claude Code Sessions.
> Lies sie ZUERST, bevor du Code aenderst. Alle Regeln hier sind verbindlich.

---

## 1. Projekt-Identitaet

- **Name:** pexible-demo
- **Typ:** Next.js 15 App Router (TypeScript, React 19)
- **Zweck:** KI-gesteuerter Job-Makler-Demo mit konversationalem Sales-Funnel
- **Sprache der UI:** Deutsch (alle sichtbaren Texte, Fehlermeldungen, System-Prompt)
- **Sprache des Codes:** Englisch (Variablen, Typen, Kommentare, Dateinamen)

**User-Flow:** Landing Page -> Login (Passwort-Gate) -> Chat mit AI-Agent -> Registrierung (Modal) -> 3 Freemium-Ergebnisse -> Bezahlung 49 EUR (Stripe) -> Alle Ergebnisse

---

## 2. Verbindliche Regeln

### R1: Sprachregeln
- UI-Texte, Fehlermeldungen, Platzhalter: **immer Deutsch**
- Variablen, Funktionen, Typen, Kommentare im Code: **immer Englisch**
- Commit-Messages: Englisch
- Dateinamen: Englisch, kebab-case fuer Ordner

### R2: Architektur-Regeln
- Alle Seiten liegen als `page.tsx` in `app/` (Next.js App Router Pattern)
- Alle API-Endpunkte liegen als `route.ts` in `app/api/<name>/`
- Alle API-Routen exportieren async-Funktionen (`POST`, `GET`)
- Shared-Logik liegt in `lib/` (storage, auth)
- Client-Components muessen `'use client'` als erste Zeile haben
- Server-Components (default) benoetigen kein Directive
- Es gibt **keine** `pages/` directory -- nur `app/` wird verwendet

### R3: Daten-Regeln
- **Kein Datenbank-Server.** Alles laeuft ueber JSON-Dateien (`lib/storage.ts`)
- Lokal: `data/*.json` im Projektverzeichnis
- Vercel/Serverless: `/tmp/pexible-data/*.json` (ephemeral!)
- Jede Entitaet hat eine eigene JSON-Datei: `users.json`, `searches.json`, `results.json`
- IDs werden mit `nanoid()` generiert (Import: `import { nanoid } from 'nanoid'`)
- Timestamps: ISO 8601 Strings (`new Date().toISOString()`)
- Passwoerter: bcrypt mit 10 Runden (`bcrypt.hash(pw, 10)`)

### R4: Styling-Regeln
- **Tailwind CSS** -- keine separaten CSS-Module oder styled-components
- Farbpalette NUR aus `tailwind.config.js` verwenden:
  - Hintergruende: `cream-50` bis `cream-400` (Basis: `#FDF8F0`)
  - Akzente/CTAs: `brand` (#F5B731), `brand-dark` (#E5A820)
  - Text/Dunkel: `navy` (#1A1A2E), `navy-light` (#2D2D44), `navy-muted` (#4A4A5C)
- In `chat/page.tsx`: Farben werden als Hex-Literale verwendet (Legacy, konsistent halten)
- Font: Inter (Google Fonts, geladen in `app/layout.tsx`)
- Alle Seiten haben das warme Cream-Theme (`bg-[#FDF8F0]`)
- Modals: Dunkles Theme (`bg-[#1a1a24]`, weisser Text)

### R5: Auth-Regeln
- NextAuth mit Credentials Provider (nur Passwort, kein Username)
- Ein einziges Demo-Passwort via `DEMO_PASSWORD` Env-Variable
- JWT-Session-Strategie
- Login-Redirect: `/login`
- Geschuetzte Routen (Middleware): `/chat/*`, `/upload/*`, `/api/chat/*`, `/api/upload/*`
- **Nicht** geschuetzt: `/api/register`, `/api/create-payment-intent`, `/api/payment-confirm`, `/api/tts`

### R6: AI-Chat-Regeln
- Modell: GPT-4o via `@ai-sdk/openai` (NICHT direkt `openai` SDK fuer Chat)
- Streaming: `streamText()` + `toDataStreamResponse()` aus `ai`-Paket
- Frontend: `useChat()` Hook aus `ai/react`
- maxDuration: 30s, maxSteps: 5
- System-Prompt ist ein langer deutscher String in `app/api/chat/route.ts:115-197`
- Tool-Parameter werden mit `zod`-Schemas definiert

### R7: Payment-Regeln
- Stripe im Test-Modus (`sk_test_...`, `pk_test_...`)
- PaymentIntent-Betrag: 4900 Cent = 49,00 EUR
- Waehrung: `eur`
- Frontend: Stripe Elements mit `@stripe/react-stripe-js`
- Stripe-Appearance: Night-Theme mit `#F5B731` als Primary-Farbe

---

## 3. Dateistruktur mit Verantwortlichkeiten

```
app/
  layout.tsx              [30 Z]  Root-Layout: Inter-Font, <html lang="de">, SessionProvider
  globals.css             [92 Z]  CSS-Variablen, Scrollbar-Styling, Animationen
  page.tsx               [~630 Z] Landing Page: Hero, Features, Testimonials, FAQ, Blog-Preview
  login/page.tsx          [94 Z]  Passwort-Gate: ein Input, signIn('credentials'), redirect /chat
  chat/page.tsx          [815 Z]  HAUPT-DATEI: Chat-UI, Modals, Audio, PDF -- Details in Abschnitt 5
  blog/page.tsx          [~300 Z] Statische Blog-Artikel (6 Artikel, Grid-Layout)
  upload/page.tsx        [111 Z]  Admin-Upload: search_id + JSON-File -> /api/upload

  api/
    auth/[...nextauth]/route.ts  [6 Z]   NextAuth Handler (delegiert an lib/auth.ts)
    chat/route.ts               [201 Z]  AI-Streaming + 3 Tools + System-Prompt
    register/route.ts           [137 Z]  User + Search + Demo-Results erstellen
    create-payment-intent/route.ts [40 Z] Stripe PaymentIntent (4900 Cent)
    payment-confirm/route.ts     [51 Z]  Zahlung bestaetigen, search.paid = true
    tts/route.ts                 [44 Z]  OpenAI TTS (tts-1, nova, MP3)
    upload/route.ts              [64 Z]  Admin JSON-Upload fuer echte Ergebnisse

components/
  SessionProvider.tsx     [7 Z]   Client-Wrapper fuer NextAuth SessionProvider

lib/
  auth.ts                [34 Z]   NextAuth Config: CredentialsProvider, JWT, Callbacks
  storage.ts             [99 Z]   JSON-Storage: Typen (User, Search, Result) + CRUD-Funktionen
```

---

## 4. Datenmodelle (lib/storage.ts:48-75)

```typescript
// lib/storage.ts:48-54
type User = {
  id: string              // nanoid()
  email: string           // muss @ enthalten
  password_hash: string   // bcrypt, 10 Runden
  first_name: string      // min 2 Zeichen (AI-Tool-Validierung)
  created_at: string      // ISO 8601
}

// lib/storage.ts:56-65
type Search = {
  id: string              // nanoid()
  user_id: string         // FK -> User.id
  job_title: string       // z.B. "Content Manager"
  postal_code: string     // genau 5 Ziffern, Regex: /^\d{5}$/
  status: 'pending' | 'completed'
  paid: boolean           // false = 3 Ergebnisse sichtbar, true = alle
  total_results: number   // Gesamtzahl der Ergebnisse
  created_at: string      // ISO 8601
}

// lib/storage.ts:67-75
type Result = {
  id: string              // nanoid()
  search_id: string       // FK -> Search.id
  company_name: string    // z.B. "Siemens AG"
  job_title: string       // z.B. "Controller (m/w/d)"
  job_url: string         // https://careers.domain.com/jobs/...
  description: string     // Kurzbeschreibung der Stelle
  rank: number            // 1 = bester Treffer, aufsteigend
}
```

### Storage-Funktionen (lib/storage.ts:77-99)
| Funktion | Signatur | Datei |
|---|---|---|
| `getUsers()` | `() => Promise<{ users: User[] }>` | `users.json` |
| `saveUsers(data)` | `(data: { users: User[] }) => Promise<void>` | `users.json` |
| `getSearches()` | `() => Promise<{ searches: Search[] }>` | `searches.json` |
| `saveSearches(data)` | `(data: { searches: Search[] }) => Promise<void>` | `searches.json` |
| `getResults()` | `() => Promise<{ results: Result[] }>` | `results.json` |
| `saveResults(data)` | `(data: { results: Result[] }) => Promise<void>` | `results.json` |
| `readJSON(file, default)` | `<T>(filename: string, defaultValue: T) => Promise<T>` | beliebig |
| `writeJSON(file, data)` | `<T>(filename: string, data: T) => Promise<void>` | beliebig |

### Regel: Neues Datenmodell hinzufuegen
1. Typ in `lib/storage.ts` definieren (nach Zeile 75)
2. Getter-Funktion: `export async function getXxx(): Promise<{ xxx: Xxx[] }> { return readJSON('xxx.json', { xxx: [] }) }`
3. Setter-Funktion: `export async function saveXxx(data: { xxx: Xxx[] }): Promise<void> { return writeJSON('xxx.json', data) }`
4. Default-Value ist immer `{ entityName: [] }` (Objekt mit Array)

---

## 5. Chat-Seite im Detail (app/chat/page.tsx)

Dies ist die groesste und komplexeste Datei. Struktur:

### 5.1 Interne Komponenten (in derselben Datei)
| Komponente | Zeilen | Zweck |
|---|---|---|
| `getVisibleContent()` | 31-35 | Filtert `<!--RESULTS_DATA...-->` und `<!--PAYMENT_SUCCESS...-->` aus Nachrichten |
| `generateResultsPdf()` | 37-127 | Erstellt PDF mit jsPDF (A4, Tabelle, pexible-Branding) |
| `RegistrationModal` | 131-204 | Modal: Passwort setzen -> POST /api/register -> onSuccess |
| `CheckoutForm` | 208-237 | Stripe PaymentElement + Confirm -> POST /api/payment-confirm |
| `PaymentModal` | 239-295 | Modal: Laedt Stripe clientSecret -> zeigt CheckoutForm |
| `ChatPage` (default) | 299-815 | Haupt-Seite: Chat, Audio, State, Modals |

### 5.2 State-Management (ChatPage, Zeile 300-334)
| State | Typ | Zweck |
|---|---|---|
| `messages, input, handleInputChange, handleSubmit, isLoading, append` | useChat() | Vercel AI SDK Chat-State |
| `showModal` | boolean | Registrierungs-Modal offen? |
| `registrationData` | RegistrationData \| null | Daten vom `request_registration`-Tool |
| `showPaymentModal` | boolean | Payment-Modal offen? |
| `paymentSearchId` | string \| null | search_id fuer Zahlung |
| `paymentHandled` | Set\<string\> | Verhindert doppeltes Oeffnen des Payment-Modals |
| `loggedInUser` | string \| null | Vorname nach Registrierung (Anzeige im Navbar) |
| `freemiumResults` | PdfResult[] | Erste 3 Ergebnisse (fuer PDF-Download) |
| `allResults` | PdfResult[] | Alle Ergebnisse (fuer PDF nach Zahlung) |
| `resultJobTitle` | string | Jobtitel fuer PDF-Header |
| `hasPaid` | boolean | Zahlungsstatus (steuert PDF-Inhalt) |
| `audioMode` | boolean | Sprachmodus aktiv? |
| `isListening` | boolean | Mikrofon aktiv? |
| `isSpeaking` | boolean | TTS-Wiedergabe laeuft? |

### 5.3 Kritischer Datenfluss: Frontend <-> Backend <-> AI

**Registrierung:**
1. AI ruft Tool `request_registration(email, first_name, job_title, postal_code)` auf
2. Tool gibt `{ action: 'show_registration_modal', data: {...} }` zurueck
3. `useEffect` (Zeile 349-359) erkennt `action === 'show_registration_modal'` -> oeffnet Modal
4. User gibt Passwort ein -> Modal ruft `POST /api/register`
5. Register-API erstellt User + Search + 7-10 Demo-Results, gibt alles zurueck
6. `handleRegistrationSuccess` (Zeile 528-543): Speichert Results in State, sendet sie als versteckte Nachricht an AI:
   ```
   <!--RESULTS_DATA\nSearch-ID: ...\nSUCHERGEBNISSE (X Treffer):\n...-->
   ```
7. AI sieht die Ergebnisse in der Nachricht und zeigt 3 kostenlose an

**Zahlung:**
1. AI ruft Tool `create_payment(search_id)` auf
2. Tool gibt `{ action: 'show_payment_modal', search_id }` zurueck
3. `useEffect` (Zeile 361-373) erkennt `action === 'show_payment_modal'` -> oeffnet Modal
4. Modal ruft `POST /api/create-payment-intent` -> bekommt `clientSecret`
5. User bezahlt via Stripe Elements -> `stripe.confirmPayment()`
6. Checkout ruft `POST /api/payment-confirm` -> setzt `search.paid = true`
7. `handlePaymentSuccess` (Zeile 545-554): Sendet Bestaetigung an AI:
   ```
   <!--PAYMENT_SUCCESS search_id=...-->
   ```
8. AI zeigt alle Ergebnisse aus der urspruenglichen Nachricht

**Wichtig:** Die Kommentare `<!--RESULTS_DATA...-->` und `<!--PAYMENT_SUCCESS...-->` werden im Frontend durch `getVisibleContent()` herausgefiltert und dem User nicht angezeigt. Sie dienen nur der Kommunikation Frontend -> AI.

### 5.4 Audio-Modus (Zeile 326-527)
- **Spracheingabe:** Web Speech API (`SpeechRecognition`), Sprache: `de-DE`
- **Sprachausgabe:** Primaer OpenAI TTS (`/api/tts`), Fallback: Browser `speechSynthesis`
- **Flow:** Bot spricht -> Audio endet -> Mikrofon startet automatisch -> User spricht -> Nachricht gesendet -> Bot antwortet -> Zyklus wiederholt
- **Auto-Exit:** Wenn Bot nach Email fragt (Zeile 484-489), wird Audio-Modus beendet (Email muss getippt werden)
- **Text-Versteckung:** Waehrend TTS geladen wird, zeigt Chat nur Lade-Animation statt Text (Zeile 481, `pendingAudioMsgId`)

---

## 6. API-Referenz (exakte Schemas)

### POST /api/chat (app/api/chat/route.ts)
- **Auth:** Ja (Middleware)
- **Request:** `{ messages: Message[] }` (Vercel AI SDK Message-Format)
- **Response:** Data-Stream (SSE) via `toDataStreamResponse()`
- **AI-Tools:**

| Tool | Parameter | Rueckgabe | Frontend-Reaktion |
|---|---|---|---|
| `request_registration` | `{ email: string, first_name: string, job_title: string, postal_code: string }` | `{ action: 'show_registration_modal', data: {...} }` | Oeffnet RegistrationModal |
| `check_results` | `{ search_id: string }` | `{ found, paid, total_results, freemium_results?, all_results?, locked_count? }` | AI formatiert Ergebnisse |
| `create_payment` | `{ search_id: string }` | `{ action: 'show_payment_modal', search_id }` | Oeffnet PaymentModal |

### POST /api/register (app/api/register/route.ts)
- **Auth:** Nein
- **Request:** `{ email: string, password: string, first_name: string, job_title: string, postal_code: string }`
- **Validierung:** email mit @, password >= 8 Zeichen, postal_code genau 5 Ziffern, alle Felder pflicht
- **Erfolg (200):** `{ success: true, user_id, search_id, first_name, total_results, results: [{company_name, job_title, job_url, description}], message }`
- **Fehler (400):** `{ success: false, error: "..." }`
- **Seiteneffekte:** Erstellt User, Search, 7-10 Demo-Results in Storage

### POST /api/create-payment-intent (app/api/create-payment-intent/route.ts)
- **Auth:** Nein
- **Request:** `{ search_id: string }`
- **Erfolg (200):** `{ clientSecret: string }`
- **Fehler (500):** `{ error: "Stripe ist nicht konfiguriert" }` oder `{ error: "Fehler beim Erstellen der Zahlung" }`

### POST /api/payment-confirm (app/api/payment-confirm/route.ts)
- **Auth:** Nein
- **Request:** `{ payment_intent_id: string, search_id: string }`
- **Erfolg (200):** `{ success: true }`
- **Seiteneffekte:** Setzt `search.paid = true` in Storage (graceful bei Serverless-Fehler)

### POST /api/tts (app/api/tts/route.ts)
- **Auth:** Nein
- **Request:** `{ text: string }`
- **Erfolg (200):** Audio-Stream (`Content-Type: audio/mpeg`)
- **Modell:** OpenAI `tts-1`, Stimme: `nova`, Format: MP3, Speed: 1.0

### POST /api/upload (app/api/upload/route.ts)
- **Auth:** Ja (Middleware)
- **Request:** FormData mit `file` (JSON) + `search_id` (string)
- **JSON-Format der Datei:** `[{ company_name, job_title, job_url, description }]`
- **Seiteneffekte:** Loescht alte Results fuer search_id, erstellt neue, setzt `search.status = 'completed'`

---

## 7. Design-System

### 7.1 Farbpalette (tailwind.config.js)
```
Cream (Hintergruende):
  cream-50:  #FEFCF8    cream-100: #FDF8F0 (Haupt-BG)
  cream-200: #F5EFE3    cream-300: #E8E0D4    cream-400: #D1C9BD

Brand/Gold (Akzente, CTAs, Highlights):
  brand:      #F5B731   brand-dark: #E5A820
  brand-light: #F9D06C  brand-muted: #F5B731

Navy (Text, dunkle Elemente):
  navy:       #1A1A2E   navy-light: #2D2D44   navy-muted: #4A4A5C
```

### 7.2 CSS-Variablen (app/globals.css:5-11)
```css
--color-cream:      #FDF8F0
--color-cream-dark: #F5EFE3
--color-brand:      #F5B731
--color-brand-dark: #E5A820
--color-navy:       #1A1A2E
```

### 7.3 Animationen (tailwind.config.js:30-48)
| Klasse | Dauer | Effekt |
|---|---|---|
| `animate-fade-in` | 0.6s | Opacity 0 -> 1 |
| `animate-slide-up` | 0.6s | translateY(20px) + Opacity |
| `animate-float` | 6s, infinite | translateY(0 -> -10px -> 0) |
| `animate-float-delayed` | 6s, 3s delay, infinite | Wie float, versetzt |

### 7.4 UI-Konventionen
- **Buttons (primaer):** `bg-[#F5B731] hover:bg-[#E8930C] text-white font-semibold rounded-xl`
- **Buttons (sekundaer):** `bg-[#1A1A2E] hover:bg-[#2D2D44] text-white rounded-xl`
- **Inputs:** `bg-[#F9F5EE] border border-[#E8E0D4] rounded-xl text-sm focus:ring-[#F5B731]/40`
- **Cards:** `bg-white rounded-2xl border border-[#E8E0D4]/80 shadow-xl shadow-black/5`
- **Modals:** `bg-[#1a1a24] border border-white/10 rounded-2xl` (dunkles Theme)
- **Chat-Bubbles Bot:** `bg-[#F5F0E8] text-[#1A1A2E] rounded-2xl rounded-tl-md`
- **Chat-Bubbles User:** `bg-[#F5B731] text-[#1A1A2E] rounded-2xl rounded-tr-md`
- **Navbar:** `bg-[#FDF8F0]/80 backdrop-blur-xl border-b border-[#E8E0D4]/60`
- **Error-Anzeige:** `bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl` (Modal) oder `bg-red-50 text-red-600 border-red-200` (Light-Pages)

---

## 8. Aenderungsanleitungen

### 8.1 Neuen API-Endpunkt hinzufuegen
1. Erstelle `app/api/<name>/route.ts`
2. Exportiere `export async function POST(req: Request) { ... }`
3. Verwende `NextResponse.json()` fuer JSON-Antworten
4. Falls geschuetzt: Fuege Pattern zu `middleware.ts:19` matcher-Array hinzu
5. Fehlermeldungen: Deutsch (R1)

### 8.2 Neues AI-Tool hinzufuegen
1. Oeffne `app/api/chat/route.ts`
2. Fuege Tool in `tools`-Objekt ein (nach Zeile 24, innerhalb `streamText()`)
3. Pattern:
```typescript
tool_name: tool({
  description: 'Deutsche Beschreibung was das Tool tut',
  parameters: z.object({
    param: z.string().min(1)  // zod-Schema
  }),
  execute: async (params) => {
    // Logik
    return { action: 'frontend_action_name', ...data }
  }
})
```
4. Im Frontend (`chat/page.tsx`): useEffect hinzufuegen das `toolInvocations` ueberwacht und auf `action` reagiert (Pattern: Zeile 349-373)

### 8.3 Neues Modal hinzufuegen
1. Definiere Modal-Komponente in `chat/page.tsx` (Pattern: RegistrationModal, Zeile 131-204)
2. Fuege State hinzu: `const [showXxxModal, setShowXxxModal] = useState(false)`
3. Fuege useEffect hinzu das auf Tool-Invocation reagiert
4. Rendere Modal am Ende der ChatPage-Komponente (Zeile 811-812)
5. Verwende dunkles Modal-Theme (R4)

### 8.4 Neue Seite hinzufuegen
1. Erstelle `app/<seitenname>/page.tsx`
2. Default-Export: React-Komponente
3. Client-Komponenten: `'use client'` als erste Zeile
4. Basis-Layout: `<div className="min-h-screen bg-[#FDF8F0]">`
5. Falls geschuetzt: Pfad in `middleware.ts:19` matcher eintragen

### 8.5 System-Prompt aendern
- Datei: `app/api/chat/route.ts:115-197`
- Der Prompt ist ein langer Template-String (Backticks)
- Struktur: 8 Phasen + Regeln-Block
- Aenderungen am Prompt beeinflussen das gesamte Chat-Verhalten

### 8.6 Demo-Firmen aendern
- Datei: `app/api/register/route.ts:7-18`
- Array `DEMO_COMPANIES`: `{ name: string, domain: string }`
- Wird bei jeder Registrierung zufaellig gemischt, 7-10 werden ausgewaehlt

### 8.7 Styling global aendern
- Farben: `tailwind.config.js` -> `theme.extend.colors`
- Animationen: `tailwind.config.js` -> `theme.extend.animation` + `keyframes`
- CSS-Variablen: `app/globals.css:5-11`
- Scrollbar: `app/globals.css:25-40`

### 8.8 Neues Datenmodell hinzufuegen
Siehe Abschnitt 4, "Regel: Neues Datenmodell hinzufuegen"

---

## 9. Abhaengigkeiten und Imports

### 9.1 Externe Pakete
| Paket | Import-Pfad | Verwendet in |
|---|---|---|
| `@ai-sdk/openai` | `import { openai } from '@ai-sdk/openai'` | `api/chat/route.ts` |
| `ai` | `import { streamText, tool } from 'ai'` | `api/chat/route.ts` |
| `ai/react` | `import { useChat } from 'ai/react'` | `chat/page.tsx` |
| `next-auth` | `import { signIn } from 'next-auth/react'` | `login/page.tsx` |
| `next-auth/middleware` | `import { withAuth } from 'next-auth/middleware'` | `middleware.ts` |
| `bcryptjs` | `import bcrypt from 'bcryptjs'` | `api/register/route.ts` |
| `nanoid` | `import { nanoid } from 'nanoid'` | `api/chat/route.ts`, `api/register/route.ts`, `api/upload/route.ts` |
| `zod` | `import { z } from 'zod'` | `api/chat/route.ts` |
| `stripe` | `import Stripe from 'stripe'` | `api/create-payment-intent/route.ts`, `api/payment-confirm/route.ts` |
| `@stripe/react-stripe-js` | `import { Elements, PaymentElement, useStripe, useElements } from '...'` | `chat/page.tsx` |
| `@stripe/stripe-js` | `import { loadStripe } from '@stripe/stripe-js'` | `chat/page.tsx` |
| `openai` | `import OpenAI from 'openai'` | `api/tts/route.ts` |
| `jspdf` | `import { jsPDF } from 'jspdf'` | `chat/page.tsx` |

### 9.2 Interne Imports
| Pfad | Exportiert | Importiert von |
|---|---|---|
| `@/lib/storage` | Typen (User, Search, Result) + CRUD-Funktionen | `api/chat`, `api/register`, `api/payment-confirm`, `api/upload` |
| `@/lib/auth` | `authOptions` (NextAuthOptions) | `api/auth/[...nextauth]/route.ts` |
| `@/components/SessionProvider` | `SessionProvider` | `app/layout.tsx` |

---

## 10. Umgebungsvariablen

| Variable | Pflicht | Typ | Verwendet in |
|---|---|---|---|
| `OPENAI_API_KEY` | Ja | `sk-proj-...` | `api/chat` (implizit via @ai-sdk), `api/tts` (explizit) |
| `NEXTAUTH_SECRET` | Ja | Base64-String | `lib/auth.ts` |
| `NEXTAUTH_URL` | Ja | URL | NextAuth intern |
| `DEMO_PASSWORD` | Ja | String | `lib/auth.ts:14` |
| `STRIPE_SECRET_KEY` | Nein | `sk_test_...` | `api/create-payment-intent`, `api/payment-confirm` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Nein | `pk_test_...` | `chat/page.tsx:9` (Client-Side) |
| `STRIPE_WEBHOOK_SECRET` | Nein | `whsec_...` | Nicht implementiert |
| `NEXT_PUBLIC_SITE_URL` | Nein | URL | Meta-Tags |
| `VERCEL` | Auto | `'1'` | `lib/storage.ts:8` (Serverless-Erkennung) |

---

## 11. Bekannte Einschraenkungen und Schulden

| # | Problem | Betroffene Dateien | Auswirkung |
|---|---|---|---|
| 1 | Kein persistenter Storage auf Vercel | `lib/storage.ts` | Daten gehen bei Cold Start verloren |
| 2 | Keine Tests | -- | Kein Sicherheitsnetz bei Aenderungen |
| 3 | Kein ESLint/Prettier | -- | Kein konsistentes Code-Format erzwungen |
| 4 | Keine CI/CD | -- | Kein automatisierter Build/Test |
| 5 | Demo-Auth (ein Passwort fuer alle) | `lib/auth.ts` | Keine echte User-Trennung |
| 6 | Kein Rate-Limiting | `api/register`, `api/tts` | Missbrauch moeglich |
| 7 | Stripe ohne Webhook-Verifizierung | `api/payment-confirm` | Payment-Status nur client-seitig bestaetigt |
| 8 | Chat-Seite monolithisch (815 Zeilen) | `app/chat/page.tsx` | Schwer wartbar, koennte aufgeteilt werden |
| 9 | Upload-Seite ohne Design-System | `app/upload/page.tsx` | Nutzt graue Tailwind-Defaults statt Cream-Theme |
| 10 | `check_results`-Tool wird im Hauptflow nicht benoetigt | `api/chat/route.ts` | Results werden direkt in Chat-Nachricht eingebettet |

---

## 12. Build und Scripts

```bash
npm run dev       # next dev (Port 3000)
npm run build     # next build (Produktions-Build)
npm run start     # next start (Produktionsserver)
```

- **Deployment-Ziel:** Vercel (Config: `vercel.json`)
- **Body-Size-Limit:** 10MB (`next.config.js` -> `serverActions.bodySizeLimit`)
- **TypeScript:** Strict-Mode (`tsconfig.json`)
- **Path-Alias:** `@/*` -> Projekt-Root

---

## 13. Schnellstart fuer neue Sessions

```bash
npm install
cp .env.local.example .env.local   # Werte eintragen
npm run dev                         # http://localhost:3000
```

**Wichtigste Dateien zum Lesen bei Aenderungen:**
1. `app/chat/page.tsx` -- Chat-UI, State, Modals, Audio
2. `app/api/chat/route.ts` -- AI-Logik, Tools, System-Prompt
3. `lib/storage.ts` -- Datenmodelle, CRUD
4. `app/api/register/route.ts` -- Registrierung, Demo-Ergebnisse
5. `middleware.ts` -- Routen-Schutz (was geschuetzt ist, was nicht)
