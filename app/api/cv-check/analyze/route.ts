import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { anonymizeCvText } from '@/lib/cv-anonymize'
import { storeToken } from '@/lib/cv-token-store'
import { analyzeCV } from '@/lib/cv-analysis'

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

    // Call Claude for analysis (shared module)
    const analysisResult = await analyzeCV(anonymizedText)

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
