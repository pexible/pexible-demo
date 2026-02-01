import fs from 'fs/promises'
import path from 'path'

// Detect Vercel/serverless environment where filesystem is read-only
// On Vercel, process.cwd() returns /var/task which is read-only
// Only /tmp is writable in serverless environments
function isServerless(): boolean {
  return process.env.VERCEL === '1' || process.cwd().startsWith('/var/task')
}

// Get the appropriate data directory - NO CACHING to ensure consistency
// across all API routes and Lambda invocations
function getDataDir(): string {
  if (isServerless()) {
    return '/tmp/pexible-data'
  }
  return path.join(process.cwd(), 'data')
}

async function ensureDataDir(): Promise<string> {
  const dir = getDataDir()
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
  return dir
}

export async function readJSON<T>(filename: string, defaultValue: T): Promise<T> {
  try {
    const dir = await ensureDataDir()
    const filePath = path.join(dir, filename)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    // File doesn't exist or is invalid, return default
    return defaultValue
  }
}

export async function writeJSON<T>(filename: string, data: T): Promise<void> {
  const dir = await ensureDataDir()
  const filePath = path.join(dir, filename)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export type User = {
  id: string
  email: string
  password_hash: string
  first_name: string
  created_at: string
}

export type Search = {
  id: string
  user_id: string
  job_title: string
  postal_code: string
  status: 'pending' | 'completed'
  paid: boolean
  total_results: number
  created_at: string
}

export type Result = {
  id: string
  search_id: string
  company_name: string
  job_title: string
  job_url: string
  description: string
  rank: number
}

export async function getUsers(): Promise<{ users: User[] }> {
  return readJSON('users.json', { users: [] })
}

export async function saveUsers(data: { users: User[] }): Promise<void> {
  return writeJSON('users.json', data)
}

export async function getSearches(): Promise<{ searches: Search[] }> {
  return readJSON('searches.json', { searches: [] })
}

export async function saveSearches(data: { searches: Search[] }): Promise<void> {
  return writeJSON('searches.json', data)
}

export async function getResults(): Promise<{ results: Result[] }> {
  return readJSON('results.json', { results: [] })
}

export async function saveResults(data: { results: Result[] }): Promise<void> {
  return writeJSON('results.json', data)
}

// Conversation persistence for chat history
export type ConversationMessage = {
  id: string
  role: string
  content: string
  toolInvocations?: Array<{
    toolCallId: string
    toolName: string
    args: Record<string, unknown>
    state: string
    result?: unknown
  }>
}

export type Conversation = {
  id: string
  user_id: string
  title: string
  status: 'active' | 'completed'
  search_id?: string
  messages: ConversationMessage[]
  created_at: string
  updated_at: string
}

export async function getConversations(): Promise<{ conversations: Conversation[] }> {
  return readJSON('conversations.json', { conversations: [] })
}

export async function saveConversations(data: { conversations: Conversation[] }): Promise<void> {
  return writeJSON('conversations.json', data)
}
