import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { analyses } from '@/lib/db/schema'
import { stripe } from '@/lib/stripe'
import { analyzeSEO } from '@/lib/seo-analyzer'
import { analyzeWithAI } from '@/lib/ai-analyzer'
import { generatePDF } from '@/lib/pdf-generator'
import { sendReportEmail } from '@/lib/email'
import { eq } from 'drizzle-orm'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error'
    console.error('Webhook signature error:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const analysisId = session.metadata?.analysisId
    const reportType = session.metadata?.reportType as 'one-time' | 'subscription'

    if (!analysisId) {
      console.error('No analysisId in session metadata')
      return NextResponse.json({ received: true })
    }

    try {
      // Find the analysis
      const results = await db.select().from(analyses).where(eq(analyses.id, analysisId))
      const analysis = results[0]

      if (!analysis) {
        console.error('Analysis not found:', analysisId)
        return NextResponse.json({ received: true })
      }

      // Run full SEO analysis
      let seoResult
      try {
        seoResult = await analyzeSEO(analysis.url)
      } catch (err) {
        console.error('SEO re-analysis failed:', err)
        // Use existing data if available
        seoResult = null
      }

      // Run AI analysis
      let aiAnalysis = null
      if (seoResult) {
        try {
          aiAnalysis = await analyzeWithAI(analysis.url, seoResult, '')
        } catch (err) {
          console.error('AI analysis failed:', err)
        }
      }

      // Prepare full report data
      const fullReport = {
        allIssues: seoResult?.allIssues || [],
        categories: seoResult?.categories || { technical: 0, content: 0, social: 0, performance: 0 },
        metadata: seoResult?.metadata || {
          title: '', description: '', wordCount: 0, imageCount: 0,
          url: analysis.url, h1Count: 0, h2Count: 0,
          internalLinks: 0, externalLinks: 0,
          hasSchema: false, hasCanonical: false, isHttps: true,
        },
        aiAnalysis,
      }

      // Update analysis record
      await db
        .update(analyses)
        .set({
          paid: true,
          paidAt: new Date(),
          fullReport: JSON.stringify(fullReport),
          reportType,
          stripeSessionId: session.id,
          stripeCustomerId: session.customer as string || null,
          score: seoResult?.score ?? analysis.score,
          updatedAt: new Date(),
        })
        .where(eq(analyses.id, analysisId))

      // Re-fetch updated analysis for PDF
      const updatedResults = await db.select().from(analyses).where(eq(analyses.id, analysisId))
      const updatedAnalysis = updatedResults[0]

      // Generate PDF
      let pdfBuffer: Buffer | undefined
      try {
        pdfBuffer = await generatePDF(updatedAnalysis)
      } catch (err) {
        console.error('PDF generation failed:', err)
      }

      // Send email
      if (analysis.email) {
        try {
          await sendReportEmail({
            to: analysis.email,
            name: analysis.name || '',
            url: analysis.url,
            score: updatedAnalysis.score,
            reportId: analysisId,
            pdfBuffer,
          })

          // Mark PDF as sent
          await db
            .update(analyses)
            .set({ pdfSent: true, updatedAt: new Date() })
            .where(eq(analyses.id, analysisId))
        } catch (err) {
          console.error('Email send failed:', err)
        }
      }
    } catch (err) {
      console.error('Webhook processing error:', err)
    }
  }

  return NextResponse.json({ received: true })
}
