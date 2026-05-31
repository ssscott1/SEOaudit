'use client'

import ScoreGauge from './ScoreGauge'

interface Issue {
  id: string
  severity: 'critical' | 'warning' | 'info'
  category: string
  title: string
  description: string
  fix: string
  impact: number
}

interface FreeResultsProps {
  score: number
  top3Issues: Issue[]
  url: string
  metadata?: {
    title: string
    description: string
    wordCount: number
    imageCount: number
    linkCount: number
  }
}

const severityConfig = {
  critical: {
    label: 'Critical',
    bg: 'bg-red-900/30',
    border: 'border-red-800',
    text: 'text-red-400',
    icon: '🔴',
    dot: 'bg-red-500',
  },
  warning: {
    label: 'Warning',
    bg: 'bg-yellow-900/30',
    border: 'border-yellow-800',
    text: 'text-yellow-400',
    icon: '🟡',
    dot: 'bg-yellow-500',
  },
  info: {
    label: 'Info',
    bg: 'bg-blue-900/30',
    border: 'border-blue-800',
    text: 'text-blue-400',
    icon: '🔵',
    dot: 'bg-blue-500',
  },
}

export default function FreeResults({ score, top3Issues, url, metadata }: FreeResultsProps) {
  const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Work' : 'Poor'

  return (
    <div className="space-y-8">
      {/* Score Section */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-8">
        <div className="text-center mb-2">
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">SEO Score for</p>
          <p className="text-teal-400 font-mono text-sm truncate max-w-md mx-auto">{url}</p>
        </div>
        <div className="flex flex-col items-center py-4">
          <ScoreGauge score={score} size="lg" />
          <p className="mt-4 text-xl font-semibold text-white">{scoreLabel}</p>
          <p className="text-gray-400 text-sm mt-1">
            {score < 50
              ? 'Significant improvements needed to rank effectively'
              : score < 70
              ? 'Some important issues are holding you back'
              : 'Good foundation — optimize further to dominate'}
          </p>
        </div>

        {/* Quick stats */}
        {metadata && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#334155]">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{metadata.wordCount}</p>
              <p className="text-xs text-gray-400 mt-1">Words</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{metadata.imageCount}</p>
              <p className="text-xs text-gray-400 mt-1">Images</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{metadata.linkCount}</p>
              <p className="text-xs text-gray-400 mt-1">Links</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{top3Issues.length > 0 ? top3Issues[0].severity === 'critical' ? '⚠️' : '✓' : '✓'}</p>
              <p className="text-xs text-gray-400 mt-1">Health</p>
            </div>
          </div>
        )}
      </div>

      {/* Top 3 Issues */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Top 3 Issues Found</h2>
          <span className="text-xs text-gray-400 bg-[#1E293B] px-3 py-1 rounded-full border border-[#334155]">
            Free Preview
          </span>
        </div>
        <div className="space-y-4">
          {top3Issues.length === 0 ? (
            <div className="bg-green-900/30 border border-green-800 rounded-xl p-6 text-center">
              <p className="text-green-400 text-lg font-semibold">Great job!</p>
              <p className="text-gray-400 mt-1">No critical issues found. Get the full report to see optimization opportunities.</p>
            </div>
          ) : (
            top3Issues.map((issue, index) => {
              const config = severityConfig[issue.severity]
              return (
                <div
                  key={issue.id}
                  className={`${config.bg} border ${config.border} rounded-xl p-6 transition-all hover:scale-[1.01]`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-sm font-bold text-gray-400 border border-[#334155]">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${config.text} bg-[#0F172A] px-2 py-0.5 rounded`}>
                          {config.label}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">{issue.category}</span>
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-1">{issue.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{issue.description}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Locked issues teaser */}
      <div className="relative">
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden">
          <div className="p-6 blur-sm select-none pointer-events-none">
            {[
              { title: 'Missing Schema Markup', severity: 'warning' },
              { title: 'Images Without Alt Text', severity: 'warning' },
              { title: 'Slow Page Load Speed', severity: 'critical' },
              { title: 'No Open Graph Tags', severity: 'warning' },
              { title: 'Thin Content Pages', severity: 'critical' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 py-3 ${i > 0 ? 'border-t border-[#334155]' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${item.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                <span className="text-gray-300">{item.title}</span>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-[#0F172A]/90 backdrop-blur-sm rounded-xl p-6 border border-[#334155]">
              <div className="text-4xl mb-3">🔒</div>
              <p className="text-white font-bold text-lg">5+ More Issues Found</p>
              <p className="text-gray-400 text-sm mt-1">Unlock the full report to see all issues with fixes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
