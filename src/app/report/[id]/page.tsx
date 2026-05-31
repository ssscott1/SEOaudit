'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import FullReport from '@/components/FullReport'
import { Suspense } from 'react'

interface ReportData {
  id: string
  url: string
  score: number
  email?: string
  name?: string
  reportType?: string
  createdAt: string
  paidAt?: string
  allIssues: Array<{
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
  aiAnalysis?: {
    aiScore: number
    aiIssues: Array<{
      id: string
      severity: 'critical' | 'warning' | 'info'
      title: string
      description: string
      fix: string
    }>
    competitors: Array<{
      name: string
      url: string
      strengths: string[]
      contentGaps: string[]
    }>
    actionPlan: {
      month1: string[]
      month2: string[]
      month3: string[]
    }
  }
}

function ReportContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const isSuccess = searchParams.get('success') === 'true'

  const [status, setStatus] = useState<'loading' | 'done' | 'error' | 'pending'>('loading')
  const [data, setData] = useState<ReportData | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!id) {
      setErrorMsg('Invalid report ID')
      setStatus('error')
      return
    }

    let cancelled = false
    let retryTimeout: ReturnType<typeof setTimeout>

    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/report/${id}`)

        if (cancelled) return

        if (res.status === 402) {
          setErrorMsg('This report requires payment. Please complete checkout first.')
          setStatus('error')
          return
        }

        if (res.status === 202) {
          // Report is being generated
          setStatus('pending')
          if (retryCount < 10) {
            retryTimeout = setTimeout(() => {
              if (!cancelled) {
                setRetryCount(c => c + 1)
              }
            }, 3000)
          } else {
            setErrorMsg('Report generation is taking longer than expected. Please refresh in a minute.')
            setStatus('error')
          }
          return
        }

        if (!res.ok) {
          const json = await res.json()
          setErrorMsg(json.error || 'Failed to load report')
          setStatus('error')
          return
        }

        const json = await res.json()
        setData(json)
        setStatus('done')
      } catch {
        if (!cancelled) {
          setErrorMsg('Network error. Please refresh the page.')
          setStatus('error')
        }
      }
    }

    fetchReport()

    return () => {
      cancelled = true
      clearTimeout(retryTimeout)
    }
  }, [id, retryCount])

  if (status === 'loading' || status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-700 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-teal-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <div className="text-center">
          {isSuccess && status === 'loading' ? (
            <>
              <p className="text-slate-50 text-xl font-semibold mb-2">Payment confirmed!</p>
              <p className="text-slate-400 text-sm">Generating your full report... This may take 30–60 seconds.</p>
            </>
          ) : (
            <>
              <p className="text-slate-50 text-xl font-semibold mb-2">Loading your report...</p>
              <p className="text-slate-400 text-sm">
                {status === 'pending' ? 'AI analysis in progress, please wait...' : 'Fetching report data...'}
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="text-slate-50 text-xl font-semibold mb-2">Report Not Available</p>
          <p className="text-slate-400 text-sm max-w-md">{errorMsg}</p>
        </div>
        <a href="/" className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium transition-all">
          Return Home
        </a>
      </div>
    )
  }

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

      {isSuccess && (
        <div className="bg-emerald-900/30 border-b border-emerald-800/50 px-6 py-3 text-center">
          <p className="text-emerald-400 text-sm font-medium">
            Payment successful! Your full report is below. A PDF has been sent to your email.
          </p>
        </div>
      )}

      <main className="px-6 py-10 max-w-5xl mx-auto">
        {data && <FullReport data={data} />}
      </main>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 rounded-full border-t-transparent animate-spin" />
      </div>
    }>
      <ReportContent />
    </Suspense>
  )
}
