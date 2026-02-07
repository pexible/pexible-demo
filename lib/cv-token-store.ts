// Temporary in-memory store for CV text tokens.
// Tokens are stored on globalThis to survive Next.js HMR and module re-evaluation
// across different API routes (analyze stores, create-checkout retrieves).
//
// Note: This is per-process only. For distributed deployments, use Redis.

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

// Use globalThis to ensure a single Map instance shared across all API routes
// and surviving Next.js hot module replacement in dev
const globalStore = globalThis as unknown as { __cvTokenStore?: Map<string, TokenEntry>; __cvTokenLastCleanup?: number }
if (!globalStore.__cvTokenStore) {
  globalStore.__cvTokenStore = new Map()
}
if (!globalStore.__cvTokenLastCleanup) {
  globalStore.__cvTokenLastCleanup = Date.now()
}

const store = globalStore.__cvTokenStore

function cleanup() {
  const now = Date.now()
  if (now - (globalStore.__cvTokenLastCleanup ?? 0) < 30_000) return
  globalStore.__cvTokenLastCleanup = now
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
