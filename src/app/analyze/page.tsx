'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import FreeResults from '@/components/FreeResults'
import Paywall from '@/components/Paywall'

interface Issue {
  id: string
  severity: 'critical' | 'warning' | 'info'
  category: string
  title: string
  description: string
  fix: string
  impact: number
}

interface AnalysisData {
  id: string
  score: number
  top3Issues: Issue[]
  categories: {
    technical: { score: number; maxScore: number; label: string }
    content: { score: number; maxScore: number; label: string }
    performance: { score: number; maxScore: number; label: string }
    social: { score: number; maxScore: number; label: string }
  }
  metadata: {
    title: string
    description: string
    wordCount: number
    imageCount: number
    linkCount: number
  }
}

function AnalyzeContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const cancelled = searchParams.get('cancelled')

  const [data, setData] = useState<AnalysisData | null>(null)
  const [url, setUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setError('No analysis ID found. Please go back and analyze a URL.')
      setLoading(false)
      return
    }

    // Try to get data from localStorage first (stored after API call from home page)
    // Then fetch from API if needed
    async function fetchData() {
      try {
        // The analysis was already done on home page; we just need to display it
        // We'll fetch from a lightweight endpoint or rely on the stored data
        // For simplicity, we store analysis data in localStorage on the home page
        const stored = localStorage.getItem(`analysis_${id}`)
        if (stored) {
          const parsed = JSON.parse(stored)
          setData(parsed)
          setUrl(parsed.url || '')
          setLoading(false)
          return
        }

        // Fallback: if no stored data, show a message
        setError('Analysis data not found. Please analyze your URL again.')
        setLoading(false)
      } catch {
        setError('Failed to load analysis data.')
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-[#334155] border-t-[#0D9488] animate-spin" />
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Analyzing Your Site...</h2>
          <p className="text-gray-400 text-sm">Scanning 50+ SEO signals</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-900/30 border border-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Nav */}
      <nav className="border-b border-[#334155] sticky top-0 bg-[#0F172A]/95 backdrop-blur-sm z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <a href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#0D9488] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-white font-bold">SEO Audit Pro</span>
            </a>
            <a
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              New Analysis
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {cancelled && (
          <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-800 rounded-xl text-yellow-400 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Payment cancelled. Your free analysis is still here. Upgrade when you&apos;re ready.
          </div>
        )}

        {/* Free Results */}
        <div className="mb-12">
          <FreeResults
            score={data.score}
            top3Issues={data.top3Issues}
            url={url}
            metadata={data.metadata}
          />
        </div>

        {/* Paywall */}
        <div className="border-t border-[#334155] pt-12">
          <Paywall analysisId={data.id} />
        </div>
      </div>
    </div>
  )
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#334155] border-t-[#0D9488] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <AnalyzeContent />
    </Suspense>
  )
}
