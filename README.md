# pexible Demo - Setup Guide

## Vollständige AI Job-Makler Demo

Diese Demo zeigt den kompletten User Flow von pexible:
- ✅ Passwortgeschützte Website
- ✅ Konversationaler Chat-Agent (OpenAI GPT-4)
- ✅ Account-Erstellung im Chat
- ✅ Freemium-Modell (3 von 12 Treffer)
- ✅ Payment-Simulation
- ✅ Backend-Upload für Ergebnisse

---

## Setup (10 Minuten)

### 1. Repository klonen
```bash
cd /home/claude/pexible-demo
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Environment Variables
```bash
cp .env.local.example .env.local
```

Bearbeite `.env.local`:
```env
# OpenAI API Key (ERFORDERLICH)
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE

# NextAuth (ERFORDERLICH)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

# Demo-Passwort
DEMO_PASSWORD=pexible2025

# Stripe (optional für Demo)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Wichtig:** Nur `OPENAI_API_KEY` ist wirklich erforderlich!

### 4. Starten
```bash
npm run dev
```

➜ Öffne: http://localhost:3000

---

## Demo-Ablauf

### Schritt 1: Login
- URL: http://localhost:3000
- Passwort: `pexible2025`

### Schritt 2: Chat starten
- URL: http://localhost:3000/chat
- Der AI-Agent beginnt automatisch das Gespräch
- Beantworte die Fragen:
  - Welche Stelle? → "Controller im Krankenhaus"
  - PLZ? → "04416"
  - Vorname? → "Max"
  - Email? → "max@test.de"
  - Passwort? → "test1234"

### Schritt 3: Account wird erstellt
- Agent bestätigt Account-Erstellung
- Du erhältst eine `search_id` (z.B. "abc123xyz")
- **Notiere diese ID!**

### Schritt 4: Ergebnisse hochladen (Admin)
- URL: http://localhost:3000/upload
- Search ID eingeben: `abc123xyz`
- Datei wählen: `example-results.json`
- Upload klicken

### Schritt 5: Zurück zum Chat
- Frage im Chat: "Gibt es schon Ergebnisse?"
- Agent zeigt 3 Freemium-Treffer
- 9 weitere sind "locked"

### Schritt 6: Upgrade
- Sage im Chat: "Ja, zeig mir alle Treffer"
- Agent simuliert Zahlung (Demo-Modus)
- Alle 12 Ergebnisse werden angezeigt

---

## Dateistruktur erklärt

### JSON Storage (statt Datenbank)
```
data/
├── users.json       # Alle registrierten User
├── searches.json    # Alle Job-Suchen
└── results.json     # Alle Ergebnisse
```

### API Routes
```
/api/chat           # Chat mit OpenAI + Function Calling
/api/upload         # Backend-Upload für Ergebnisse
/api/auth/[...]     # NextAuth Password Protection
```

### Pages
```
/login             # Password Gate
/chat              # Hauptchat-Interface
/upload            # Admin Upload Interface
```

---

## Deployment zu Vercel

### 1. Vercel CLI installieren
```bash
npm i -g vercel
```

### 2. Deploy
```bash
vercel
```

### 3. Environment Variables setzen
```bash
vercel env add OPENAI_API_KEY
vercel env add NEXTAUTH_SECRET
vercel env add DEMO_PASSWORD
```

### 4. Production Deploy
```bash
vercel --prod
```

➜ Live URL: https://pexible-demo.vercel.app

---

## Eigene Results JSON erstellen

Format:
```json
[
  {
    "company_name": "Firma XY",
    "job_title": "Position",
    "job_url": "https://...",
    "description": "Details"
  }
]
```

Nutze `example-results.json` als Vorlage.

---

## Troubleshooting

**"OpenAI API error"**
→ Prüfe `OPENAI_API_KEY` in `.env.local`

**"Session expired"**
→ Logout: http://localhost:3000/api/auth/signout

**"Results not found"**
→ Prüfe ob `search_id` korrekt ist
→ Prüfe ob Upload erfolgreich war

**Chat antwortet nicht**
→ Prüfe Browser Console (F12)
→ Prüfe Terminal für Backend-Errors

---

## Production Checklist

Bevor du live gehst:

- [ ] Echte Datenbank (PostgreSQL/Supabase)
- [ ] Echtes Stripe Payment (nicht simuliert)
- [ ] Email-Versand (SendGrid/Resend)
- [ ] Rate Limiting (Upstash/Redis)
- [ ] Monitoring (Sentry)
- [ ] Analytics (PostHog/Plausible)
- [ ] DSGVO-Konformes Cookie Banner
- [ ] Impressum + Datenschutz

---

## Nächste Schritte

1. **Demo testen** mit `npm run dev`
2. **Eigene Results** hochladen
3. **UI anpassen** (Logo, Farben in `app/chat/page.tsx`)
4. **Echten Crawler** integrieren (replace simulate upload)
5. **Payment** mit echtem Stripe

---

## Support

Fragen? Erstelle ein Issue oder kontaktiere timm.schindler@pexible.ai
