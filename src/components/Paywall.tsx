'use client'

import { useState } from 'react'

interface PaywallProps {
  analysisId: string
  url: string
  score: number
  totalIssues: number
}

export default function Paywall({ analysisId, totalIssues }: PaywallProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState<'one-time' | 'subscription' | null>(null)
  const [error, setError] = useState('')

  const handleCheckout = async (type: 'one-time' | 'subscription') => {
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setError('')
    setLoading(type)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId, email, name, type }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create checkout session')
        setLoading(null)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  const hiddenIssues = Math.max(0, totalIssues - 3)

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-teal-900/50 overflow-hidden">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-teal-900/50 to-teal-800/30 px-6 py-5 border-b border-teal-800/50">
        <h2 className="text-slate-50 text-2xl font-bold mb-1">
          Unlock Your Full SEO Report
        </h2>
        <p className="text-teal-300 text-sm">
          {hiddenIssues > 0
            ? `${hiddenIssues} more issues found — see every problem + exact fix instructions`
            : 'Get detailed fix instructions, AI search analysis & 90-day action plan'}
        </p>
      </div>

      <div className="p-6">
        {/* What you get */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { icon: '📋', title: `All ${totalIssues} Issues`, desc: 'Full prioritised list with exact fix instructions' },
            { icon: '🤖', title: 'AI Search Score', desc: 'ChatGPT, Perplexity & Google AI readiness' },
            { icon: '📅', title: '90-Day Plan', desc: 'Month-by-month action roadmap + competitor gaps' },
          ].map(f => (
            <div key={f.title} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="text-slate-50 font-semibold text-sm">{f.title}</p>
              <p className="text-slate-400 text-xs mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Email input */}
        <div className="space-y-3 mb-6">
          <div>
            <label className="text-slate-400 text-sm mb-1.5 block">Your name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-50 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-slate-400 text-sm mb-1.5 block">
              Email address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                setError('')
              }}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-50 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* CTA buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleCheckout('one-time')}
            disabled={loading !== null}
            className="relative flex flex-col items-center justify-center p-5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl transition-all hover:shadow-lg hover:shadow-teal-900/40 group"
          >
            {loading === 'one-time' ? (
              <LoadingSpinner />
            ) : (
              <>
                <span className="text-white font-bold text-xl">$199</span>
                <span className="text-teal-100 text-sm font-medium">One-Time Report</span>
                <span className="text-teal-200/70 text-xs mt-1">Pay once, keep forever</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleCheckout('subscription')}
            disabled={loading !== null}
            className="relative flex flex-col items-center justify-center p-5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl border border-slate-600 transition-all hover:shadow-lg hover:border-teal-700 group"
          >
            {loading === 'subscription' ? (
              <LoadingSpinner />
            ) : (
              <>
                <span className="text-slate-50 font-bold text-xl">$49<span className="text-slate-400 text-sm font-normal">/mo</span></span>
                <span className="text-slate-200 text-sm font-medium">Monthly Audit</span>
                <span className="text-slate-400 text-xs mt-1">Fresh audit every month</span>
              </>
            )}
          </button>
        </div>

        <p className="text-slate-500 text-xs text-center mt-4">
          Secure payment via Stripe · Report emailed as PDF · Cancel anytime (monthly)
        </p>
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
