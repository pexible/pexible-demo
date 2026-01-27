import fs from 'fs/promises'
import path from 'path'

// Always use cwd/data - this is the primary and only data directory
// This ensures consistency across all API routes and server restarts
const DATA_DIR = path.join(process.cwd(), 'data')

async function ensureDataDir(): Promise<string> {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
  return DATA_DIR
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
