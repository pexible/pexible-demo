import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import Anthropic from '@anthropic-ai/sdk'
import { nanoid } from 'nanoid'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { retrieveToken, deleteToken } from '@/lib/cv-token-store'
import { reinsertContactData } from '@/lib/cv-anonymize'
import { CV_OPTIMIZATION_SYSTEM_PROMPT } from '@/lib/cv-prompts'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { analyzeCV } from '@/lib/cv-analysis'

export const maxDuration = 300 // Vercel Pro: up to 300s for long CVs

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

  let body: { payment_intent_id?: string; cv_text_token?: string; original_score_data?: { ats?: number; content?: number }; tips?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  const { payment_intent_id, cv_text_token, original_score_data, tips } = body

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
  let paymentIntent: Stripe.PaymentIntent
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id)
  } catch {
    return NextResponse.json({ error: 'Zahlung nicht gefunden.' }, { status: 400 })
  }

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
  const tokenEntry = await retrieveToken(cv_text_token)
  if (!tokenEntry) {
    return NextResponse.json(
      { error: 'Deine Sitzung ist abgelaufen. Bitte lade deinen Lebenslauf erneut hoch.' },
      { status: 410 }
    )
  }

  // All validation passed — switch to streaming response.
  // The client reads NDJSON lines: {"type":"progress","phase":"..."} or {"type":"result",...}
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'))
      }

      try {
        // Step 1: Optimize the CV
        send({ type: 'progress', phase: 'optimizing' })
        const optimizationResult = await callClaudeOptimization(tokenEntry.anonymizedText, tokenEntry.language)
        if (!optimizationResult) {
          send({ type: 'error', error: 'Bei der Optimierung ist ein Fehler aufgetreten. Bitte kontaktiere unseren Support.' })
          controller.close()
          return
        }

        // Step 2: Re-analyze BEFORE reinserting contact data
        send({ type: 'progress', phase: 'scoring' })
        const rawPlaintext = optimizationResult.sections
          .map((s) => `${s.name}\n\n${s.content}`)
          .join('\n\n')
        const scoringText = normalizeText(rawPlaintext)
          .replace(/\[(?:Bitte ergänzen|Please add):?\s*[^\]]*\]/gi, '')
          .replace(/  +/g, ' ')

        const originalAts = original_score_data?.ats ?? 0
        const originalContent = original_score_data?.content ?? 0

        let optimizedAts: number | null = null
        let optimizedContent: number | null = null
        let optimizedScoreDetails: { ats: number; content: number } | null = null

        try {
          const reAnalysis = await analyzeCV(scoringText)
          if (reAnalysis) {
            optimizedAts = Math.max(reAnalysis.ats_score.total, originalAts)
            optimizedContent = Math.max(reAnalysis.content_score.total, originalContent)
            optimizedScoreDetails = { ats: optimizedAts, content: optimizedContent }
          }
        } catch {
          // Re-analysis failed — continue without optimized scores
        }

        // Step 3: Re-insert contact data
        send({ type: 'progress', phase: 'saving' })
        for (const section of optimizationResult.sections) {
          section.content = reinsertContactData(section.content, tokenEntry.originalContactData)
        }
        for (const change of optimizationResult.changes_summary) {
          change.after = reinsertContactData(change.after, tokenEntry.originalContactData)
        }

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
            original_score: originalAts,
            original_score_details: original_score_data ?? null,
            optimized_score: optimizedAts ?? 0,
            optimized_score_details: optimizedScoreDetails,
            changes_summary: optimizationResult.changes_summary,
            placeholders: optimizationResult.placeholders,
            tips: tips ?? null,
            optimized_sections: optimizationResult.sections,
            files_expire_at: expiresAt,
            payment_id: payment_intent_id,
            status: 'completed',
          })
        } catch {
          // Continue without persistence — result is still sent to client
        }

        await deleteToken(cv_text_token)

        // Step 5: Send final result
        send({
          type: 'result',
          id: resultId,
          original_ats_score: originalAts,
          original_content_score: originalContent,
          optimized_ats_score: optimizedAts,
          optimized_content_score: optimizedContent,
          changes_summary: optimizationResult.changes_summary,
          placeholders: optimizationResult.placeholders,
          sections: optimizationResult.sections,
          files_expire_at: expiresAt,
        })
        controller.close()
      } catch {
        send({ type: 'error', error: 'Ein unerwarteter Fehler ist aufgetreten.' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}

interface OptimizationResult {
  language: string
  sections: Array<{ name: string; content: string }>
  changes_summary: Array<{ before: string; after: string; reason: string }>
  placeholders: Array<{ location: string; placeholder_text: string; suggestion: string }>
}

// Normalize reassembled text to match the whitespace conventions of PDF extraction,
// so the scoring model sees consistent input regardless of source.
function normalizeText(text: string): string {
  let r = text
  r = r.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  r = r.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
  r = r.replace(/\t/g, '  ')
  r = r.replace(/^( {4,})/gm, '  ')
  r = r.replace(/[ \t]+$/gm, '')
  r = r.replace(/^(\s*)[•●○►▪‣*→]\s*/gm, '$1- ')
  r = r.replace(/\\n/g, '\n')
  r = r.replace(/\n{3,}/g, '\n\n')
  return r.trim()
}

async function callClaudeOptimization(anonymizedText: string, language: string, attempt = 0): Promise<OptimizationResult | null> {
  if (attempt >= 3) return null

  const isEnglish = language === 'en'
  const userPrompt = isEnglish
    ? `Optimize the following CV according to your instructions. The CV is in English — respond entirely in English:\n\n---\n${anonymizedText}\n---`
    : `Optimiere den folgenden Lebenslauf gemäß deinen Anweisungen:\n\n---\n${anonymizedText}\n---`

  try {
    const client = new Anthropic()
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 6144,
      temperature: 0,
      system: CV_OPTIMIZATION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    try {
      const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
      const parsed: OptimizationResult = JSON.parse(cleaned)

      if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
        return callClaudeOptimization(anonymizedText, language, attempt + 1)
      }

      for (const section of parsed.sections) {
        if (!section.name || !section.content) {
          return callClaudeOptimization(anonymizedText, language, attempt + 1)
        }
      }

      if (!Array.isArray(parsed.changes_summary)) parsed.changes_summary = []
      if (!Array.isArray(parsed.placeholders)) parsed.placeholders = []

      return parsed
    } catch {
      return callClaudeOptimization(anonymizedText, language, attempt + 1)
    }
  } catch {
    return callClaudeOptimization(anonymizedText, language, attempt + 1)
  }
}
