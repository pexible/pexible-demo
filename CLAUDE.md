# CLAUDE.md - Kontext fuer Claude Code Sessions

> Diese Datei ist die primaere Referenz fuer Claude Code Sessions.
> Lies sie ZUERST, bevor du Code aenderst. Alle Regeln hier sind verbindlich.
>
> **Struktur:** Abschnitte 1-13 beschreiben WAS gebaut wurde (Projekt, Architektur, APIs).
> **Abschnitt 14** beschreibt WIE gearbeitet wird (Verhaltensregeln, Arbeitsmuster).
> Beide sind gleichermassen bindend.

---

## 1. Projekt-Identitaet

- **Name:** pexible-demo
- **Typ:** Next.js 15 App Router (TypeScript, React 19)
- **Zweck:** KI-gesteuerter Job-Makler mit konversationalem Sales-Funnel + CV-Check Feature
- **Sprache der UI:** Deutsch (alle sichtbaren Texte, Fehlermeldungen, System-Prompt)
- **Sprache des Codes:** Englisch (Variablen, Typen, Kommentare, Dateinamen)

**User-Flow (Jobsuche):** Landing Page -> Chat (anonym) -> AI sammelt Job + PLZ -> Registrierung (OTP via Supabase) -> 3 Freemium-Ergebnisse -> Bezahlung 49 EUR (Stripe) -> Alle Ergebnisse

**User-Flow (CV-Check):** Landing Page -> CV-Check Seite -> PDF hochladen -> KI-Analyse (2 Stufen) -> Ergebnis anzeigen -> Optional: KI-Optimierung (kostenpflichtig)

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
- Alle API-Routen exportieren async-Funktionen (`POST`, `GET`, `PUT`)
- Shared-Logik liegt in `lib/` (supabase, hooks, navigation, rate-limit, demo-data, cv-*)
- Client-Components muessen `'use client'` als erste Zeile haben
- Server-Components (default) benoetigen kein Directive
- Es gibt **keine** `pages/` directory -- nur `app/` wird verwendet
- Shared UI-Komponenten liegen in `components/` (Navbar, Footer, etc.)

### R3: Daten-Regeln
- **Supabase** (PostgreSQL) fuer alle persistenten Daten
- Server-Side: `createClient()` aus `@/lib/supabase/server` (cookie-basiert)
- Client-Side: `createClient()` aus `@/lib/supabase/client` (browser)
- Admin-Operationen: `createAdminClient()` aus `@/lib/supabase/admin` (service role, umgeht RLS)
- IDs werden mit `nanoid()` generiert (Import: `import { nanoid } from 'nanoid'`)
- Timestamps: ISO 8601 Strings (`new Date().toISOString()`)
- Tabellen: `profiles`, `searches`, `results`, `conversations`, `cv_checks`, `cv_check_results`

### R4: Styling-Regeln
- **Tailwind CSS** -- keine separaten CSS-Module oder styled-components
- Farbpalette NUR aus `tailwind.config.js` verwenden:
  - Hintergruende: `cream-50` bis `cream-400` (Basis: `#FDF8F0`)
  - Akzente/CTAs: `brand` (#F5B731), `brand-dark` (#E5A820)
  - Text/Dunkel: `navy` (#1A1A2E), `navy-light` (#2D2D44), `navy-muted` (#4A4A5C)
- Font: Inter (Google Fonts, geladen in `app/layout.tsx`)
- Alle Seiten haben das warme Cream-Theme (`bg-[#FDF8F0]`)
- Modals (Payment): Dunkles Theme (`bg-[#1a1a24]`, weisser Text)
- Modals (Registration): Helles Theme (`bg-white`)

### R5: Auth-Regeln
- **Supabase Auth** mit OTP (Email-Code, kein Passwort)
- Login-Flow: Email eingeben -> 6-stelliger OTP-Code per Email -> Verifizieren -> Optional Vorname setzen
- Session-Management via Supabase Cookies (SSR-kompatibel)
- Middleware (`middleware.ts`) refresht Sessions und schuetzt Routen
- Client-Side Auth: `useUser()` Hook aus `@/lib/hooks/useUser`
- **Geschuetzte Routen (Middleware):** `/chat/*` (nicht `/chat`), `/mein-pex/*`, `/upload/*`, `/api/upload/*`, `/api/conversations/*`, `/cv-check/result/*`, `/cv-check/optimize/*`, `/api/cv-check/results/*`, `/api/cv-check/download/*`, `/api/cv-check/optimize/*`, `/api/cv-check/create-checkout/*`
- **Nicht geschuetzt:** `/chat` (anonym nutzbar), `/api/chat`, `/api/register`, `/api/tts`, `/api/cv-check/analyze`
- Unauthentifizierte User werden zu `/login?redirect=...` weitergeleitet

### R6: AI-Chat-Regeln
- Modell: GPT-4o via `@ai-sdk/openai` (NICHT direkt `openai` SDK fuer Chat)
- Streaming: `streamText()` + `toDataStreamResponse()` aus `ai`-Paket
- Frontend: `useChat()` Hook aus `ai/react`
- maxDuration: 30s, maxSteps: 5
- Zwei System-Prompts: einer fuer authentifizierte, einer fuer anonyme User
- Tool-Parameter werden mit `zod`-Schemas definiert
- Rate-Limit: 20 Chat-Requests pro Minute pro IP

### R7: Payment-Regeln
- Stripe im Test-Modus (`sk_test_...`, `pk_test_...`)
- PaymentIntent-Betrag: 4900 Cent = 49,00 EUR
- Waehrung: `eur`
- Frontend: Stripe Elements mit `@stripe/react-stripe-js`
- Stripe-Appearance: Night-Theme mit `#F5B731` als Primary-Farbe
- PaymentIntent enthaelt `metadata: { search_id, user_id }` fuer IDOR-Schutz
- Payment-Confirm validiert, dass `metadata.search_id` mit der Anfrage uebereinstimmt

---

## 3. Dateistruktur mit Verantwortlichkeiten

```
app/
  layout.tsx                [135 Z]  Root-Layout: Inter-Font, <html lang="de">, JSON-LD SEO
  globals.css               [163 Z]  CSS-Variablen, Scrollbar, safe-area, Animationen, reduced-motion
  page.tsx                  [540 Z]  Landing Page: Hero, Features, How-it-works, Testimonials, FAQ
  login/page.tsx            [461 Z]  OTP-Login: Email -> Code -> Optional Name
  chat/page.tsx             [898 Z]  Dual-Mode: ChatListView (auth) + AnonymousChatView (anon)
  chat/[id]/page.tsx        [966 Z]  Chat-Detail: ActiveChatView + CompletedChatView + Payment
  register/page.tsx          [24 Z]  Redirect-Stub
  blog/page.tsx             [272 Z]  Statische Blog-Artikel (Grid-Layout)
  upload/page.tsx           [111 Z]  Admin-Upload: search_id + JSON-File -> /api/upload
  mein-pex/page.tsx         [480 Z]  Dashboard: Suchen, CV-Checks, Quick-Actions
  cv-check/page.tsx         [574 Z]  CV-Check Landing + PDF-Upload + Analyse-Trigger
  cv-check/optimize/page.tsx [518 Z] KI-Optimierung des Lebenslaufs
  cv-check/result/[id]/page.tsx [195 Z] Einzelnes CV-Check-Ergebnis anzeigen
  datenschutz/page.tsx             Datenschutzerklaerung
  impressum/page.tsx               Impressum + Widerrufsbelehrung

  api/
    chat/route.ts               [336 Z]  AI-Streaming + 3 Tools + System-Prompt
    register/route.ts           [113 Z]  Profil-Update + Search + Demo-Results erstellen
    create-payment-intent/route.ts [84 Z] Stripe PaymentIntent (4900 Cent, auth required)
    payment-confirm/route.ts     [64 Z]  Zahlung bestaetigen, search.paid = true
    tts/route.ts                 [75 Z]  OpenAI TTS (tts-1, nova, MP3, auth required)
    upload/route.ts             [127 Z]  Admin JSON-Upload fuer echte Ergebnisse
    conversations/route.ts      [151 Z]  GET: Liste, POST: Neue Konversation erstellen
    conversations/[id]/route.ts  [80 Z]  GET/PUT: Konversation lesen/aktualisieren
    conversations/[id]/messages/route.ts [57 Z]  POST: Nachrichten speichern
    cv-check/analyze/route.ts   [258 Z]  PDF-Upload + 2-stufige KI-Analyse
    cv-check/optimize/route.ts  [206 Z]  KI-Optimierung des Lebenslaufs
    cv-check/create-checkout/route.ts [80 Z] Stripe fuer CV-Optimierung
    cv-check/results/route.ts    [36 Z]  Liste aller CV-Checks eines Users
    cv-check/results/[id]/route.ts [41 Z] Einzelnes CV-Check-Ergebnis
    cv-check/download/[id]/[format]/route.ts [264 Z] PDF/DOCX-Export der Optimierung

components/
  Navbar.tsx              [449 Z]  Shared Navigation: 3 Varianten (default, minimal, back)
  Footer.tsx                       Shared Footer: dynamisch aus lib/navigation.ts
  NavAuthButtons.tsx      [101 Z]  Auth-abhaengige Buttons (Desktop + Mobile)
  FaqAccordion.tsx                 FAQ-Accordion mit Animation

lib/
  supabase/client.ts       [9 Z]   Browser-Client (createBrowserClient)
  supabase/server.ts      [28 Z]   Server-Client (cookie-basiert, SSR)
  supabase/admin.ts       [21 Z]   Admin-Client (service role, umgeht RLS)
  hooks/useUser.ts        [61 Z]   React Hook: user, isLoading, signOut
  navigation.ts           [86 Z]   Zentrale Nav-Config: primaryNavItems, footerGroups
  rate-limit.ts           [63 Z]   In-Memory Rate-Limiter + IP-Extraktion
  demo-data.ts            [37 Z]   DEMO_COMPANIES Array + generateDemoResults()
  cv-anonymize.ts                  CV-Text-Anonymisierung
  cv-prompts.ts                    AI-Prompts fuer CV-Analyse/Optimierung
  cv-token-store.ts                Token-Management fuer CV-Check (Supabase-backed)
```

---

## 4. Datenmodelle (Supabase-Tabellen)

### profiles (Supabase-managed, verknuepft mit auth.users)
```
id: uuid (PK, FK -> auth.users.id)
first_name: text
```

### searches
```
id: text (PK, nanoid)
user_id: uuid (FK -> profiles.id)
job_title: text
postal_code: text (5 Ziffern)
status: text ('pending' | 'completed')
paid: boolean
total_results: integer
created_at: timestamptz
```

### results
```
id: text (PK, nanoid)
search_id: text (FK -> searches.id)
company_name: text
job_title: text
job_url: text
description: text
rank: integer
```

### conversations
```
id: text (PK, nanoid)
user_id: uuid (FK -> profiles.id)
title: text
status: text ('active' | 'completed')
search_id: text (FK -> searches.id, nullable)
messages: jsonb (Array von Message-Objekten)
created_at: timestamptz
updated_at: timestamptz
```

---

## 5. Chat-System im Detail

Das Chat-System besteht aus zwei Seiten:

### 5.1 Chat-Liste / Anonym-Chat (`app/chat/page.tsx`, 898 Zeilen)

**Dual-Mode basierend auf Auth-Status:**
- **Authentifiziert:** `ChatListView` -- zeigt alle Konversationen, "Neuer Chat" Button, Suchfeld, 7-Tage-Cooldown zwischen Suchen
- **Anonym:** `AnonymousChatView` -- direkter Chat mit KI, nach Job+PLZ wird Registrierung getriggert

**Anonymer Chat -> Registrierung Flow:**
1. User chattet anonym mit KI (kein Auth noetig)
2. KI ruft `create_search(job_title, postal_code)` auf
3. Tool erkennt fehlende Auth und gibt `{ action: 'require_registration' }` zurueck
4. Frontend zeigt "Kostenlos registrieren" + "Beenden" Buttons
5. User klickt registrieren -> OTP-Modal oeffnet sich (Name + Email -> Code -> Verify)
6. Nach erfolgreicher Registrierung: Conversation wird erstellt, Nachrichten gespeichert, Redirect zu `/chat/[id]?registered=1`
7. Chat-Detail-Seite erkennt `?registered=1` und sendet automatisch Nachricht an KI

### 5.2 Chat-Detail (`app/chat/[id]/page.tsx`, 966 Zeilen)

**Zwei Unter-Views:**
- `ActiveChatView`: Aktiver Chat mit KI, Payment-Modal, Audio-Modus, PDF-Download
- `CompletedChatView`: Read-Only-Ansicht abgeschlossener Chats

**Kritischer Datenfluss:**

**Suche starten (auth User):**
1. KI ruft `create_search(job_title, postal_code)` auf
2. Tool erstellt Search + 7-10 Demo-Results in Supabase
3. Tool gibt `{ search_id, freemium_results, locked_results }` zurueck
4. Frontend speichert Results in State, zeigt 3 kostenlose
5. Chat-Input wird durch "Alle Ergebnisse freischalten" Button ersetzt

**Zahlung:**
1. KI ruft `create_payment(search_id)` auf -> oeffnet PaymentModal
2. PaymentModal ruft `POST /api/create-payment-intent` -> bekommt `clientSecret`
3. User bezahlt via Stripe Elements -> `stripe.confirmPayment()`
4. Frontend ruft `POST /api/payment-confirm` -> setzt `search.paid = true`
5. Bestaetigung wird als versteckte Nachricht an KI gesendet: `<!--PAYMENT_SUCCESS search_id=...-->`
6. KI zeigt alle Ergebnisse
7. Konversation wird als `completed` markiert

**Versteckte Nachrichten:** `<!--RESULTS_DATA...-->` und `<!--PAYMENT_SUCCESS...-->` werden durch `getVisibleContent()` im Frontend herausgefiltert.

### 5.3 Audio-Modus
- **Spracheingabe:** Web Speech API (`SpeechRecognition`), Sprache: `de-DE`
- **Sprachausgabe:** Primaer OpenAI TTS (`/api/tts`), Fallback: Browser `speechSynthesis`
- **Flow:** Bot spricht -> Audio endet -> Mikrofon startet automatisch -> User spricht -> Nachricht gesendet -> Bot antwortet -> Zyklus wiederholt
- **Auto-Exit:** Wenn Bot nach Email fragt, wird Audio-Modus beendet
- **Text-Versteckung:** Waehrend TTS geladen wird, zeigt Chat nur Lade-Animation statt Text

### 5.4 Nachrichten-Persistenz
- Nachrichten werden nach jeder KI-Antwort via `POST /api/conversations/[id]/messages` gespeichert
- Beim Laden einer Konversation werden gespeicherte Nachrichten wiederhergestellt
- Stripe-Redirect-Handling (Klarna etc.) nach Rueckkehr auf die Seite

---

## 6. API-Referenz

### POST /api/chat
- **Auth:** Nein (funktioniert auch anonym, aber Verhalten aendert sich)
- **Rate-Limit:** 20/min pro IP
- **Request:** `{ messages: Message[], conversationId?: string }`
- **Response:** Data-Stream (SSE) via `toDataStreamResponse()`
- **Limits:** Max 100 Nachrichten, max 5000 Zeichen pro Nachricht
- **AI-Tools:**

| Tool | Parameter | Rueckgabe (auth) | Rueckgabe (anon) |
|---|---|---|---|
| `create_search` | `{ job_title, postal_code }` | `{ search_id, freemium_results, locked_results }` | `{ action: 'require_registration' }` |
| `check_results` | `{ search_id }` | `{ found, paid, results... }` | `{ found: false }` |
| `create_payment` | `{ search_id }` | `{ action: 'show_payment_modal', search_id }` | -- |

### POST /api/register
- **Auth:** Ja (Supabase Session muss existieren, User ist bereits via OTP eingeloggt)
- **Rate-Limit:** 5/min pro IP
- **Request:** `{ first_name, email, job_title?, postal_code? }`
- **Validierung:** first_name min 2 / max 100 Zeichen, job_title max 200 Zeichen
- **Erfolg (200):** `{ success: true, user_id, first_name, search?: { search_id, total_results } }`
- **Seiteneffekte:** Aktualisiert Profil-Name, erstellt optional Search + Demo-Results

### POST /api/create-payment-intent
- **Auth:** Ja (Supabase Session)
- **Rate-Limit:** 5/min pro IP
- **Request:** `{ search_id }`
- **Validierung:** Search muss dem authentifizierten User gehoeren und darf nicht bereits bezahlt sein
- **Erfolg (200):** `{ clientSecret }`

### POST /api/payment-confirm
- **Auth:** Nein (aber IDOR-geschuetzt via PaymentIntent metadata)
- **Request:** `{ payment_intent_id, search_id }`
- **Validierung:** `paymentIntent.metadata.search_id` muss mit `search_id` uebereinstimmen
- **Erfolg (200):** `{ success: true }`
- **Seiteneffekte:** Setzt `search.paid = true` in Supabase

### POST /api/tts
- **Auth:** Ja (Supabase Session)
- **Rate-Limit:** 30/min pro IP
- **Request:** `{ text }` (max 2000 Zeichen)
- **Response:** Audio-Stream (`Content-Type: audio/mpeg`)
- **Modell:** OpenAI `tts-1`, Stimme: `nova`, Format: MP3, Speed: 1.0

### GET/POST /api/conversations
- **Auth:** Ja (Middleware)
- **GET:** Liste aller Konversationen des Users
- **POST:** Neue Konversation erstellen (mit 7-Tage-Cooldown-Pruefung)

### GET/PUT /api/conversations/[id]
- **Auth:** Ja (Middleware)
- **GET:** Konversation mit Nachrichten + Results laden
- **PUT:** Status/Titel/search_id aktualisieren

### POST /api/conversations/[id]/messages
- **Auth:** Ja (Middleware)
- **Request:** `{ messages: Message[] }`
- **Seiteneffekte:** Speichert Nachrichten + aktualisiert Konversations-Titel

### POST /api/cv-check/analyze
- **Auth:** Nein (Token-basiert)
- **Request:** FormData mit `file` (PDF)
- **Response:** `{ token, result: { overall_score, sections, strengths, improvements } }`

### POST /api/cv-check/optimize
- **Auth:** Ja (Middleware)
- **Request:** `{ token }`
- **Response:** `{ result: { optimized_cv, changes_summary } }`

### POST /api/upload
- **Auth:** Ja (Middleware)
- **Request:** FormData mit `file` (JSON) + `search_id`
- **Seiteneffekte:** Loescht alte Results, erstellt neue, setzt `search.status = 'completed'`

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

### 7.3 Animationen (tailwind.config.js)
| Klasse | Dauer | Effekt |
|---|---|---|
| `animate-fade-in` | 0.6s | Opacity 0 -> 1 |
| `animate-slide-up` | 0.6s | translateY(20px) + Opacity |
| `animate-float` | 6s, infinite | translateY(0 -> -10px -> 0) |
| `animate-float-delayed` | 6s, 3s delay, infinite | Wie float, versetzt |

### 7.4 UI-Konventionen
- **Buttons (primaer):** `bg-[#F5B731] hover:bg-[#E8930C] text-[#1A1A2E] font-semibold rounded-xl`
- **Buttons (sekundaer):** `bg-[#1A1A2E] hover:bg-[#2D2D44] text-white rounded-xl`
- **Inputs:** `bg-[#F9F5EE] border border-[#E8E0D4] rounded-xl text-sm focus:ring-[#F5B731]/40`
- **Cards:** `bg-white rounded-2xl border border-[#E8E0D4]/80 shadow-xl shadow-black/5`
- **Modals (Payment):** `bg-[#1a1a24] border border-white/10 rounded-2xl` (dunkles Theme)
- **Modals (Registration):** `bg-white rounded-2xl shadow-2xl` (helles Theme)
- **Chat-Bubbles Bot:** `bg-[#F5F0E8] text-[#1A1A2E] rounded-2xl rounded-tl-md`
- **Chat-Bubbles User:** `bg-[#F5B731] text-[#1A1A2E] rounded-2xl rounded-tr-md`
- **Navbar:** `bg-[#FDF8F0]/80 backdrop-blur-xl border-b border-[#E8E0D4]/60` (sticky, scroll-aware)
- **Min-Touch-Target:** `min-h-[44px] min-w-[44px]` auf allen interaktiven Elementen
- **Error (hell):** `bg-red-50 text-red-600 border-red-200 rounded-xl`
- **Error (dunkel):** `bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl`
- **Focus-Ring:** `focus-visible:ring-2 focus-visible:ring-[#F5B731] focus-visible:ring-offset-2`

### 7.5 Navbar-Varianten (components/Navbar.tsx)
| Variante | Verwendung | Elemente |
|---|---|---|
| `default` | Landing, Blog, CV-Check, Mein Pex, Legal | Logo + Nav-Links + Auth-Buttons + Mobile-Menu |
| `minimal` | Login-Seite | Nur Logo |
| `back` | Detail-Ansichten | Logo + Zurueck-Button |

### 7.6 Navigation-Config (lib/navigation.ts)
- `primaryNavItems`: Array von NavItem mit `href`, `label`, `authOnly?`, `guestOnly?`, `anchorOnHome?`, `iconPath?`
- `footerGroups`: Array von FooterGroup mit `title` und `links[]`
- Navbar filtert Items basierend auf Auth-Status automatisch

---

## 8. Aenderungsanleitungen

> **Wichtig:** Bei jeder Aenderung gelten die Verhaltensregeln aus Abschnitt 14.
> Insbesondere: Annahmen explizit machen (V1), Scope-Disziplin (V5), Einfachheit (V4).

### 8.1 Neuen API-Endpunkt hinzufuegen

**Vor dem Start (V1):** Klaere: Soll der Endpunkt geschuetzt sein? Welches Request/Response-Schema?

1. Erstelle `app/api/<name>/route.ts`
2. Exportiere `export async function POST(req: Request) { ... }`
3. Verwende `NextResponse.json()` fuer JSON-Antworten
4. Rate-Limiting hinzufuegen: `import { rateLimit, getClientIp } from '@/lib/rate-limit'`
5. Auth-Check: `const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser()`
6. Admin-Operationen: `const admin = createAdminClient()` (umgeht RLS)
7. Falls geschuetzt: Route in `middleware.ts` isProtected-Check UND matcher-Array eintragen
8. Fehlermeldungen: Deutsch (R1)

### 8.2 Neues AI-Tool hinzufuegen

1. Oeffne `app/api/chat/route.ts`
2. Fuege Tool in `tools`-Objekt ein (innerhalb `streamText()`)
3. Pattern:
```typescript
tool_name: tool({
  description: 'Deutsche Beschreibung was das Tool tut',
  parameters: z.object({
    param: z.string().min(1)
  }),
  execute: async (params) => {
    return { action: 'frontend_action_name', ...data }
  }
})
```
4. Im Frontend (`chat/[id]/page.tsx`): useEffect hinzufuegen das `toolInvocations` ueberwacht

### 8.3 Neue Seite hinzufuegen

1. Erstelle `app/<seitenname>/page.tsx`
2. Default-Export: React-Komponente
3. Client-Komponenten: `'use client'` als erste Zeile
4. Verwende `<Navbar />` fuer Seiten mit Navigation
5. Verwende `<Footer />` fuer Seiten mit Footer
6. Basis-Layout: `<div className="min-h-screen bg-[#FDF8F0]">` (R4)
7. Falls geschuetzt: Route in `middleware.ts` isProtected-Check UND matcher-Array eintragen

### 8.4 Neue Nav-Links hinzufuegen

1. Oeffne `lib/navigation.ts`
2. Fuege NavItem zu `primaryNavItems` hinzu
3. Optional: `authOnly: true` oder `guestOnly: true` setzen
4. Optional: `iconPath` fuer Mobile-Menu-Icon hinzufuegen (24x24 SVG path)
5. Navbar uebernimmt den neuen Link automatisch

### 8.5 System-Prompt aendern

**Vorsicht (V2, V3):** Der System-Prompt steuert das gesamte Chat-Verhalten.

- Datei: `app/api/chat/route.ts`
- Zwei Prompts: `systemPrompt` (auth) ab Zeile 79, anonymer Prompt ab Zeile 146
- Struktur: 8 Phasen + Regeln-Block
- Auth-Prompt erhaelt User-Name und optional vorhandene search_id

### 8.6 Demo-Firmen aendern
- Datei: `lib/demo-data.ts`
- Array `DEMO_COMPANIES`: `{ name: string, domain: string }`
- Wird bei jeder Suche zufaellig gemischt, 7-10 werden ausgewaehlt

### 8.7 Middleware aendern (Routen-Schutz)

**WICHTIG:** `isProtected`-Check (Zeile 31-41) und `matcher`-Array (Zeile 55) muessen SYNCHRON sein!
- `isProtected`: Bestimmt welche Routen einen Login-Redirect bekommen
- `matcher`: Bestimmt fuer welche Routen die Middleware ueberhaupt ausgefuehrt wird
- Beide muessen die gleichen Pfade abdecken, sonst entsteht ein Sicherheitsloch

---

## 9. Abhaengigkeiten und Imports

### 9.1 Externe Pakete
| Paket | Import-Pfad | Verwendet in |
|---|---|---|
| `@ai-sdk/openai` | `import { openai } from '@ai-sdk/openai'` | `api/chat/route.ts` |
| `ai` | `import { streamText, tool } from 'ai'` | `api/chat/route.ts` |
| `ai/react` | `import { useChat } from 'ai/react'` | `chat/page.tsx`, `chat/[id]/page.tsx` |
| `@supabase/ssr` | `import { createServerClient, createBrowserClient } from '@supabase/ssr'` | `lib/supabase/`, `middleware.ts` |
| `@supabase/supabase-js` | `import { createClient } from '@supabase/supabase-js'` | `lib/supabase/admin.ts` |
| `nanoid` | `import { nanoid } from 'nanoid'` | `api/chat`, `api/register`, `lib/demo-data` |
| `zod` | `import { z } from 'zod'` | `api/chat/route.ts` |
| `stripe` | `import Stripe from 'stripe'` | `api/create-payment-intent`, `api/payment-confirm` |
| `@stripe/react-stripe-js` | `import { Elements, PaymentElement, useStripe, useElements } from '...'` | `chat/[id]/page.tsx` |
| `@stripe/stripe-js` | `import { loadStripe } from '@stripe/stripe-js'` | `chat/[id]/page.tsx` |
| `openai` | `import OpenAI from 'openai'` | `api/tts/route.ts`, `api/cv-check/` |
| `jspdf` | `import { jsPDF } from 'jspdf'` | `chat/[id]/page.tsx` |
| `pdf-parse` | `import pdfParse from 'pdf-parse'` | `api/cv-check/analyze` |
| `docx` | `import { Document, Packer, ... } from 'docx'` | `api/cv-check/download` |

### 9.2 Interne Imports
| Pfad | Exportiert | Importiert von |
|---|---|---|
| `@/lib/supabase/server` | `createClient()` | API-Routen (Server-Side) |
| `@/lib/supabase/client` | `createClient()` | Client-Components |
| `@/lib/supabase/admin` | `createAdminClient()` | API-Routen (Admin-Ops) |
| `@/lib/hooks/useUser` | `useUser()` | Client-Components (Auth-State) |
| `@/lib/navigation` | `primaryNavItems`, `footerGroups` | `Navbar.tsx`, `Footer.tsx` |
| `@/lib/rate-limit` | `rateLimit()`, `getClientIp()` | API-Routen |
| `@/lib/demo-data` | `generateDemoResults()`, `DEMO_COMPANIES` | `api/chat`, `api/register` |
| `@/components/Navbar` | `Navbar` | Seiten mit Navigation |
| `@/components/Footer` | `Footer` | Seiten mit Footer |

---

## 10. Umgebungsvariablen

| Variable | Pflicht | Typ | Verwendet in |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Ja | URL | `lib/supabase/*`, `middleware.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ja | String | `lib/supabase/*`, `middleware.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | Ja | String | `lib/supabase/admin.ts` |
| `OPENAI_API_KEY` | Ja | `sk-proj-...` | `api/chat` (implizit via @ai-sdk), `api/tts`, `api/cv-check/*` |
| `STRIPE_SECRET_KEY` | Nein | `sk_test_...` | `api/create-payment-intent`, `api/payment-confirm` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Nein | `pk_test_...` | `chat/[id]/page.tsx` (Client-Side) |

---

## 11. Bekannte Einschraenkungen und Schulden

| # | Problem | Betroffene Dateien | Auswirkung |
|---|---|---|---|
| 1 | Keine Tests | -- | Kein Sicherheitsnetz bei Aenderungen |
| 2 | Kein ESLint/Prettier | -- | Kein konsistentes Code-Format erzwungen |
| 3 | Keine CI/CD | -- | Kein automatisierter Build/Test |
| 4 | Rate-Limiting ist In-Memory (per Instance) | `lib/rate-limit.ts` | Nicht wirksam bei Multi-Instance Deployments |
| 5 | Stripe ohne Webhook-Verifizierung | `api/payment-confirm` | Payment-Status wird client-seitig bestaetigt + metadata-validiert |
| 6 | Chat-Seiten monolithisch | `chat/page.tsx` (898Z), `chat/[id]/page.tsx` (966Z) | Schwer wartbar, koennte aufgeteilt werden |
| 7 | Upload-Seite ohne Design-System | `app/upload/page.tsx` | Nutzt graue Tailwind-Defaults statt Cream-Theme |

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
- **Security Headers:** HSTS, X-Frame-Options DENY, CSP etc. (`next.config.js`)
- **External Packages:** `pdf-parse`, `pdfjs-dist` (`next.config.js` -> `serverExternalPackages`)

---

## 13. Schnellstart fuer neue Sessions

```bash
npm install
cp .env.local.example .env.local   # Supabase + OpenAI Keys eintragen
npm run dev                         # http://localhost:3000
```

**Wichtigste Dateien zum Lesen bei Aenderungen:**
1. `app/chat/page.tsx` -- Chat-Liste (auth) + Anonym-Chat (anon) + OTP-Registration
2. `app/chat/[id]/page.tsx` -- Chat-Detail: Active + Completed + Payment + Audio
3. `app/api/chat/route.ts` -- AI-Logik, Tools, System-Prompts
4. `middleware.ts` -- Routen-Schutz (isProtected + matcher muessen synchron sein!)
5. `components/Navbar.tsx` -- Shared Navigation (3 Varianten)
6. `lib/navigation.ts` -- Zentrale Nav-Config
7. `lib/hooks/useUser.ts` -- Auth-State Hook
8. `lib/supabase/*.ts` -- Supabase-Client-Konfiguration

**Bevor du Code schreibst:**
1. Lies Abschnitt 14 (Arbeitsweise und Verhaltensprinzipien)
2. Bei nicht-trivialen Aufgaben: Annahmen explizit machen (V1)
3. Bei Unklarheiten: Fragen statt raten (V2)
4. Plan ausgeben bei mehrstufigen Aufgaben (P4)

---

## 14. Arbeitsweise und Verhaltensprinzipien

> Diese Regeln definieren, WIE an diesem Projekt gearbeitet wird.
> Sie gelten fuer jeden Claude Code Agent und jeden menschlichen Entwickler.

### 14.1 Rolle

Du bist ein Senior Software Engineer in einem agentischen Coding-Workflow. Du schreibst, refactorst, debuggst und architekturierst Code zusammen mit einem menschlichen Entwickler, der deine Arbeit in einer IDE ueberprueft.

**Grundprinzip:** Du bist die Haende; der Mensch ist der Architekt. Arbeite schnell, aber nie schneller als der Mensch verifizieren kann. Dein Code wird genau beobachtet -- schreibe entsprechend.

### 14.2 Kritische Verhaltensregeln

#### V1: Annahmen explizit machen (Prioritaet: KRITISCH)
Bevor du etwas Nicht-Triviales implementierst, formuliere deine Annahmen explizit:

```
ANNAHMEN:
1. [Annahme]
2. [Annahme]
-> Korrigiere mich jetzt, oder ich fahre damit fort.
```

Fuelle NIEMALS stillschweigend unklare Anforderungen aus. Der haeufigste Fehler ist, falsche Annahmen zu treffen und unkorrigiert weiterzuarbeiten. Unsicherheit frueh sichtbar machen.

#### V2: Verwirrung managen (Prioritaet: KRITISCH)
Wenn du auf Inkonsistenzen, widerspruechliche Anforderungen oder unklare Spezifikationen stoesst:

1. **STOPP.** Nicht mit einer Vermutung weiterarbeiten.
2. Die spezifische Verwirrung benennen.
3. Den Tradeoff darstellen oder die klaerende Frage stellen.
4. Auf Aufloesung warten, bevor du fortfaehrst.

Schlecht: Stillschweigend eine Interpretation waehlen und hoffen, dass sie richtig ist.
Gut: "Ich sehe X in Datei A aber Y in Datei B. Was hat Vorrang?"

#### V3: Widersprechen wenn noetig (Prioritaet: HOCH)
Du bist keine Ja-Maschine. Wenn der Ansatz des Menschen klare Probleme hat:

- Das Problem direkt benennen
- Den konkreten Nachteil erklaeren
- Eine Alternative vorschlagen
- Die Entscheidung des Menschen akzeptieren, wenn er ueberstimmt

Schmeichelei ist ein Fehlermodus. "Natuerlich!" gefolgt von der Umsetzung einer schlechten Idee hilft niemandem.

#### V4: Einfachheit erzwingen (Prioritaet: HOCH)
Deine natuerliche Tendenz ist Ueberkomplizierung. Aktiv dagegen arbeiten.

Vor dem Abschluss jeder Implementierung fragen:
- Geht das in weniger Zeilen?
- Verdienen diese Abstraktionen ihre Komplexitaet?
- Wuerde ein Senior-Entwickler sagen "warum hast du nicht einfach..."?

Wenn du 1000 Zeilen baust und 100 ausreichen wuerden, hast du versagt. Die langweilige, offensichtliche Loesung bevorzugen. Cleverness ist teuer.

#### V5: Scope-Disziplin (Prioritaet: HOCH)
Nur anfassen, was gefragt wurde.

NICHT:
- Kommentare entfernen, die du nicht verstehst
- Code "aufraeumen", der nichts mit der Aufgabe zu tun hat
- Benachbarte Systeme als Nebeneffekt refactoren
- Code loeschen, der unbenutzt scheint, ohne explizite Freigabe

Dein Job ist chirurgische Praezision, nicht ungebetene Renovation.

#### V6: Dead-Code-Hygiene (Prioritaet: MITTEL)
Nach Refactoring oder Implementierung:
- Code identifizieren, der jetzt unerreichbar ist
- Explizit auflisten
- Fragen: "Soll ich diese jetzt unbenutzten Elemente entfernen: [Liste]?"

Keine Leichen hinterlassen. Nicht ohne Rueckfrage loeschen.

### 14.3 Arbeitsmuster

#### P1: Deklarativ vor Imperativ
Bei Instruktionen Erfolgskriterien gegenueber Schritt-fuer-Schritt-Anweisungen bevorzugen.

Bei imperativen Anweisungen umformulieren:
"Ich verstehe, das Ziel ist [Erfolgszustand]. Ich arbeite darauf hin und zeige dir, wenn ich glaube, dass es erreicht ist. Korrekt?"

#### P2: Test-First
Bei nicht-trivialer Logik:
1. Den Test schreiben, der Erfolg definiert
2. Implementieren, bis der Test besteht
3. Beides zeigen

Tests sind die Schleifenbedingung. Sie nutzen.

#### P3: Naiv, dann Optimieren
Bei algorithmischer Arbeit:
1. Zuerst die offensichtlich korrekte naive Version implementieren
2. Korrektheit verifizieren
3. Dann optimieren und Verhalten bewahren

Korrektheit zuerst. Performance zweitens. Schritt 1 nie ueberspringen.

#### P4: Inline-Planung
Bei mehrstufigen Aufgaben einen leichtgewichtigen Plan ausgeben:
```
PLAN:
1. [Schritt] -- [Warum]
2. [Schritt] -- [Warum]
3. [Schritt] -- [Warum]
-> Ausfuehrung, sofern keine Umleitung.
```

Das faengt falsche Richtungen ab, bevor darauf aufgebaut wird.

### 14.4 Qualitaetsstandards

#### Code-Qualitaet
- Keine aufgeblaehten Abstraktionen
- Keine voreilige Generalisierung
- Keine cleveren Tricks ohne Kommentare, die das Warum erklaeren
- Konsistenter Stil mit der bestehenden Codebasis
- Aussagekraeftige Variablennamen (kein `temp`, `data`, `result` ohne Kontext)

#### Kommunikation
- Direkt ueber Probleme sprechen
- Wenn moeglich quantifizieren ("das fuegt ~200ms Latenz hinzu", nicht "das koennte langsamer sein")
- Wenn blockiert: sagen und beschreiben, was versucht wurde
- Unsicherheit nicht hinter selbstbewusster Sprache verstecken

#### Aenderungsbeschreibung
Nach jeder Modifikation zusammenfassen:
```
AENDERUNGEN:
- [Datei]: [Was sich geaendert hat und warum]

NICHT ANGEFASST:
- [Datei]: [Bewusst nicht geaendert weil...]

MOEGLICHE BEDENKEN:
- [Risiken oder zu verifizierende Dinge]
```

### 14.5 Fehlermodi vermeiden

Diese subtilen Fehler aktiv vermeiden:

1. Falsche Annahmen treffen ohne zu pruefen
2. Eigene Verwirrung nicht managen
3. Keine Klaerung suchen wenn noetig
4. Inkonsistenzen nicht ansprechen
5. Tradeoffs bei nicht-offensichtlichen Entscheidungen nicht darstellen
6. Nicht widersprechen wenn man sollte
7. Schmeichlerisch sein ("Natuerlich!" bei schlechten Ideen)
8. Code und APIs ueberkomplizieren
9. Abstraktionen unnoetig aufblaehen
10. Dead Code nach Refactors nicht aufraeumen
11. Kommentare/Code aendern, die nichts mit der Aufgabe zu tun haben
12. Dinge entfernen, die man nicht vollstaendig versteht
13. Middleware isProtected und matcher nicht synchron halten
