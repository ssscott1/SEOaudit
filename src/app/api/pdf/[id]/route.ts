import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { analyses } from '@/lib/db/schema'
import { generatePDF } from '@/lib/pdf-generator'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const results = await db.select().from(analyses).where(eq(analyses.id, id))
    const analysis = results[0]

    if (!analysis) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    if (!analysis.paid) {
      return NextResponse.json({ error: 'Payment required' }, { status: 402 })
    }

    if (!analysis.fullReport) {
      return NextResponse.json({ error: 'Report data not available' }, { status: 404 })
    }

    const pdfBuffer = await generatePDF(analysis)

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="seo-audit-${id}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
