import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysisId, email, name, type } = body

    if (!analysisId || !email || !type) {
      return NextResponse.json(
        { error: 'Analysis ID, email, and type are required' },
        { status: 400 }
      )
    }

    if (!['one-time', 'subscription'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one-time or subscription' },
        { status: 400 }
      )
    }

    // Verify analysis exists
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
    })

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    // Update email/name
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { email, name: name || null },
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const session = await createCheckoutSession({
      analysisId,
      email,
      type,
      baseUrl,
    })

    // Store session ID
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { stripeSessionId: session.id, reportType: type },
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
}
