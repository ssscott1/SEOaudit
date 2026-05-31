'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import FullReport from '@/components/FullReport'
import { Suspense } from 'react'

interface ReportData {
  id: string
  url: string
  score: number
  email: string | null
  name: string | null
  reportType: string | null
  paidAt: string
  report: {
    summary: {
      grade: string
      topWins: string[]
      criticalIssues: string[]
    }
    seoIssues: unknown[]
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
      internalLinks: number
      externalLinks: number
      h1Count: number
      h2Count: number
      hasSchema: boolean
      hasCanonical: boolean
      hasViewport: boolean
      isHttps: boolean
      pageSize: number
      missingAltCount: number
    }
    aiSearchAnalysis: {
      aiScore: number
      aiIssues: unknown[]
      opportunities: string[]
    }
    competitors: {
      suggested: string[]
      gaps: string[]
    }
    actionPlan: {
      month1: unknown[]
      month2: unknown[]
      month3: unknown[]
    }
  }
}

function ReportContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const sessionId = searchParams.get('session_id')

  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retries, setRetries] = useState(0)

  useEffect(() => {
    if (!id) return

    async function fetchReport() {
      try {
        const response = await fetch(`/api/report/${id}`)

        if (response.status === 202) {
          // Report being generated, retry
          if (retries < 10) {
            setTimeout(() => {
              setRetries(r => r + 1)
            }, 3000)
          } else {
            setError('Report is taking longer than expected. Please refresh in a moment.')
            setLoading(false)
          }
          return
        }

        if (response.status === 402) {
          setError('Payment required to view this report.')
          setLoading(false)
          return
        }

        if (!response.ok) {
          const err = await response.json()
          setError(err.error || 'Failed to load report')
          setLoading(false)
          return
        }

        const reportData = await response.json()
        setData(reportData)
        setLoading(false)
      } catch {
        setError('Failed to load report. Please try again.')
        setLoading(false)
      }
    }

    fetchReport()
  }, [id, retries])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-[#334155] border-t-[#0D9488] animate-spin" />
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">
            {sessionId ? 'Generating Your Report...' : 'Loading Report...'}
          </h2>
          <p className="text-gray-400 text-sm">
            {sessionId
              ? 'We\'re running the full AI analysis. This takes about 30-60 seconds.'
              : 'Fetching your report data...'}
          </p>
          {retries > 0 && (
            <p className="text-teal-400 text-xs mt-3">
              Still working... ({retries}/10)
            </p>
          )}
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
          <h2 className="text-white text-xl font-semibold mb-2">Report Not Available</h2>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <a href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#0D9488] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-white font-bold">SEO Audit Pro</span>
            </a>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 hidden sm:block">
                {data.reportType === 'subscription' ? 'Monthly Audit' : 'Full Report'}
              </span>
              <span className="w-2 h-2 bg-teal-400 rounded-full" />
              <span className="text-teal-400 text-xs font-medium">Paid</span>
            </div>
          </div>
        </div>
      </nav>

      {sessionId && (
        <div className="bg-teal-900/30 border-b border-teal-800 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <svg className="w-5 h-5 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-teal-300 text-sm">
              Payment successful! Your full report is ready.
              {data.email && ` A PDF copy has been emailed to ${data.email}.`}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <FullReport
          reportId={id}
          url={data.url}
          score={data.score}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          report={data.report as any}
        />
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#334155] border-t-[#0D9488] rounded-full animate-spin" />
      </div>
    }>
      <ReportContent />
    </Suspense>
  )
}
