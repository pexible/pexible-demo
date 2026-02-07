// Temporary in-memory store for CV text tokens.
// Tokens are short-lived (10 min TTL) and reference anonymized CV text
// so users don't need to re-upload after purchasing optimization.
//
// Note: This is per-instance only. For distributed deployments, use Redis.

interface TokenEntry {
  anonymizedText: string
  originalContactData: {
    name: string | null
    email: string | null
    phone: string | null
    address: string | null
  }
  createdAt: number
}

const TOKEN_TTL_MS = 60 * 60 * 1000 // 60 minutes
const store = new Map<string, TokenEntry>()

let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < 30_000) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now - entry.createdAt > TOKEN_TTL_MS) {
      store.delete(key)
    }
  }
}

export function storeToken(
  token: string,
  anonymizedText: string,
  originalContactData: TokenEntry['originalContactData']
): void {
  cleanup()
  store.set(token, {
    anonymizedText,
    originalContactData,
    createdAt: Date.now(),
  })
}

export function retrieveToken(token: string): TokenEntry | null {
  cleanup()
  const entry = store.get(token)
  if (!entry) return null
  if (Date.now() - entry.createdAt > TOKEN_TTL_MS) {
    store.delete(token)
    return null
  }
  return entry
}

export function deleteToken(token: string): void {
  store.delete(token)
}
