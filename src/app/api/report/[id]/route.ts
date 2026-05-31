import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { analyses } from '@/lib/db/schema'
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
      return NextResponse.json({ error: 'Report is being generated, please try again shortly' }, { status: 202 })
    }

    const fullReport = JSON.parse(analysis.fullReport)

    return NextResponse.json({
      id: analysis.id,
      url: analysis.url,
      score: analysis.score,
      email: analysis.email,
      name: analysis.name,
      reportType: analysis.reportType,
      createdAt: analysis.createdAt,
      paidAt: analysis.paidAt,
      ...fullReport,
    })
  } catch (err) {
    console.error('Report fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 })
  }
}
