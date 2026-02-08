// Shared CV analysis function used by both Stufe 1 (free analysis) and
// Stufe 2 (post-optimization re-analysis).
//
// Extracted from app/api/cv-check/analyze/route.ts so that the optimize
// route can call the same LLM analysis after optimizing the CV text.

import Anthropic from '@anthropic-ai/sdk'
import { CV_ANALYSIS_SYSTEM_PROMPT } from '@/lib/cv-prompts'

// --- Types ---

export interface ScoreCategory {
  score: number
  max: number
  reasoning: string
}

export interface DimensionScore {
  total: number
  categories: Record<string, ScoreCategory>
}

export interface AnalysisResult {
  language: string
  ats_score: DimensionScore
  content_score: DimensionScore
  tips: Array<{
    title: string
    description: string
    dimension: string
    category: string
    impact: string
  }>
}

// --- Public API ---

/**
 * Analyze a CV text using Claude and return two-dimensional scores.
 * Returns null after 3 failed attempts.
 */
export async function analyzeCV(anonymizedText: string): Promise<AnalysisResult | null> {
  return callClaudeAnalysis(anonymizedText, 0)
}

// --- Internal ---

async function callClaudeAnalysis(anonymizedText: string, attempt: number): Promise<AnalysisResult | null> {
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
      const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      return callClaudeAnalysis(anonymizedText, attempt + 1)
    }

    // Validate two-dimensional structure
    if (!parsed.ats_score?.categories || !parsed.content_score?.categories) {
      return callClaudeAnalysis(anonymizedText, attempt + 1)
    }

    // Validate and fix score consistency
    parsed = validateAndFixScores(parsed)

    // Validate tips
    if (!Array.isArray(parsed.tips) || parsed.tips.length !== 3) {
      return callClaudeAnalysis(anonymizedText, attempt + 1)
    }

    const validAtsCategories = ['section_recognition', 'structure_order', 'formatting_consistency', 'keywords_terminology']
    const validContentCategories = ['content_quality', 'completeness', 'formal_quality', 'coherence_career']
    const validDimensions = ['ats', 'content']

    for (const tip of parsed.tips) {
      if (!tip.title || !tip.description || !tip.dimension || !tip.category || !tip.impact) {
        return callClaudeAnalysis(anonymizedText, attempt + 1)
      }
      if (!validDimensions.includes(tip.dimension)) {
        tip.dimension = 'content' // fallback
      }
      const validCats = tip.dimension === 'ats' ? validAtsCategories : validContentCategories
      if (!validCats.includes(tip.category)) {
        tip.category = validCats[0] // fallback
      }
    }

    return parsed
  } catch {
    return callClaudeAnalysis(anonymizedText, attempt + 1)
  }
}

function validateAndFixScores(result: AnalysisResult): AnalysisResult {
  fixDimensionScores(result.ats_score)
  fixDimensionScores(result.content_score)
  return result
}

function fixDimensionScores(dimension: DimensionScore): void {
  if (!dimension?.categories) return

  let totalSum = 0
  for (const catKey of Object.keys(dimension.categories)) {
    const cat = dimension.categories[catKey]
    if (cat.score > cat.max) {
      cat.score = cat.max
    }
    if (cat.score < 0) {
      cat.score = 0
    }
    totalSum += cat.score
  }
  dimension.total = totalSum
}
