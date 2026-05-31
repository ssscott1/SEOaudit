'use client'

import { useState } from 'react'
import ScoreGauge from './ScoreGauge'

interface Issue {
  id: string
  severity: 'critical' | 'warning' | 'info'
  category: string
  title: string
  description: string
  fix: string
}

interface AIIssue {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  fix: string
}

interface Competitor {
  name: string
  url: string
  strengths: string[]
  contentGaps: string[]
}

interface ActionPlan {
  month1: string[]
  month2: string[]
  month3: string[]
}

interface ReportData {
  id: string
  url: string
  score: number
  email?: string
  name?: string
  reportType?: string
  createdAt: string
  paidAt?: string
  allIssues: Issue[]
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
    aiIssues: AIIssue[]
    competitors: Competitor[]
    actionPlan: ActionPlan
  }
}

const TABS = ['Overview', 'SEO Issues', 'AI Search', 'Competitors', 'Action Plan'] as const
type Tab = typeof TABS[number]

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

export default function FullReport({ data }: { data: ReportData }) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')

  return (
    <div className="space-y-6">
      {/* Report header */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-slate-50 text-2xl font-bold mb-1">SEO Audit Report</h1>
            <p className="text-teal-400 text-sm break-all">{data.url}</p>
            <p className="text-slate-500 text-xs mt-1">
              Generated {new Date(data.createdAt).toLocaleDateString('en-AU', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
              {data.name && ` · ${data.name}`}
            </p>
          </div>
          <a
            href={`/api/pdf/${data.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-teal-900/20 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-fit px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-50 hover:bg-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'Overview' && <OverviewTab data={data} />}
        {activeTab === 'SEO Issues' && <SEOIssuesTab issues={data.allIssues} />}
        {activeTab === 'AI Search' && <AISearchTab aiAnalysis={data.aiAnalysis} />}
        {activeTab === 'Competitors' && <CompetitorsTab competitors={data.aiAnalysis?.competitors} />}
        {activeTab === 'Action Plan' && <ActionPlanTab actionPlan={data.aiAnalysis?.actionPlan} />}
      </div>
    </div>
  )
}

function OverviewTab({ data }: { data: ReportData }) {
  const critical = data.allIssues.filter(i => i.severity === 'critical').length
  const warnings = data.allIssues.filter(i => i.severity === 'warning').length
  const info = data.allIssues.filter(i => i.severity === 'info').length

  return (
    <div className="space-y-6">
      {/* Scores row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col items-center">
          <p className="text-slate-400 text-sm mb-4 font-medium">SEO Score</p>
          <ScoreGauge score={data.score} size="lg" />
        </div>
        {data.aiAnalysis && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col items-center">
            <p className="text-slate-400 text-sm mb-4 font-medium">AI Search Score</p>
            <ScoreGauge score={data.aiAnalysis.aiScore} size="lg" />
            <p className="text-slate-500 text-xs mt-3 text-center">ChatGPT / Perplexity / Google AI</p>
          </div>
        )}
      </div>

      {/* Issue summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4 text-center">
          <p className="text-red-400 text-3xl font-bold">{critical}</p>
          <p className="text-red-400/70 text-sm mt-1">Critical</p>
        </div>
        <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 text-center">
          <p className="text-amber-400 text-3xl font-bold">{warnings}</p>
          <p className="text-amber-400/70 text-sm mt-1">Warnings</p>
        </div>
        <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-4 text-center">
          <p className="text-blue-400 text-3xl font-bold">{info}</p>
          <p className="text-blue-400/70 text-sm mt-1">Info</p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-slate-50 font-semibold mb-4">Category Scores</h3>
        <div className="space-y-3">
          {(Object.entries(data.categories) as [string, number][]).map(([cat, score]) => (
            <div key={cat}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400 text-sm capitalize">{cat}</span>
                <span className="text-slate-50 text-sm font-medium">{score}/100</span>
              </div>
              <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${score}%`,
                    backgroundColor: score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Page details */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-slate-50 font-semibold mb-4">Page Details</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Title', value: data.metadata.title || 'Missing', ok: !!data.metadata.title },
            { label: 'Word Count', value: `${data.metadata.wordCount} words`, ok: data.metadata.wordCount >= 600 },
            { label: 'Images', value: `${data.metadata.imageCount}`, ok: true },
            { label: 'HTTPS', value: data.metadata.isHttps ? 'Yes' : 'No', ok: data.metadata.isHttps },
            { label: 'Schema', value: data.metadata.hasSchema ? 'Found' : 'Missing', ok: data.metadata.hasSchema },
            { label: 'Canonical', value: data.metadata.hasCanonical ? 'Found' : 'Missing', ok: data.metadata.hasCanonical },
            { label: 'H1 Tags', value: String(data.metadata.h1Count), ok: data.metadata.h1Count === 1 },
            { label: 'Internal Links', value: String(data.metadata.internalLinks), ok: data.metadata.internalLinks >= 3 },
            { label: 'External Links', value: String(data.metadata.externalLinks), ok: true },
          ].map(item => (
            <div key={item.label} className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-slate-500 text-xs mb-1">{item.label}</p>
              <p className={`text-sm font-medium ${item.ok ? 'text-emerald-400' : 'text-red-400'} truncate`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SEOIssuesTab({ issues }: { issues: Issue[] }) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all')

  const filtered = filter === 'all' ? issues : issues.filter(i => i.severity === filter)
  const critCount = issues.filter(i => i.severity === 'critical').length
  const warnCount = issues.filter(i => i.severity === 'warning').length
  const infoCount = issues.filter(i => i.severity === 'info').length

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: 'all', label: `All (${issues.length})` },
          { key: 'critical', label: `Critical (${critCount})` },
          { key: 'warning', label: `Warnings (${warnCount})` },
          { key: 'info', label: `Info (${infoCount})` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === key
                ? 'bg-teal-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-50 border border-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Issues list */}
      <div className="space-y-3">
        {filtered.map(issue => {
          const cfg = severityConfig[issue.severity]
          return (
            <div
              key={issue.id}
              className={`rounded-xl p-5 border ${cfg.bg} ${cfg.border}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className={`font-semibold ${cfg.color}`}>{issue.title}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-500 text-xs capitalize">{issue.category}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-3">{issue.description}</p>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wide">Fix: </span>
                <span className="text-slate-300 text-sm">{issue.fix}</span>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-500">No issues in this category</div>
        )}
      </div>
    </div>
  )
}

function AISearchTab({ aiAnalysis }: { aiAnalysis?: ReportData['aiAnalysis'] }) {
  if (!aiAnalysis) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
        <p className="text-slate-400">AI analysis not available for this report.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Score */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col items-center">
        <p className="text-slate-400 text-sm mb-4">AI Search Optimisation Score</p>
        <ScoreGauge score={aiAnalysis.aiScore} size="lg" />
        <p className="text-slate-500 text-sm mt-4 text-center max-w-md">
          How well your site is optimised to be cited by AI-powered search engines including
          ChatGPT, Perplexity, Google AI Overviews, and Claude.
        </p>
      </div>

      {/* AI Issues */}
      <div>
        <h3 className="text-slate-50 font-semibold text-lg mb-4">AI Search Issues</h3>
        <div className="space-y-3">
          {aiAnalysis.aiIssues.map(issue => {
            const cfg = severityConfig[issue.severity]
            return (
              <div key={issue.id} className={`rounded-xl p-5 border ${cfg.bg} ${cfg.border}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className={`font-semibold ${cfg.color}`}>{issue.title}</h4>
                  <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
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
      </div>
    </div>
  )
}

function CompetitorsTab({ competitors }: { competitors?: Competitor[] }) {
  if (!competitors || competitors.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
        <p className="text-slate-400">Competitor analysis not available for this report.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">
        Competitor analysis based on your niche and industry. Use these insights to identify content gaps and opportunities.
      </p>
      {competitors.map((comp, i) => (
        <div key={i} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-slate-50 font-semibold text-lg">{comp.name}</h3>
              <a
                href={comp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 text-sm hover:underline"
              >
                {comp.url}
              </a>
            </div>
            <span className="text-slate-600 text-2xl font-bold">#{i + 1}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-2">Their Strengths</p>
              <ul className="space-y-1">
                {comp.strengths.map((s, j) => (
                  <li key={j} className="text-slate-400 text-sm flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">+</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-wide mb-2">Content Gaps (Your Opportunity)</p>
              <ul className="space-y-1">
                {comp.contentGaps.map((g, j) => (
                  <li key={j} className="text-slate-400 text-sm flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">→</span>{g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ActionPlanTab({ actionPlan }: { actionPlan?: ActionPlan }) {
  if (!actionPlan) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
        <p className="text-slate-400">Action plan not available for this report.</p>
      </div>
    )
  }

  const months = [
    { title: 'Month 1', subtitle: 'Quick Wins', items: actionPlan.month1, color: 'teal' },
    { title: 'Month 2', subtitle: 'Structural Improvements', items: actionPlan.month2, color: 'blue' },
    { title: 'Month 3', subtitle: 'Growth Initiatives', items: actionPlan.month3, color: 'purple' },
  ]

  const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    teal: { bg: 'bg-teal-900/20', border: 'border-teal-800/50', text: 'text-teal-400', badge: 'bg-teal-600' },
    blue: { bg: 'bg-blue-900/20', border: 'border-blue-800/50', text: 'text-blue-400', badge: 'bg-blue-600' },
    purple: { bg: 'bg-purple-900/20', border: 'border-purple-800/50', text: 'text-purple-400', badge: 'bg-purple-600' },
  }

  return (
    <div className="space-y-6">
      <p className="text-slate-400 text-sm">
        Your personalised 90-day roadmap to improve SEO and AI search visibility.
      </p>
      {months.map(month => {
        const c = colorMap[month.color]
        return (
          <div key={month.title} className={`rounded-xl p-6 border ${c.bg} ${c.border}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className={`${c.badge} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                {month.title}
              </span>
              <h3 className={`font-semibold ${c.text}`}>{month.subtitle}</h3>
            </div>
            <ol className="space-y-2">
              {month.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`${c.text} font-bold text-sm mt-0.5 w-5 shrink-0`}>{i + 1}.</span>
                  <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        )
      })}
    </div>
  )
}
