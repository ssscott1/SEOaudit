'use client'

import { useState } from 'react'
import UserDetail from './UserDetail'

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

interface AnalysisTableProps {
  analyses: Analysis[]
  loading: boolean
  total: number
  page: number
  onPageChange: (page: number) => void
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-400 bg-green-900/30 border-green-800'
    : score >= 60 ? 'text-yellow-400 bg-yellow-900/30 border-yellow-800'
    : score >= 40 ? 'text-orange-400 bg-orange-900/30 border-orange-800'
    : 'text-red-400 bg-red-900/30 border-red-800'

  return (
    <span className={`text-xs font-bold px-2 py-1 rounded border ${color}`}>
      {score}
    </span>
  )
}

export default function AnalysisTable({ analyses, loading, total, page, onPageChange }: AnalysisTableProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null)
  const limit = 20
  const totalPages = Math.ceil(total / limit)

  if (selectedAnalysis) {
    return <UserDetail analysis={selectedAnalysis} onBack={() => setSelectedAnalysis(null)} />
  }

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#334155]">
              <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-4 py-3">URL</th>
              <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-4 py-3">Email</th>
              <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-4 py-3">Score</th>
              <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-4 py-3">Type</th>
              <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-4 py-3">Revenue</th>
              <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-4 py-3">Date</th>
              <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[#334155]">
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-[#334155] rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : analyses.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  No analyses found
                </td>
              </tr>
            ) : (
              analyses.map((analysis) => (
                <tr
                  key={analysis.id}
                  className="border-b border-[#334155] hover:bg-[#0F172A] cursor-pointer transition-colors"
                  onClick={() => setSelectedAnalysis(analysis)}
                >
                  <td className="px-4 py-3">
                    <p className="text-teal-400 text-sm font-medium truncate max-w-[200px]">
                      {analysis.url.replace('https://', '').replace('http://', '')}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-300 text-sm truncate max-w-[150px]">
                      {analysis.email || <span className="text-gray-600">—</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBadge score={analysis.score} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      analysis.paid
                        ? 'text-green-400 bg-green-900/30 border border-green-800'
                        : 'text-gray-400 bg-[#334155]/50 border border-[#334155]'
                    }`}>
                      {analysis.paid ? 'Paid' : 'Free'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-sm capitalize">
                      {analysis.reportType || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${analysis.paid ? 'text-green-400' : 'text-gray-600'}`}>
                      {analysis.paid
                        ? `$${analysis.reportType === 'one-time' ? '199' : '49'}`
                        : '$0'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-sm">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#334155]">
          <p className="text-gray-400 text-sm">
            Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white disabled:opacity-40 bg-[#0F172A] border border-[#334155] rounded-lg transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white disabled:opacity-40 bg-[#0F172A] border border-[#334155] rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
