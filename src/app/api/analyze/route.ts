import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { analyses } from '@/lib/db/schema'
import { analyzeSEO } from '@/lib/seo-analyzer'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Normalize URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    // Validate URL format
    try {
      new URL(normalizedUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Run SEO analysis
    let seoResult
    try {
      seoResult = await analyzeSEO(normalizedUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed'
      return NextResponse.json({ error: message }, { status: 422 })
    }

    const id = generateId()

    // Top 3 issues for free tier
    const freeIssues = seoResult.allIssues
      .sort((a, b) => {
        const sev = { critical: 0, warning: 1, info: 2 }
        return sev[a.severity] - sev[b.severity]
      })
      .slice(0, 3)

    // Insert into DB
    try {
      await db.insert(analyses).values({
        id,
        url: normalizedUrl,
        score: seoResult.score,
        freeIssues: JSON.stringify(freeIssues),
        paid: false,
        pdfSent: false,
      })
    } catch (dbErr) {
      console.error('DB insert failed:', dbErr)
      // Return results even if DB fails (no API key / DB configured yet)
    }

    return NextResponse.json({
      id,
      score: seoResult.score,
      freeIssues,
      categories: seoResult.categories,
      metadata: seoResult.metadata,
      totalIssues: seoResult.allIssues.length,
    })
  } catch (err) {
    console.error('Analyze error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
