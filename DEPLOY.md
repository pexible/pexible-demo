# Deployment zu Vercel

## Voraussetzungen

- GitHub-Repository mit dem Quellcode
- Vercel-Account (kostenlos: https://vercel.com)
- Umgebungsvariablen bereit (siehe unten, Details in [CLAUDE.md](./CLAUDE.md#10-umgebungsvariablen))

---

## Option 1: Via Vercel Website (empfohlen)

### 1. Code zu GitHub pushen

Falls noch nicht geschehen:
```bash
git init
git add .
git commit -m "Initial pexible demo"
gh repo create pexible-demo --public --source=. --push
```

### 2. Vercel verbinden

1. Gehe zu: https://vercel.com/new
2. "Import Git Repository"
3. Waehle das `pexible-demo` Repository
4. Klicke "Import"

### 3. Environment Variables setzen

Im "Environment Variables"-Bereich diese Werte eintragen:

| Variable | Wert | Pflicht |
|---|---|---|
| `OPENAI_API_KEY` | `sk-proj-...` | Ja |
| `NEXTAUTH_SECRET` | Generiere mit `openssl rand -base64 32` | Ja |
| `NEXTAUTH_URL` | `https://dein-projekt.vercel.app` | Ja |
| `DEMO_PASSWORD` | `pexible2025` (oder eigenes) | Ja |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Nein |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Nein |

> **Wichtig:** `NEXTAUTH_URL` muss die endgueltige Vercel-URL sein (wird nach erstem Deploy angezeigt).
> Beim ersten Deploy kannst du sie weglassen und nach dem Deploy nachtragen.

### 4. Deploy

Klicke "Deploy" -- fertig!

---

## Option 2: Via Vercel CLI

```bash
# CLI installieren
npm i -g vercel

# Login
vercel login

# Deploy (Preview)
vercel

# Environment Variables setzen
vercel env add OPENAI_API_KEY
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add DEMO_PASSWORD

# Produktions-Deploy
vercel --prod
```

---

## Nach dem Deploy

### Live-URL
Deine App ist erreichbar unter: `https://pexible-demo-XXXX.vercel.app`

### Storage-Hinweis
Auf Vercel laeuft die App serverless. Der datei-basierte JSON-Storage nutzt `/tmp/pexible-data/`, das bei jedem Cold Start zurueckgesetzt wird. Das bedeutet:
- Registrierte Nutzer und Suchergebnisse sind **nicht persistent**
- Fuer eine Demo ist das ausreichend
- Fuer Produktion: PostgreSQL/Supabase als Datenbank einsetzen

### Konfiguration
- `vercel.json` ist bereits konfiguriert (Framework: Next.js)
- `next.config.js` erlaubt bis zu 10MB Upload-Body
- Chat-API hat ein Timeout von 30 Sekunden (`maxDuration: 30`)

---

## Troubleshooting Deployment

| Problem | Loesung |
|---|---|
| Build-Fehler | `npm run build` lokal testen |
| "NEXTAUTH_URL mismatch" | URL im Vercel-Dashboard auf die echte Domain setzen |
| Chat-Timeout | Vercel Free Plan: max 10s Funktionslaufzeit. Pro Plan fuer 30s noetig |
| Daten verschwinden | Erwartet -- serverless Storage ist ephemeral |
