'use client'

import { useState } from 'react'

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

interface AnalysisTableProps {
  analyses: AnalysisRow[]
  onSelect: (id: string) => void
}

function downloadCSV(data: AnalysisRow[]) {
  const headers = ['ID', 'URL', 'Email', 'Name', 'Score', 'Paid', 'Type', 'Paid At', 'PDF Sent', 'Created At']
  const rows = data.map(a => [
    a.id,
    a.url,
    a.email || '',
    a.name || '',
    a.score,
    a.paid ? 'Yes' : 'No',
    a.reportType || '',
    a.paidAt ? new Date(a.paidAt).toISOString() : '',
    a.pdfSent ? 'Yes' : 'No',
    new Date(a.createdAt).toISOString(),
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `seo-audit-analyses-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function AnalysisTable({ analyses, onSelect }: AnalysisTableProps) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<keyof AnalysisRow>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all')

  const filtered = analyses
    .filter(a => {
      const q = search.toLowerCase()
      const matchSearch = !q || a.url.toLowerCase().includes(q) || (a.email || '').toLowerCase().includes(q) || (a.name || '').toLowerCase().includes(q)
      const matchPaid = filterPaid === 'all' || (filterPaid === 'paid' ? a.paid : !a.paid)
      return matchSearch && matchPaid
    })
    .sort((a, b) => {
      const av = a[sortField]
      const bv = b[sortField]
      const dir = sortDir === 'asc' ? 1 : -1
      if (av === null || av === undefined) return dir
      if (bv === null || bv === undefined) return -dir
      if (typeof av === 'string' && typeof bv === 'string') return dir * av.localeCompare(bv)
      if (typeof av === 'number' && typeof bv === 'number') return dir * (av - bv)
      if (typeof av === 'boolean' && typeof bv === 'boolean') return dir * (Number(av) - Number(bv))
      return 0
    })

  const handleSort = (field: keyof AnalysisRow) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ field }: { field: keyof AnalysisRow }) => {
    if (sortField !== field) return <span className="text-slate-600 ml-1">↕</span>
    return <span className="text-teal-400 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search URL, email, name..."
          className="flex-1 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-50 placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm"
        />
        <select
          value={filterPaid}
          onChange={e => setFilterPaid(e.target.value as 'all' | 'paid' | 'unpaid')}
          className="px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-50 focus:outline-none focus:border-teal-500 text-sm"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid Only</option>
          <option value="unpaid">Unpaid Only</option>
        </select>
        <button
          onClick={() => downloadCSV(filtered)}
          className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        >
          Export CSV
        </button>
      </div>

      <p className="text-slate-500 text-xs">{filtered.length} records</p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-700">
              {([
                { key: 'createdAt', label: 'Date' },
                { key: 'url', label: 'URL' },
                { key: 'email', label: 'Email' },
                { key: 'score', label: 'Score' },
                { key: 'paid', label: 'Paid' },
                { key: 'reportType', label: 'Type' },
              ] as const).map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left text-slate-400 font-medium cursor-pointer hover:text-slate-200 select-none"
                >
                  {col.label}<SortIcon field={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr
                key={row.id}
                onClick={() => onSelect(row.id)}
                className={`border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/30 transition-colors ${i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}
              >
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                  {new Date(row.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit' })}
                </td>
                <td className="px-4 py-3 text-teal-400 max-w-xs truncate">
                  <span title={row.url}>{row.url.replace(/^https?:\/\//, '')}</span>
                </td>
                <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                  {row.email || <span className="text-slate-600">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`font-bold ${row.score >= 70 ? 'text-emerald-400' : row.score >= 40 ? 'text-amber-400' : 'text-red-400'}`}
                  >
                    {row.score}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${row.paid ? 'bg-emerald-400/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                    {row.paid ? 'Paid' : 'Free'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 capitalize">
                  {row.reportType || <span className="text-slate-600">—</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
