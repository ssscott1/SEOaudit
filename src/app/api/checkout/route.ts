import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { analyses } from '@/lib/db/schema'
import { stripe } from '@/lib/stripe'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysisId, email, name, type } = body

    if (!analysisId || !email || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (type !== 'one-time' && type !== 'subscription') {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // Find the analysis
    let analysis
    try {
      const results = await db.select().from(analyses).where(eq(analyses.id, analysisId))
      analysis = results[0]
    } catch {
      // DB might not be configured in dev
      analysis = { id: analysisId, url: '' }
    }

    // Update email/name
    try {
      await db
        .update(analyses)
        .set({ email, name: name || null, updatedAt: new Date() })
        .where(eq(analyses.id, analysisId))
    } catch {
      // ignore DB errors in dev
    }

    // Create Stripe checkout session
    const analysisUrl = analysis?.url || ''

    let session
    if (type === 'one-time') {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'SEO Audit Report — Full Analysis',
                description: `Complete SEO & AI search audit for ${analysisUrl}`,
              },
              unit_amount: 19900,
            },
            quantity: 1,
          },
        ],
        metadata: {
          analysisId,
          reportType: 'one-time',
        },
        success_url: `${baseUrl}/report/${analysisId}?success=true`,
        cancel_url: `${baseUrl}/analyze?url=${encodeURIComponent(analysisUrl)}`,
      })
    } else {
      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Monthly SEO Audit',
                description: 'Monthly comprehensive SEO & AI search audit',
              },
              recurring: { interval: 'month' },
              unit_amount: 4900,
            },
            quantity: 1,
          },
        ],
        metadata: {
          analysisId,
          reportType: 'subscription',
        },
        success_url: `${baseUrl}/report/${analysisId}?success=true`,
        cancel_url: `${baseUrl}/analyze?url=${encodeURIComponent(analysisUrl)}`,
      })
    }

    // Update analysis with Stripe session ID
    try {
      await db
        .update(analyses)
        .set({ stripeSessionId: session.id, updatedAt: new Date() })
        .where(eq(analyses.id, analysisId))
    } catch {
      // ignore
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
