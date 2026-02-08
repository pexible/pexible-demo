// Shared score utilities for the CV Check feature.
// Used by cv-check/page.tsx, result/[id]/page.tsx, mein-pex/page.tsx.

// --- Color & Label ---

/** Hex color for a 0-100 score. Thresholds: ≥80 green, ≥60 yellow, ≥40 orange, <40 red. */
export function getScoreColor(score: number): string {
  if (score >= 80) return '#22C55E'
  if (score >= 60) return '#EAB308'
  if (score >= 40) return '#F97316'
  return '#EF4444'
}

/** Tailwind text color class for a 0-100 score. */
export function getScoreColorClass(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-500'
  return 'text-red-500'
}

/** Tailwind bg + border classes for a score badge. */
export function getScoreBgClass(score: number): string {
  if (score >= 80) return 'bg-emerald-50 border-emerald-200'
  if (score >= 60) return 'bg-yellow-50 border-yellow-200'
  if (score >= 40) return 'bg-orange-50 border-orange-200'
  return 'bg-red-50 border-red-200'
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Sehr gut'
  if (score >= 60) return 'Gut'
  if (score >= 40) return 'Ausbaufähig'
  return 'Überarbeitungsbedarf'
}

// --- Legacy vs. New Score Data ---

export interface NewScoreData {
  kind: 'new'
  originalAts: number
  originalContent: number
  optimizedAts: number | null
  optimizedContent: number | null
}

export interface LegacyScoreData {
  kind: 'legacy'
  originalScore: number
  optimizedScore: number | null
}

export type ParsedScoreData = NewScoreData | LegacyScoreData

/**
 * Detect whether a cv_check_results row uses legacy (single integer) or
 * new (two-dimensional JSONB) scoring and extract the relevant values.
 *
 * Legacy detection: original_score_details is null/undefined OR does not
 * contain an "ats" key.
 */
export function parseScoreData(result: {
  original_score: number
  original_score_details?: { ats?: number; content?: number } | null
  optimized_score: number
  optimized_score_details?: { ats?: number; content?: number } | null
}): ParsedScoreData {
  const hasNewOriginal =
    result.original_score_details != null &&
    typeof result.original_score_details.ats === 'number'

  if (!hasNewOriginal) {
    return {
      kind: 'legacy',
      originalScore: result.original_score ?? 0,
      optimizedScore: result.optimized_score > 0 ? result.optimized_score : null,
    }
  }

  // optimized_score_details can be null when re-analysis failed
  const hasNewOptimized =
    result.optimized_score_details != null &&
    typeof result.optimized_score_details.ats === 'number'

  return {
    kind: 'new',
    originalAts: result.original_score_details!.ats!,
    originalContent: result.original_score_details!.content ?? 0,
    optimizedAts: hasNewOptimized ? result.optimized_score_details!.ats! : null,
    optimizedContent: hasNewOptimized ? (result.optimized_score_details!.content ?? 0) : null,
  }
}
