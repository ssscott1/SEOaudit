import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { analyses } from '@/lib/db/schema'
import { verifyAdminToken } from '@/lib/admin-auth'
import { desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  // Verify JWT from cookie
  const token = request.cookies.get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const allAnalyses = await db
      .select()
      .from(analyses)
      .orderBy(desc(analyses.createdAt))

    const total = allAnalyses.length
    const paid = allAnalyses.filter(a => a.paid).length
    const conversionRate = total > 0 ? Math.round((paid / total) * 100) : 0

    // Calculate revenue
    let revenue = 0
    allAnalyses.forEach(a => {
      if (a.paid) {
        if (a.reportType === 'one-time') revenue += 199
        else if (a.reportType === 'subscription') revenue += 49
      }
    })

    // Strip fullReport from list view for performance
    const analysesList = allAnalyses.map(a => ({
      id: a.id,
      url: a.url,
      email: a.email,
      name: a.name,
      score: a.score,
      paid: a.paid,
      reportType: a.reportType,
      paidAt: a.paidAt,
      pdfSent: a.pdfSent,
      createdAt: a.createdAt,
    }))

    return NextResponse.json({
      analyses: analysesList,
      stats: {
        total,
        paid,
        conversionRate,
        revenue,
      },
    })
  } catch (err) {
    console.error('Admin data error:', err)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
