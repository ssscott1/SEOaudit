import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-05-27.dahlia',
  typescript: true,
})

export const ONE_TIME_PRICE = 19900 // $199 in cents
export const SUBSCRIPTION_PRICE = 4900 // $49 in cents

export async function createCheckoutSession({
  analysisId,
  email,
  type,
  baseUrl,
}: {
  analysisId: string
  email: string
  type: 'one-time' | 'subscription'
  baseUrl: string
}) {
  const isSubscription = type === 'subscription'

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer_email: email,
    payment_method_types: ['card'],
    metadata: {
      analysisId,
      reportType: type,
    },
    success_url: `${baseUrl}/report/${analysisId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/analyze?id=${analysisId}&cancelled=true`,
  }

  if (isSubscription) {
    // Use price ID if available, otherwise create inline price
    if (process.env.STRIPE_SUBSCRIPTION_PRICE_ID && process.env.STRIPE_SUBSCRIPTION_PRICE_ID !== 'price_...') {
      sessionParams.mode = 'subscription'
      sessionParams.line_items = [
        {
          price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID,
          quantity: 1,
        },
      ]
    } else {
      sessionParams.mode = 'subscription'
      sessionParams.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Monthly SEO Audit',
              description: 'Monthly comprehensive SEO + AI search audit with full report, competitor analysis, and 90-day action plan',
            },
            unit_amount: SUBSCRIPTION_PRICE,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ]
    }
  } else {
    // One-time payment
    if (process.env.STRIPE_ONE_TIME_PRICE_ID && process.env.STRIPE_ONE_TIME_PRICE_ID !== 'price_...') {
      sessionParams.mode = 'payment'
      sessionParams.line_items = [
        {
          price: process.env.STRIPE_ONE_TIME_PRICE_ID,
          quantity: 1,
        },
      ]
    } else {
      sessionParams.mode = 'payment'
      sessionParams.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Full SEO Audit Report',
              description: 'Comprehensive SEO + AI search audit with full prioritized fix list, competitor comparison, and 90-day action plan',
            },
            unit_amount: ONE_TIME_PRICE,
          },
          quantity: 1,
        },
      ]
    }
  }

  const session = await stripe.checkout.sessions.create(sessionParams)
  return session
}
