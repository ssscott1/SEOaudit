'use client'

import ScoreGauge from './ScoreGauge'

interface Issue {
  id: string
  severity: 'critical' | 'warning' | 'info'
  category: string
  title: string
  description: string
  fix: string
}

interface FreeResultsProps {
  score: number
  freeIssues: Issue[]
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
  totalIssues: number
  url: string
}

const severityConfig = {
  critical: {
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    badge: 'bg-red-400/20 text-red-400',
    label: 'Critical',
  },
  warning: {
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    badge: 'bg-amber-400/20 text-amber-400',
    label: 'Warning',
  },
  info: {
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/30',
    badge: 'bg-blue-400/20 text-blue-400',
    label: 'Info',
  },
}

export default function FreeResults({
  score,
  freeIssues,
  categories,
  metadata,
  totalIssues,
  url,
}: FreeResultsProps) {
  const hiddenIssues = Math.max(0, totalIssues - freeIssues.length)

  return (
    <div className="space-y-8">
      {/* Score + Category breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Big score */}
        <div className="md:col-span-1 bg-slate-800 rounded-xl p-6 flex flex-col items-center justify-center border border-slate-700">
          <p className="text-slate-400 text-sm mb-4 font-medium">Overall SEO Score</p>
          <ScoreGauge score={score} size="lg" />
          <p className="text-slate-500 text-xs mt-4 text-center break-all">{url}</p>
        </div>

        {/* Category scores + metadata */}
        <div className="md:col-span-2 space-y-4">
          {/* Category bars */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-slate-50 font-semibold mb-4">Score Breakdown</h3>
            <div className="space-y-3">
              {(Object.entries(categories) as [string, number][]).map(([cat, catScore]) => (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400 text-sm capitalize">{cat}</span>
                    <span className="text-slate-50 text-sm font-medium">{catScore}/100</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${catScore}%`,
                        backgroundColor: catScore >= 70 ? '#10b981' : catScore >= 40 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile label="Word Count" value={String(metadata.wordCount)} ok={metadata.wordCount >= 600} />
            <StatTile label="Images" value={String(metadata.imageCount)} ok />
            <StatTile label="HTTPS" value={metadata.isHttps ? 'Yes' : 'No'} ok={metadata.isHttps} />
            <StatTile label="Schema" value={metadata.hasSchema ? 'Found' : 'Missing'} ok={metadata.hasSchema} />
          </div>
        </div>
      </div>

      {/* Free Issues */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-50 text-xl font-bold">Top Issues Found</h2>
          <span className="text-slate-400 text-sm">{totalIssues} issues total</span>
        </div>

        <div className="space-y-4">
          {freeIssues.map(issue => {
            const cfg = severityConfig[issue.severity]
            return (
              <div
                key={issue.id}
                className={`rounded-xl p-5 border ${cfg.bg} ${cfg.border} hover:shadow-lg transition-all`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className={`font-semibold ${cfg.color}`}>{issue.title}</h3>
                  <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-3">{issue.description}</p>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wide">Fix: </span>
                  <span className="text-slate-300 text-sm">{issue.fix}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Locked issues teaser */}
        {hiddenIssues > 0 && (
          <div className="mt-4 relative">
            {/* Blurred locked cards */}
            {[...Array(Math.min(3, hiddenIssues))].map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-5 border border-slate-700 bg-slate-800/50 mb-3 blur-sm select-none"
                style={{ opacity: 1 - i * 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-slate-700 rounded w-48" />
                  <div className="h-6 bg-slate-700 rounded-full w-16" />
                </div>
                <div className="h-3 bg-slate-700 rounded w-full mb-2" />
                <div className="h-3 bg-slate-700 rounded w-3/4" />
              </div>
            ))}
            {/* Lock overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-slate-900/95 border border-slate-700 rounded-xl px-6 py-4 text-center shadow-2xl">
                <div className="text-2xl mb-2">🔒</div>
                <p className="text-slate-50 font-semibold">{hiddenIssues} more issues hidden</p>
                <p className="text-slate-400 text-sm">Unlock the full report to see all issues + fixes</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatTile({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center">
      <p className={`text-lg font-bold ${ok ? 'text-emerald-400' : 'text-red-400'}`}>{value}</p>
      <p className="text-slate-500 text-xs mt-1">{label}</p>
    </div>
  )
}
