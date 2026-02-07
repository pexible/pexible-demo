import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { nanoid } from 'nanoid'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { anonymizeCvText } from '@/lib/cv-anonymize'
import { storeToken } from '@/lib/cv-token-store'
import { CV_ANALYSIS_SYSTEM_PROMPT } from '@/lib/cv-prompts'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46, 0x2d] // %PDF-
const MIN_TEXT_LENGTH = 50

// Daily rate limit: 5 analyses per day per IP
const DAY_MS = 24 * 60 * 60 * 1000

export const maxDuration = 60

export async function POST(req: Request) {
  // Rate limit: 5 CV checks per day per IP
  const ip = getClientIp(req)
  const { limited } = rateLimit(`cv-check:${ip}`, 5, DAY_MS)
  if (limited) {
    return NextResponse.json(
      { error: 'Du hast heute bereits 5 CVs geprüft. Versuche es morgen erneut.' },
      { status: 429 }
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Bitte lade eine PDF-Datei hoch.' },
        { status: 400 }
      )
    }

    // Client-side checks re-validated server-side
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Die Datei ist zu groß. Maximale Größe: 5 MB.' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Bitte lade eine PDF-Datei hoch.' },
        { status: 400 }
      )
    }

    // Sanitize filename: reject path traversal and double extensions
    const originalName = file.name || ''
    if (originalName.includes('..') || originalName.includes('/') || originalName.includes('\\')) {
      return NextResponse.json(
        { error: 'Ungültiger Dateiname.' },
        { status: 400 }
      )
    }

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Magic byte verification: must start with %PDF-
    if (buffer.length < 5) {
      return NextResponse.json(
        { error: 'Bitte lade eine gültige PDF-Datei hoch.' },
        { status: 400 }
      )
    }
    for (let i = 0; i < PDF_MAGIC_BYTES.length; i++) {
      if (buffer[i] !== PDF_MAGIC_BYTES[i]) {
        return NextResponse.json(
          { error: 'Die Datei ist keine gültige PDF-Datei.' },
          { status: 400 }
        )
      }
    }

    // PDF text extraction using pdf-parse v2
    let extractedText: string
    try {
      const { PDFParse } = await import('pdf-parse')
      const { getPath } = await import('pdf-parse/worker')
      PDFParse.setWorker(getPath())

      const pdf = new PDFParse({ data: new Uint8Array(buffer) })
      const textResult = await pdf.getText()
      extractedText = textResult.text
    } catch (pdfError: unknown) {
      const errorMessage = pdfError instanceof Error ? pdfError.message : ''
      if (errorMessage.toLowerCase().includes('password')) {
        return NextResponse.json(
          { error: 'Dein PDF ist passwortgeschützt. Bitte lade eine ungeschützte Version hoch.' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Dein PDF konnte nicht gelesen werden. Bitte prüfe die Datei und versuche es erneut.' },
        { status: 400 }
      )
    }

    // Check for scanned/image PDFs
    if (!extractedText || extractedText.trim().length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        { error: 'Dein PDF scheint ein gescanntes Dokument zu sein. Bitte lade eine textbasierte PDF-Datei hoch.' },
        { status: 400 }
      )
    }

    // Anonymize before sending to LLM
    const { anonymizedText, contactData } = anonymizeCvText(extractedText)

    // Call Claude for analysis
    const analysisResult = await callClaudeAnalysis(anonymizedText)

    if (!analysisResult) {
      return NextResponse.json(
        { error: 'Die Analyse konnte nicht abgeschlossen werden. Bitte versuche es erneut.' },
        { status: 500 }
      )
    }

    // Store token for potential Stufe 2 optimization (including detected language)
    const cvTextToken = nanoid()
    await storeToken(cvTextToken, anonymizedText, contactData, analysisResult.language || 'de')

    return NextResponse.json({
      ...analysisResult,
      cv_text_token: cvTextToken,
    })
  } catch {
    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}

interface ScoreDetail {
  score: number
  max: number
  reasoning: string
}

interface CategoryScore {
  score: number
  max: number
  details: Record<string, ScoreDetail>
}

interface AnalysisResult {
  language: string
  score: {
    total: number
    categories: Record<string, CategoryScore>
  }
  tips: Array<{
    title: string
    description: string
    category: string
    impact: string
  }>
}

async function callClaudeAnalysis(anonymizedText: string, attempt = 0): Promise<AnalysisResult | null> {
  if (attempt >= 3) return null

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
          content: `Analysiere und bewerte den folgenden Lebenslauf anhand deiner Bewertungsrubrik:\n\n---\n${anonymizedText}\n---`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse JSON response
    let parsed: AnalysisResult
    try {
      // Strip potential markdown code fences
      const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      // Retry with hint to return only JSON
      return callClaudeAnalysis(anonymizedText, attempt + 1)
    }

    // Validate and fix score consistency
    parsed = validateAndFixScores(parsed)

    // Validate tips
    if (!Array.isArray(parsed.tips) || parsed.tips.length !== 3) {
      return callClaudeAnalysis(anonymizedText, attempt + 1)
    }

    const validCategories = ['ats_parsing', 'content_quality', 'completeness', 'formal_quality', 'overall_impression']
    for (const tip of parsed.tips) {
      if (!tip.title || !tip.description || !tip.category || !tip.impact) {
        return callClaudeAnalysis(anonymizedText, attempt + 1)
      }
      if (!validCategories.includes(tip.category)) {
        tip.category = validCategories[0] // fallback
      }
    }

    return parsed
  } catch {
    return callClaudeAnalysis(anonymizedText, attempt + 1)
  }
}

function validateAndFixScores(result: AnalysisResult): AnalysisResult {
  const categories = result.score?.categories
  if (!categories) return result

  // Fix each category: detail scores should sum to category score
  for (const catKey of Object.keys(categories)) {
    const cat = categories[catKey]
    if (!cat?.details) continue

    let detailSum = 0
    for (const detKey of Object.keys(cat.details)) {
      const detail = cat.details[detKey]
      // Clamp detail score to max
      if (detail.score > detail.max) {
        detail.score = detail.max
      }
      if (detail.score < 0) {
        detail.score = 0
      }
      detailSum += detail.score
    }
    cat.score = detailSum
  }

  // Fix total: should equal sum of category scores
  let totalSum = 0
  for (const catKey of Object.keys(categories)) {
    totalSum += categories[catKey].score
  }
  result.score.total = totalSum

  return result
}
