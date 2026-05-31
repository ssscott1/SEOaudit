'use client'

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

interface UserDetailProps {
  analysis: Analysis
  onBack: () => void
}

export default function UserDetail({ analysis, onBack }: UserDetailProps) {
  const scoreColor = analysis.score >= 80 ? 'text-green-400'
    : analysis.score >= 60 ? 'text-yellow-400'
    : analysis.score >= 40 ? 'text-orange-400'
    : 'text-red-400'

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-[#334155]">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to list
        </button>
        <div className="flex-1">
          <p className="text-teal-400 font-medium">{analysis.url}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded border ${
          analysis.paid
            ? 'text-green-400 bg-green-900/30 border-green-800'
            : 'text-gray-400 bg-[#334155]/50 border-[#334155]'
        }`}>
          {analysis.paid ? 'Paid' : 'Free'}
        </span>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0F172A] rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-2">SEO Score</p>
            <p className={`text-4xl font-bold ${scoreColor}`}>{analysis.score}</p>
            <p className="text-gray-500 text-xs mt-1">out of 100</p>
          </div>
          <div className="bg-[#0F172A] rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-2">Revenue</p>
            <p className="text-4xl font-bold text-white">
              {analysis.paid ? `$${analysis.reportType === 'one-time' ? '199' : '49'}` : '$0'}
            </p>
            <p className="text-gray-500 text-xs mt-1">{analysis.reportType || 'Not purchased'}</p>
          </div>
          <div className="bg-[#0F172A] rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-2">PDF Sent</p>
            <p className={`text-2xl font-bold ${analysis.pdfSent ? 'text-green-400' : 'text-gray-600'}`}>
              {analysis.pdfSent ? 'Yes' : 'No'}
            </p>
          </div>
          <div className="bg-[#0F172A] rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-2">Analyzed</p>
            <p className="text-lg font-bold text-white">
              {new Date(analysis.createdAt).toLocaleDateString()}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {new Date(analysis.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0F172A] rounded-xl p-5">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">Customer Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Name</p>
                <p className="text-white">{analysis.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <p className="text-teal-400">{analysis.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">URL Analyzed</p>
                <p className="text-white text-sm break-all">{analysis.url}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0F172A] rounded-xl p-5">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">Payment Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Status</p>
                <span className={`text-sm font-medium ${analysis.paid ? 'text-green-400' : 'text-gray-400'}`}>
                  {analysis.paid ? 'Paid' : 'Not Purchased'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Report Type</p>
                <p className="text-white capitalize">{analysis.reportType || '—'}</p>
              </div>
              {analysis.paidAt && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Paid At</p>
                  <p className="text-white">{new Date(analysis.paidAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {analysis.paid && (
            <a
              href={`/report/${analysis.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Report
            </a>
          )}
          {analysis.paid && (
            <a
              href={`/api/pdf/${analysis.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] border border-[#334155] hover:border-[#0D9488] text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
