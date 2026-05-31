import { NextRequest, NextResponse } from 'next/server'
import { analyzeSEO } from '@/lib/seo-analyzer'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Normalize URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    // Validate URL
    try {
      new URL(normalizedUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Run SEO analysis
    const seoResult = await analyzeSEO(normalizedUrl)

    // Get top 3 issues
    const top3Issues = seoResult.allIssues.slice(0, 3)

    // Save to database
    const analysis = await prisma.analysis.create({
      data: {
        url: normalizedUrl,
        score: seoResult.score,
        freeIssues: JSON.stringify(top3Issues),
        fullReport: null,
        paid: false,
      },
    })

    return NextResponse.json({
      id: analysis.id,
      score: seoResult.score,
      top3Issues,
      categories: seoResult.categories,
      metadata: seoResult.metadata,
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}
