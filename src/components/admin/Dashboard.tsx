'use client'

import { useState, useEffect, useCallback } from 'react'
import AnalysisTable from './AnalysisTable'

interface Stats {
  total: number
  paid: number
  conversionRate: string
  totalRevenue: number
}

interface Analysis {
  id: string
  url: string
  email: string | null
  name: string | null
  score: number
  paid: boolean
  paidAt: string | null
  reportType: string | null
  pdfSent: boolean
  createdAt: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [paidFilter, setPaidFilter] = useState<string>('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      })
      if (search) params.set('search', search)
      if (paidFilter) params.set('paid', paidFilter)

      const response = await fetch(`/api/admin/data?${params}`)
      if (response.status === 401) {
        window.location.href = '/admin'
        return
      }
      const data = await response.json()
      setStats(data.stats)
      setAnalyses(data.analyses)
      setTotal(data.total)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, paidFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin'
  }

  const handleExportCSV = () => {
    const headers = ['ID', 'URL', 'Email', 'Name', 'Score', 'Paid', 'Type', 'Revenue', 'Date']
    const rows = analyses.map(a => [
      a.id,
      a.url,
      a.email || '',
      a.name || '',
      a.score,
      a.paid ? 'Yes' : 'No',
      a.reportType || '',
      a.paid ? (a.reportType === 'one-time' ? 199 : 49) : 0,
      new Date(a.createdAt).toLocaleDateString(),
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seo-audit-data-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Top nav */}
      <div className="bg-[#1E293B] border-b border-[#334155]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#0D9488] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg">SEO Audit Pro</span>
              <span className="text-gray-500 text-sm">/ Admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats tiles */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-1">Total Analyses</p>
              <p className="text-3xl font-bold text-white">{stats.total.toLocaleString()}</p>
            </div>
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-1">Paid Reports</p>
              <p className="text-3xl font-bold text-teal-400">{stats.paid.toLocaleString()}</p>
            </div>
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-1">Conversion Rate</p>
              <p className="text-3xl font-bold text-white">{stats.conversionRate}%</p>
            </div>
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-400">${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Filters and search */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by URL, email, or name..."
                className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0D9488] text-sm transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={paidFilter}
                onChange={(e) => { setPaidFilter(e.target.value); setPage(1) }}
                className="px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-lg text-white text-sm focus:outline-none focus:border-[#0D9488] transition-colors"
              >
                <option value="">All Status</option>
                <option value="true">Paid</option>
                <option value="false">Free</option>
              </select>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <AnalysisTable
          analyses={analyses}
          loading={loading}
          total={total}
          page={page}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}
