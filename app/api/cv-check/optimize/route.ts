import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import Anthropic from '@anthropic-ai/sdk'
import { nanoid } from 'nanoid'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { retrieveToken, deleteToken } from '@/lib/cv-token-store'
import { reinsertContactData } from '@/lib/cv-anonymize'
import { CV_OPTIMIZATION_SYSTEM_PROMPT, CV_ANALYSIS_SYSTEM_PROMPT } from '@/lib/cv-prompts'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const maxDuration = 60 // Allow up to 60 seconds for this route

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const { limited } = rateLimit(`cv-optimize:${ip}`, 3, 60_000)
  if (limited) {
    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte warte kurz.' },
      { status: 429 }
    )
  }

  // Require authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 })
  }

  try {
    const { payment_intent_id, cv_text_token, original_score_data, tips } = await req.json()

    // Validate required fields
    if (!payment_intent_id || !cv_text_token) {
      return NextResponse.json(
        { error: 'payment_intent_id und cv_text_token sind erforderlich.' },
        { status: 400 }
      )
    }

    // Verify payment
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: 'Zahlungssystem nicht konfiguriert.' }, { status: 500 })
    }

    const stripe = new Stripe(secretKey)
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Zahlung nicht bestätigt.' }, { status: 402 })
    }

    if (paymentIntent.metadata?.cv_text_token !== cv_text_token) {
      return NextResponse.json({ error: 'Zahlungszuordnung ungültig.' }, { status: 403 })
    }

    if (paymentIntent.metadata?.user_id !== user.id) {
      return NextResponse.json({ error: 'Zahlungszuordnung ungültig.' }, { status: 403 })
    }

    // Retrieve CV text from token store
    const tokenEntry = retrieveToken(cv_text_token)
    if (!tokenEntry) {
      return NextResponse.json(
        { error: 'Deine Sitzung ist abgelaufen. Bitte lade deinen Lebenslauf erneut hoch.' },
        { status: 410 }
      )
    }

    // Step 1: Optimize the CV via Claude
    const optimizationResult = await callClaudeOptimization(tokenEntry.anonymizedText)
    if (!optimizationResult) {
      return NextResponse.json(
        { error: 'Bei der Optimierung ist ein Fehler aufgetreten. Bitte kontaktiere unseren Support.' },
        { status: 500 }
      )
    }

    // Step 2: Re-insert contact data into optimized sections
    for (const section of optimizationResult.sections) {
      section.content = reinsertContactData(section.content, tokenEntry.originalContactData)
    }
    for (const change of optimizationResult.changes_summary) {
      change.after = reinsertContactData(change.after, tokenEntry.originalContactData)
    }

    // Step 3: Get new score for the optimized CV
    const optimizedText = optimizationResult.sections.map((s) => `${s.name}\n${s.content}`).join('\n\n')
    const newScoreResult = await callClaudeAnalysisForScore(optimizedText)

    // Step 4: Store result in Supabase
    const resultId = nanoid()
    const now = new Date().toISOString()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    try {
      const admin = createAdminClient()
      await admin.from('cv_check_results').insert({
        id: resultId,
        user_id: user.id,
        created_at: now,
        original_score: original_score_data?.total ?? 0,
        original_score_details: original_score_data ?? null,
        optimized_score: newScoreResult?.score?.total ?? 0,
        optimized_score_details: newScoreResult?.score ?? null,
        changes_summary: optimizationResult.changes_summary,
        placeholders: optimizationResult.placeholders,
        tips: tips ?? null,
        optimized_sections: optimizationResult.sections,
        files_expire_at: expiresAt,
        payment_id: payment_intent_id,
        status: 'completed',
      })
    } catch {
      // If Supabase table doesn't exist, continue without persistence.
      // The result is still returned in the response.
    }

    // Clean up token
    deleteToken(cv_text_token)

    return NextResponse.json({
      id: resultId,
      original_score: original_score_data?.total ?? 0,
      optimized_score: newScoreResult?.score?.total ?? 0,
      optimized_score_details: newScoreResult?.score ?? null,
      changes_summary: optimizationResult.changes_summary,
      placeholders: optimizationResult.placeholders,
      sections: optimizationResult.sections,
      files_expire_at: expiresAt,
    })
  } catch {
    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten.' },
      { status: 500 }
    )
  }
}

interface OptimizationResult {
  language: string
  sections: Array<{ name: string; content: string }>
  changes_summary: Array<{ before: string; after: string; reason: string }>
  placeholders: Array<{ location: string; placeholder_text: string; suggestion: string }>
}

async function callClaudeOptimization(anonymizedText: string, attempt = 0): Promise<OptimizationResult | null> {
  if (attempt >= 3) return null

  try {
    const client = new Anthropic()
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0,
      system: CV_OPTIMIZATION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Optimiere den folgenden Lebenslauf gemäß deinen Anweisungen:\n\n---\n${anonymizedText}\n---`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    try {
      const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
      const parsed: OptimizationResult = JSON.parse(cleaned)

      if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
        return callClaudeOptimization(anonymizedText, attempt + 1)
      }

      for (const section of parsed.sections) {
        if (!section.name || !section.content) {
          return callClaudeOptimization(anonymizedText, attempt + 1)
        }
      }

      if (!Array.isArray(parsed.changes_summary)) parsed.changes_summary = []
      if (!Array.isArray(parsed.placeholders)) parsed.placeholders = []

      return parsed
    } catch {
      return callClaudeOptimization(anonymizedText, attempt + 1)
    }
  } catch {
    return callClaudeOptimization(anonymizedText, attempt + 1)
  }
}

async function callClaudeAnalysisForScore(text: string): Promise<{ score: { total: number; categories: Record<string, unknown> } } | null> {
  try {
    const client = new Anthropic()
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      temperature: 0,
      system: CV_ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analysiere und bewerte den folgenden Lebenslauf anhand deiner Bewertungsrubrik:\n\n---\n${text}\n---`,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleaned = responseText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}
