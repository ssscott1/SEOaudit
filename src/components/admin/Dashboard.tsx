'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AnalysisTable from './AnalysisTable'
import UserDetail from './UserDetail'

interface AnalysisRow {
  id: string
  url: string
  email?: string | null
  name?: string | null
  score: number
  paid: boolean
  reportType?: string | null
  paidAt?: string | null
  pdfSent: boolean
  createdAt: string
}

interface Stats {
  total: number
  paid: number
  conversionRate: number
  revenue: number
}

export default function Dashboard() {
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter()

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/data')
      if (res.status === 401) {
        router.push('/admin')
        return
      }
      if (!res.ok) throw new Error('Failed to load data')
      const data = await res.json()
      setAnalyses(data.analyses)
      setStats(data.stats)
    } catch {
      setError('Failed to load dashboard data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  const selectedAnalysis = selectedId ? analyses.find(a => a.id === selectedId) : null

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-slate-50 text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">SEO Audit Pro — CMS</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            Log Out
          </button>
        </div>

        {error && (
          <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Stats tiles */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatTile
              label="Total Analyses"
              value={String(stats.total)}
              icon="📊"
              color="text-slate-50"
            />
            <StatTile
              label="Paid Reports"
              value={String(stats.paid)}
              icon="💳"
              color="text-emerald-400"
            />
            <StatTile
              label="Conversion Rate"
              value={`${stats.conversionRate}%`}
              icon="📈"
              color="text-teal-400"
            />
            <StatTile
              label="Total Revenue"
              value={`$${stats.revenue.toLocaleString()}`}
              icon="💰"
              color="text-amber-400"
            />
          </div>
        )}

        {/* Table */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-slate-50 font-semibold mb-4">All Analyses</h2>
          <AnalysisTable analyses={analyses} onSelect={setSelectedId} />
        </div>
      </div>

      {/* Detail modal */}
      {selectedAnalysis && (
        <UserDetail analysis={selectedAnalysis} onClose={() => setSelectedId(null)} />
      )}
    </div>
  )
}

function StatTile({ label, value, icon, color }: {
  label: string
  value: string
  icon: string
  color: string
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:shadow-lg hover:shadow-teal-900/20 transition-all">
      <div className="text-2xl mb-2">{icon}</div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-slate-500 text-sm mt-1">{label}</p>
    </div>
  )
}
