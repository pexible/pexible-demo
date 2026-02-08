// Normalizes CV text from different sources (PDF extraction vs. JSON reassembly)
// to ensure consistent formatting for the analysis prompt.

// Bullet characters to unify into "- "
const BULLET_REGEX = /^(\s*)[•●○►▪‣*→]\s*/gm

// Unicode whitespace characters (non-breaking space, thin space, etc.)
const UNICODE_WS_REGEX = /[\u00A0\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g

function normalizeWhitespace(text: string): string {
  let result = text

  // Line endings: \r\n and \r → \n
  result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Unicode whitespace → regular space
  result = result.replace(UNICODE_WS_REGEX, ' ')

  // Tabs → 2 spaces
  result = result.replace(/\t/g, '  ')

  // >4 leading spaces → 2 spaces
  result = result.replace(/^( {4,})/gm, '  ')

  // Trailing whitespace per line
  result = result.replace(/[ \t]+$/gm, '')

  // Unify bullet characters
  result = result.replace(BULLET_REGEX, '$1- ')

  // Multiple blank lines → max 2 newlines (1 blank line)
  result = result.replace(/\n{3,}/g, '\n\n')

  return result.trim()
}

/**
 * Normalizes raw PDF-extracted text before analysis.
 * Removes formatting artifacts so the analysis prompt sees clean, consistent text.
 */
export function normalizeExtractedText(rawPdfText: string): string {
  return normalizeWhitespace(rawPdfText)
}

/**
 * Reassembles optimized CV sections into plaintext that is structurally
 * identical to normalized PDF text, ensuring consistent scoring.
 */
export function reassembleOptimizedText(
  sections: Array<{ name: string; content: string }>
): string {
  const raw = sections
    .map((s) => `${s.name}\n\n${s.content}`)
    .join('\n\n')

  // Convert escaped newlines from JSON content into real newlines
  const withNewlines = raw.replace(/\\n/g, '\n')

  return normalizeWhitespace(withNewlines)
}
