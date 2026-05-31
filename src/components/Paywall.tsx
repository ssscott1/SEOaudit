'use client'

import { useState } from 'react'

interface PaywallProps {
  analysisId: string
}

export default function Paywall({ analysisId }: PaywallProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState<'one-time' | 'subscription' | null>(null)
  const [error, setError] = useState('')

  const handleCheckout = async (type: 'one-time' | 'subscription') => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(type)
    setError('')

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId, email, name, type }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create checkout. Please try again.')
        setLoading(null)
        return
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Unlock Your Full Report</h2>
        <p className="text-gray-400 text-lg">
          Get every issue, fix, and a 90-day action plan to dominate search results
        </p>
      </div>

      {/* Email capture */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Where should we send your PDF report?</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0D9488] transition-colors"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@yourbusiness.com"
              required
              className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0D9488] transition-colors"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* One-time */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 hover:border-[#0D9488] transition-all">
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">One-Time Report</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-white">$199</span>
              <span className="text-gray-400">once</span>
            </div>
          </div>
          <ul className="space-y-3 mb-6">
            {[
              'Full prioritized issue list',
              'Exact fix instructions',
              'AI search optimization audit',
              'Competitor analysis (3 sites)',
              '90-day action plan',
              'PDF report emailed to you',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-gray-300 text-sm">
                <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleCheckout('one-time')}
            disabled={!!loading}
            className="w-full py-3 bg-white hover:bg-gray-100 disabled:opacity-50 text-[#0F172A] font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading === 'one-time' ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              'Get Full Report — $199'
            )}
          </button>
        </div>

        {/* Subscription — Recommended */}
        <div className="bg-[#1E293B] border-2 border-[#0D9488] rounded-xl p-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-[#0D9488] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Best Value
            </span>
          </div>
          <div className="text-center mb-6 mt-2">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Monthly Audit</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-white">$49</span>
              <span className="text-gray-400">/month</span>
            </div>
            <p className="text-teal-400 text-sm mt-1">Save $150 vs one-time</p>
          </div>
          <ul className="space-y-3 mb-6">
            {[
              'Everything in Full Report',
              'New audit every month',
              'Track ranking progress',
              'Competitor monitoring',
              'Updated action plans',
              'Priority email support',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-gray-300 text-sm">
                <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleCheckout('subscription')}
            disabled={!!loading}
            className="w-full py-3 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30"
          >
            {loading === 'subscription' ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              'Subscribe — $49/month'
            )}
          </button>
        </div>
      </div>

      {/* Trust signals */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm">
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secured by Stripe
        </span>
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          30-day satisfaction guarantee
        </span>
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          PDF delivered instantly
        </span>
      </div>
    </div>
  )
}
