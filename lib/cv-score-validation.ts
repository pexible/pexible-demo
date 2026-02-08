// Three-stage score validation for post-optimization re-analysis.
//
// Ensures the user never sees a score drop after paying for optimization.
//
// Stage 1 (accepted):      Both ATS + Content ≥ original → use as-is.
// Stage 2 (retried):       At least one dropped → re-analyze, take best per dimension.
// Stage 3 (floor_applied): Still below → clamp to original value (user sees "+0", never "-X").
//
// If re-analysis fails completely, scores are null — optimization is still delivered.

import { analyzeCV } from '@/lib/cv-analysis'

export type ValidationStage = 'accepted' | 'retried' | 'floor_applied'

export interface ScoreValidationResult {
  ats: number | null
  content: number | null
  stage: ValidationStage
}

export async function validateOptimizedScores(
  optimizedPlaintext: string,
  originalAts: number,
  originalContent: number
): Promise<ScoreValidationResult> {
  // First analysis attempt
  let firstAts: number
  let firstContent: number
  try {
    const firstResult = await analyzeCV(optimizedPlaintext)
    if (!firstResult) {
      return { ats: null, content: null, stage: 'accepted' }
    }
    firstAts = firstResult.ats_score.total
    firstContent = firstResult.content_score.total
  } catch {
    return { ats: null, content: null, stage: 'accepted' }
  }

  // Stage 1 — Accept: both scores ≥ original
  if (firstAts >= originalAts && firstContent >= originalContent) {
    logValidation('accepted', originalAts, originalContent, firstAts, firstContent)
    return { ats: firstAts, content: firstContent, stage: 'accepted' }
  }

  // Stage 2 — Retry: at least one score dropped
  let bestAts = firstAts
  let bestContent = firstContent

  try {
    const secondResult = await analyzeCV(optimizedPlaintext)
    if (secondResult) {
      bestAts = Math.max(firstAts, secondResult.ats_score.total)
      bestContent = Math.max(firstContent, secondResult.content_score.total)
    }
  } catch {
    // Retry failed — proceed with first attempt's scores
  }

  if (bestAts >= originalAts && bestContent >= originalContent) {
    logValidation('retried', originalAts, originalContent, bestAts, bestContent)
    return { ats: bestAts, content: bestContent, stage: 'retried' }
  }

  // Stage 3 — Floor: clamp to original so user never sees a decrease
  const flooredAts = Math.max(bestAts, originalAts)
  const flooredContent = Math.max(bestContent, originalContent)
  logValidation('floor_applied', originalAts, originalContent, bestAts, bestContent, flooredAts, flooredContent)
  return { ats: flooredAts, content: flooredContent, stage: 'floor_applied' }
}

function logValidation(
  stage: ValidationStage,
  origAts: number,
  origContent: number,
  optAts: number,
  optContent: number,
  floorAts?: number,
  floorContent?: number
): void {
  const base = `[cv-score-validation] stage=${stage} ats=${origAts}→${optAts} content=${origContent}→${optContent}`
  if (stage === 'floor_applied') {
    console.log(`${base} floored_ats=${floorAts} floored_content=${floorContent}`)
  } else {
    console.log(base)
  }
}
