import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { generatePDFBuffer } from '@/lib/pdf-generator'

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

    if (!analysis.paid || !analysis.fullReport) {
      return NextResponse.json({ error: 'Payment required' }, { status: 402 })
    }

    const fullReport = JSON.parse(analysis.fullReport)

    // Reconstruct SEO result structure for PDF
    const seoResult = {
      score: analysis.score,
      allIssues: fullReport.seoIssues || [],
      categories: fullReport.categories || {
        technical: { score: 0, maxScore: 100, label: 'Technical SEO' },
        content: { score: 0, maxScore: 100, label: 'Content Quality' },
        performance: { score: 0, maxScore: 100, label: 'Performance' },
        social: { score: 0, maxScore: 100, label: 'Social & OG' },
      },
      metadata: fullReport.metadata || {},
      html: '',
    }

    const aiResult = {
      aiScore: fullReport.aiSearchAnalysis?.aiScore || 0,
      aiIssues: fullReport.aiSearchAnalysis?.aiIssues || [],
      opportunities: fullReport.aiSearchAnalysis?.opportunities || [],
      competitors: fullReport.competitors || { suggested: [], gaps: [] },
      actionPlan: fullReport.actionPlan || { month1: [], month2: [], month3: [] },
      summary: fullReport.summary || { grade: 'N/A', topWins: [], criticalIssues: [] },
    }

    const pdfBuffer = await generatePDFBuffer(analysis.url, id, seoResult, aiResult)

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="seo-audit-${id}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
