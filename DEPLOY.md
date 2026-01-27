# Deploy zu Vercel - Schritt für Schritt

## Option 1: Via Vercel Website (Einfachste Methode)

### 1. Code zu GitHub pushen
```bash
cd /home/claude/pexible-demo
git init
git add .
git commit -m "Initial pexible demo"
gh repo create pexible-demo --public --source=. --push
```

### 2. Vercel verbinden
1. Gehe zu: https://vercel.com/new
2. "Import Git Repository"
3. Wähle `pexible-demo` Repository
4. Click "Import"

### 3. Environment Variables setzen
Bei "Environment Variables" eintragen:

```
OPENAI_API_KEY = sk-proj-YOUR-KEY
NEXTAUTH_SECRET = [Generiere mit: openssl rand -base64 32]
NEXTAUTH_URL = https://your-project.vercel.app
DEMO_PASSWORD = pexible2025
```

### 4. Deploy
Click "Deploy" → Fertig!

---

## Option 2: Via Vercel CLI

```bash
# CLI installieren
npm i -g vercel

# Login
vercel login

# Deploy
cd /home/claude/pexible-demo
vercel

# Environment Variables
vercel env add OPENAI_API_KEY
vercel env add NEXTAUTH_SECRET
vercel env add DEMO_PASSWORD

# Production
vercel --prod
```

---

## Deine Live-URL
Nach Deploy: `https://pexible-demo-XXXX.vercel.app`

Teile diese URL mit anderen!
