import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; format: string }> }
) {
  const { id, format } = await params

  if (format !== 'pdf' && format !== 'docx') {
    return NextResponse.json({ error: 'Ungültiges Format.' }, { status: 400 })
  }

  // Require authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()
    const { data: result, error } = await admin
      .from('cv_check_results')
      .select('id, user_id, status, files_expire_at, optimized_sections')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !result) {
      return NextResponse.json({ error: 'Ergebnis nicht gefunden.' }, { status: 404 })
    }

    if (result.status !== 'completed') {
      return NextResponse.json({ error: 'Optimierung noch nicht abgeschlossen.' }, { status: 400 })
    }

    const expiresAt = new Date(result.files_expire_at)
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Die Datei ist nicht mehr verfügbar. Downloads sind 24 Stunden nach der Optimierung möglich.' },
        { status: 410 }
      )
    }

    const sections: Array<{ name: string; content: string }> = result.optimized_sections || []

    if (format === 'docx') {
      const docxBuffer = await generateDocx(sections)
      return new NextResponse(new Uint8Array(docxBuffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="lebenslauf-optimiert.docx"`,
        },
      })
    }

    // PDF generation
    const pdfBuffer = await generatePdf(sections)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="lebenslauf-optimiert.pdf"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Fehler beim Erstellen der Datei.' }, { status: 500 })
  }
}

async function generateDocx(sections: Array<{ name: string; content: string }>): Promise<Buffer> {
  const {
    Document,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    Packer,
    BorderStyle,
  } = await import('docx')

  const children: (typeof Paragraph.prototype)[] = []

  for (const section of sections) {
    // Section heading
    children.push(
      new Paragraph({
        text: section.name,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 120 },
        border: {
          bottom: {
            color: '999999',
            space: 4,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    )

    // Section content - split by newlines
    const lines = section.content.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Check for bullet points
      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')
      const text = isBullet ? trimmed.slice(2).trim() : trimmed

      // Check for placeholder markers
      const hasPlaceholder = text.includes('[Bitte ergänzen:') || text.includes('[Please add:')

      const runs: (typeof TextRun.prototype)[] = []

      if (hasPlaceholder) {
        // Split text around placeholders and italicize them
        const parts = text.split(/(\[(?:Bitte ergänzen|Please add):[^\]]*\])/)
        for (const part of parts) {
          if (part.match(/^\[(?:Bitte ergänzen|Please add):/)) {
            runs.push(new TextRun({ text: part, italics: true, color: '888888' }))
          } else {
            runs.push(new TextRun({ text: part }))
          }
        }
      } else {
        runs.push(new TextRun({ text }))
      }

      children.push(
        new Paragraph({
          children: runs,
          bullet: isBullet ? { level: 0 } : undefined,
          spacing: { after: 80 },
          alignment: AlignmentType.LEFT,
        })
      )
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22, // 11pt
          },
        },
        heading1: {
          run: {
            font: 'Calibri',
            size: 28, // 14pt
            bold: true,
            color: '1A1A2E',
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children,
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  return Buffer.from(buffer)
}

async function generatePdf(sections: Array<{ name: string; content: string }>): Promise<Buffer> {
  // Use jsPDF for PDF generation (already in project dependencies)
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 25
  const contentWidth = pageWidth - 2 * margin
  let y = margin

  const addNewPageIfNeeded = (neededHeight: number) => {
    const pageHeight = doc.internal.pageSize.getHeight()
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
  }

  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const section = sections[sIdx]

    // Section heading
    addNewPageIfNeeded(20)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(26, 26, 46) // navy
    doc.text(section.name, margin, y)
    y += 2

    // Underline
    doc.setDrawColor(153, 153, 153)
    doc.setLineWidth(0.3)
    doc.line(margin, y, margin + contentWidth, y)
    y += 6

    // Section content
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)

    const lines = section.content.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) {
        y += 2
        continue
      }

      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')
      const text = isBullet ? trimmed.slice(2).trim() : trimmed
      const prefix = isBullet ? '  •  ' : ''
      const fullText = prefix + text
      const wrapped = doc.splitTextToSize(fullText, contentWidth)

      addNewPageIfNeeded(wrapped.length * 5)

      for (const wrappedLine of wrapped) {
        // Check for placeholder markers and italicize
        if (wrappedLine.includes('[Bitte ergänzen:') || wrappedLine.includes('[Please add:')) {
          doc.setFont('helvetica', 'italic')
          doc.setTextColor(136, 136, 136)
          doc.text(wrappedLine, margin, y)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(50, 50, 50)
        } else {
          doc.text(wrappedLine, margin, y)
        }
        y += 5
      }
      y += 1
    }

    y += 4
  }

  const pdfOutput = doc.output('arraybuffer')
  return Buffer.from(pdfOutput)
}
