import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

export async function readJSON<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename)
  const data = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(data)
}

export async function writeJSON<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename)
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
  return readJSON('users.json')
}

export async function saveUsers(data: { users: User[] }): Promise<void> {
  return writeJSON('users.json', data)
}

export async function getSearches(): Promise<{ searches: Search[] }> {
  return readJSON('searches.json')
}

export async function saveSearches(data: { searches: Search[] }): Promise<void> {
  return writeJSON('searches.json', data)
}

export async function getResults(): Promise<{ results: Result[] }> {
  return readJSON('results.json')
}

export async function saveResults(data: { results: Result[] }): Promise<void> {
  return writeJSON('results.json', data)
}
