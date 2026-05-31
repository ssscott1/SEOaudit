'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import FreeResults from '@/components/FreeResults'
import Paywall from '@/components/Paywall'
import { Suspense } from 'react'

interface AnalyzeResult {
  id: string
  score: number
  freeIssues: Array<{
    id: string
    severity: 'critical' | 'warning' | 'info'
    category: string
    title: string
    description: string
    fix: string
  }>
  categories: {
    technical: number
    content: number
    social: number
    performance: number
  }
  metadata: {
    title: string
    description: string
    wordCount: number
    imageCount: number
    url: string
    h1Count: number
    h2Count: number
    internalLinks: number
    externalLinks: number
    hasSchema: boolean
    hasCanonical: boolean
    isHttps: boolean
  }
  totalIssues: number
}

function AnalyzeContent() {
  const searchParams = useSearchParams()
  const urlParam = searchParams.get('url') || ''

  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!urlParam) {
      setErrorMsg('No URL provided.')
      setStatus('error')
      return
    }

    let cancelled = false

    const run = async () => {
      setStatus('loading')
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlParam }),
        })

        if (cancelled) return

        const data = await res.json()

        if (!res.ok) {
          setErrorMsg(data.error || 'Analysis failed. Please try again.')
          setStatus('error')
          return
        }

        setResult(data)
        setStatus('done')
      } catch {
        if (!cancelled) {
          setErrorMsg('Network error. Please check your connection and try again.')
          setStatus('error')
        }
      }
    }

    run()

    return () => { cancelled = true }
  }, [urlParam])

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-slate-50 font-bold text-lg hover:text-teal-400 transition-colors">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            SEO Audit Pro
          </a>
        </div>
      </nav>

      <main className="px-6 py-10 max-w-5xl mx-auto">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-slate-700 rounded-full" />
              <div className="absolute inset-0 w-20 h-20 border-4 border-teal-500 rounded-full border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-slate-50 text-xl font-semibold mb-2">Analysing your website...</p>
              <p className="text-slate-400 text-sm">Scanning 50+ SEO signals · Usually takes 10–20 seconds</p>
              <p className="text-teal-400 text-sm mt-2 break-all">{urlParam}</p>
            </div>
            <div className="flex flex-col gap-2 mt-4 w-full max-w-sm">
              {[
                'Fetching page content...',
                'Checking title & meta tags...',
                'Analysing headings & structure...',
                'Checking technical SEO...',
                'Calculating scores...',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-900/50 border border-teal-700 flex items-center justify-center">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                  </div>
                  <span className="text-slate-400 text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
            <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-50 text-xl font-semibold mb-2">Analysis Failed</p>
              <p className="text-slate-400 text-sm max-w-md">{errorMsg}</p>
            </div>
            <a
              href="/"
              className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium transition-all"
            >
              Try Another URL
            </a>
          </div>
        )}

        {status === 'done' && result && (
          <div className="space-y-10">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-slate-50 text-2xl font-bold">SEO Analysis Results</h1>
                <p className="text-slate-400 text-sm mt-1 break-all">{urlParam}</p>
              </div>
              <a
                href="/"
                className="text-slate-400 hover:text-slate-50 text-sm flex items-center gap-1 transition-colors"
              >
                ← Analyse another URL
              </a>
            </div>

            <FreeResults
              score={result.score}
              freeIssues={result.freeIssues}
              categories={result.categories}
              metadata={result.metadata}
              totalIssues={result.totalIssues}
              url={urlParam}
            />

            <Paywall
              analysisId={result.id}
              url={urlParam}
              score={result.score}
              totalIssues={result.totalIssues}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 rounded-full border-t-transparent animate-spin" />
      </div>
    }>
      <AnalyzeContent />
    </Suspense>
  )
}
