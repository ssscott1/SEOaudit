'use client'

interface AnalysisDetail {
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

interface UserDetailProps {
  analysis: AnalysisDetail
  onClose: () => void
}

export default function UserDetail({ analysis, onClose }: UserDetailProps) {
  const revenue = analysis.paid
    ? analysis.reportType === 'one-time' ? '$199' : analysis.reportType === 'subscription' ? '$49/mo' : '$0'
    : '$0'

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-slate-50 font-bold text-lg">Analysis Detail</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-50 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Score" value={String(analysis.score)} valueClass={analysis.score >= 70 ? 'text-emerald-400' : analysis.score >= 40 ? 'text-amber-400' : 'text-red-400'} />
            <InfoField label="Status" value={analysis.paid ? 'Paid' : 'Free'} valueClass={analysis.paid ? 'text-emerald-400' : 'text-slate-400'} />
            <InfoField label="Revenue" value={revenue} valueClass="text-teal-400" />
            <InfoField label="Type" value={analysis.reportType || 'N/A'} />
            <InfoField label="PDF Sent" value={analysis.pdfSent ? 'Yes' : 'No'} valueClass={analysis.pdfSent ? 'text-emerald-400' : 'text-slate-400'} />
            <InfoField label="Created" value={new Date(analysis.createdAt).toLocaleDateString('en-AU')} />
          </div>

          <div className="space-y-3">
            <InfoField label="URL" value={analysis.url} valueClass="text-teal-400 break-all text-sm" />
            {analysis.email && <InfoField label="Email" value={analysis.email} />}
            {analysis.name && <InfoField label="Name" value={analysis.name} />}
            {analysis.paidAt && (
              <InfoField label="Paid At" value={new Date(analysis.paidAt).toLocaleString('en-AU')} />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          {analysis.paid && (
            <a
              href={`/report/${analysis.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              View Report
            </a>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoField({ label, value, valueClass = 'text-slate-200' }: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div>
      <p className="text-slate-500 text-xs mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${valueClass}`}>{value}</p>
    </div>
  )
}
