// CV text token store backed by Supabase.
// Tokens link the free analysis (Stufe 1) to the paid optimization (Stufe 2)
// without requiring re-upload. Uses the admin client (bypasses RLS).
//
// Requires the cv_tokens table — see lib/cv-check-migration.sql.

import { createAdminClient } from '@/lib/supabase/admin'

interface ContactData {
  name: string | null
  email: string | null
  phone: string | null
  address: string | null
}

export interface TokenEntry {
  anonymizedText: string
  originalContactData: ContactData
  createdAt: number
}

const TOKEN_TTL_MS = 60 * 60 * 1000 // 60 minutes

export async function storeToken(
  token: string,
  anonymizedText: string,
  originalContactData: ContactData
): Promise<void> {
  const supabase = createAdminClient()
  await supabase.from('cv_tokens').upsert({
    token,
    anonymized_text: anonymizedText,
    contact_data: originalContactData,
    created_at: new Date().toISOString(),
  })
}

export async function retrieveToken(token: string): Promise<TokenEntry | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('cv_tokens')
    .select('anonymized_text, contact_data, created_at')
    .eq('token', token)
    .single()

  if (!data) return null

  const createdAt = new Date(data.created_at).getTime()
  if (Date.now() - createdAt > TOKEN_TTL_MS) {
    await supabase.from('cv_tokens').delete().eq('token', token)
    return null
  }

  return {
    anonymizedText: data.anonymized_text,
    originalContactData: data.contact_data as ContactData,
    createdAt,
  }
}

export async function deleteToken(token: string): Promise<void> {
  const supabase = createAdminClient()
  await supabase.from('cv_tokens').delete().eq('token', token)
}
