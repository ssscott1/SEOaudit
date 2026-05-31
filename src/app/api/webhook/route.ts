import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import prisma from '@/lib/db'
import { analyzeSEO } from '@/lib/seo-analyzer'
import { analyzeWithAI } from '@/lib/ai-analyzer'
import { generatePDFBuffer } from '@/lib/pdf-generator'
import { sendReportEmail } from '@/lib/email'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (webhookSecret && webhookSecret !== 'whsec_...') {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else {
      // Development: parse without verification
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const analysisId = session.metadata?.analysisId
    const reportType = session.metadata?.reportType as 'one-time' | 'subscription' | undefined

    if (!analysisId) {
      console.error('No analysisId in session metadata')
      return NextResponse.json({ received: true })
    }

    try {
      // Mark as paid
      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          paid: true,
          paidAt: new Date(),
          stripeCustomerId: session.customer as string || null,
          reportType: reportType || 'one-time',
        },
      })

      // Get analysis record
      const analysis = await prisma.analysis.findUnique({
        where: { id: analysisId },
      })

      if (!analysis) {
        console.error('Analysis not found:', analysisId)
        return NextResponse.json({ received: true })
      }

      // Run full SEO analysis
      const seoResult = await analyzeSEO(analysis.url)

      // Run AI analysis
      const aiResult = await analyzeWithAI(analysis.url, seoResult, seoResult.html)

      // Build full report
      const fullReport = {
        summary: aiResult.summary,
        seoIssues: seoResult.allIssues,
        categories: seoResult.categories,
        metadata: seoResult.metadata,
        aiSearchAnalysis: {
          aiScore: aiResult.aiScore,
          aiIssues: aiResult.aiIssues,
          opportunities: aiResult.opportunities,
        },
        competitors: aiResult.competitors,
        actionPlan: aiResult.actionPlan,
      }

      // Save full report
      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          fullReport: JSON.stringify(fullReport),
        },
      })

      // Generate PDF and send email if email is present
      if (analysis.email) {
        try {
          const pdfBuffer = await generatePDFBuffer(
            analysis.url,
            analysisId,
            seoResult,
            aiResult
          )

          await sendReportEmail({
            to: analysis.email,
            name: analysis.name || 'there',
            url: analysis.url,
            reportId: analysisId,
            pdfBuffer,
          })

          await prisma.analysis.update({
            where: { id: analysisId },
            data: { pdfSent: true },
          })
        } catch (emailError) {
          console.error('Email/PDF error:', emailError)
          // Don't fail the webhook for email errors
        }
      }
    } catch (error) {
      console.error('Webhook processing error:', error)
      // Return 200 to prevent Stripe retries for processing errors
    }
  }

  return NextResponse.json({ received: true })
}

// Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
}
