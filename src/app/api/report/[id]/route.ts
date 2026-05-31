import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const analysis = await prisma.analysis.findUnique({
      where: { id },
    })

    if (!analysis) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    if (!analysis.paid) {
      return NextResponse.json({ error: 'Payment required' }, { status: 402 })
    }

    if (!analysis.fullReport) {
      // Report is being generated
      return NextResponse.json(
        { error: 'Report is being generated. Please wait a moment.' },
        { status: 202 }
      )
    }

    const fullReport = JSON.parse(analysis.fullReport)

    return NextResponse.json({
      id: analysis.id,
      url: analysis.url,
      score: analysis.score,
      email: analysis.email,
      name: analysis.name,
      reportType: analysis.reportType,
      paidAt: analysis.paidAt,
      createdAt: analysis.createdAt,
      report: fullReport,
    })
  } catch (error) {
    console.error('Report fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 })
  }
}
