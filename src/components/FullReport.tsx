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
  impact: number
}

interface AIIssue {
  title: string
  description: string
  fix: string
  priority: 'high' | 'medium' | 'low'
}

interface ActionItem {
  task: string
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  description: string
}

interface FullReportProps {
  reportId: string
  url: string
  score: number
  report: {
    summary: {
      grade: string
      topWins: string[]
      criticalIssues: string[]
    }
    seoIssues: Issue[]
    categories: {
      technical: { score: number; maxScore: number; label: string }
      content: { score: number; maxScore: number; label: string }
      performance: { score: number; maxScore: number; label: string }
      social: { score: number; maxScore: number; label: string }
    }
    metadata: {
      title: string
      description: string
      wordCount: number
      imageCount: number
      linkCount: number
      internalLinks: number
      externalLinks: number
      h1Count: number
      h2Count: number
      hasSchema: boolean
      hasCanonical: boolean
      hasViewport: boolean
      isHttps: boolean
      pageSize: number
      missingAltCount: number
    }
    aiSearchAnalysis: {
      aiScore: number
      aiIssues: AIIssue[]
      opportunities: string[]
    }
    competitors: {
      suggested: string[]
      gaps: string[]
    }
    actionPlan: {
      month1: ActionItem[]
      month2: ActionItem[]
      month3: ActionItem[]
    }
  }
}

const severityConfig = {
  critical: { label: 'Critical', bg: 'bg-red-900/30', border: 'border-red-800', text: 'text-red-400', dot: 'bg-red-500' },
  warning: { label: 'Warning', bg: 'bg-yellow-900/30', border: 'border-yellow-800', text: 'text-yellow-400', dot: 'bg-yellow-500' },
  info: { label: 'Info', bg: 'bg-blue-900/30', border: 'border-blue-800', text: 'text-blue-400', dot: 'bg-blue-400' },
}

const priorityConfig = {
  high: { label: 'High', bg: 'bg-red-900/30', border: 'border-red-800', text: 'text-red-400' },
  medium: { label: 'Medium', bg: 'bg-yellow-900/30', border: 'border-yellow-800', text: 'text-yellow-400' },
  low: { label: 'Low', bg: 'bg-green-900/30', border: 'border-green-800', text: 'text-green-400' },
}

const effortColors = {
  low: 'text-green-400 bg-green-900/30',
  medium: 'text-yellow-400 bg-yellow-900/30',
  high: 'text-red-400 bg-red-900/30',
}

function CategoryScoreTile({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => s >= 80 ? '#10B981' : s >= 60 ? '#F59E0B' : s >= 40 ? '#F97316' : '#EF4444'
  const color = getColor(score)

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 flex flex-col items-center">
      <p className="text-gray-400 text-sm mb-3">{label}</p>
      <div className="relative w-16 h-16">
        <svg width="64" height="64" className="transform -rotate-90">
          <circle cx="32" cy="32" r="26" fill="none" stroke="#334155" strokeWidth="6" />
          <circle
            cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={2 * Math.PI * 26}
            strokeDashoffset={2 * Math.PI * 26 * (1 - score / 100)}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
    </div>
  )
}

export default function FullReport({ reportId, url, score, report }: FullReportProps) {
  const [downloading, setDownloading] = useState(false)
  const [activeTab, setActiveTab] = useState<'seo' | 'ai' | 'competitors' | 'action'>('seo')

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const response = await fetch(`/api/pdf/${reportId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url_obj = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url_obj
        a.download = `seo-audit-${reportId}.pdf`
        a.click()
        URL.revokeObjectURL(url_obj)
      }
    } catch (error) {
      console.error('PDF download error:', error)
    } finally {
      setDownloading(false)
    }
  }

  const criticalCount = report.seoIssues.filter(i => i.severity === 'critical').length
  const warningCount = report.seoIssues.filter(i => i.severity === 'warning').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <ScoreGauge score={score} size="lg" />
          </div>
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center gap-2 mb-1 justify-center lg:justify-start">
              <span className="bg-teal-900/30 text-teal-400 text-xs font-bold px-2 py-1 rounded-full border border-teal-800">
                FULL REPORT
              </span>
              <span className="text-gray-400 text-xs">{new Date().toLocaleDateString()}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{url}</h1>
            <p className="text-gray-400 mb-4">Grade: <span className="text-white font-bold">{report.summary.grade}</span></p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-gray-400">{criticalCount} Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-gray-400">{warningCount} Warnings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="text-gray-400">AI Score: {report.aiSearchAnalysis.aiScore}/100</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-semibold rounded-lg transition-all"
            >
              {downloading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {downloading ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Category Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CategoryScoreTile label="Technical SEO" score={report.categories.technical.score} />
        <CategoryScoreTile label="Content Quality" score={report.categories.content.score} />
        <CategoryScoreTile label="Performance" score={report.categories.performance.score} />
        <CategoryScoreTile label="Social & OG" score={report.categories.social.score} />
      </div>

      {/* Quick Wins */}
      {report.summary.topWins && report.summary.topWins.length > 0 && (
        <div className="bg-green-900/20 border border-green-800 rounded-xl p-6">
          <h2 className="text-green-400 font-bold text-lg mb-3">What You&apos;re Doing Right</h2>
          <div className="space-y-2">
            {report.summary.topWins.map((win, i) => (
              <div key={i} className="flex items-center gap-2 text-green-300">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {win}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div>
        <div className="flex gap-1 bg-[#1E293B] border border-[#334155] rounded-xl p-1 mb-6 overflow-x-auto">
          {[
            { key: 'seo', label: 'SEO Issues', count: report.seoIssues.length },
            { key: 'ai', label: 'AI Search', count: report.aiSearchAnalysis.aiIssues.length },
            { key: 'competitors', label: 'Competitors', count: report.competitors.suggested.length },
            { key: 'action', label: '90-Day Plan', count: null },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#0D9488] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-white/20' : 'bg-[#334155]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* SEO Issues Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {(['critical', 'warning', 'info'] as const).map(sev => {
                const count = report.seoIssues.filter(i => i.severity === sev).length
                const cfg = severityConfig[sev]
                return (
                  <div key={sev} className={`${cfg.bg} border ${cfg.border} rounded-lg p-4 text-center`}>
                    <p className={`text-2xl font-bold ${cfg.text}`}>{count}</p>
                    <p className="text-gray-400 text-sm">{cfg.label} Issues</p>
                  </div>
                )
              })}
            </div>
            {report.seoIssues.map((issue) => {
              const cfg = severityConfig[issue.severity]
              return (
                <div key={issue.id} className={`${cfg.bg} border ${cfg.border} rounded-xl p-5`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot} mt-2 flex-shrink-0`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${cfg.text}`}>{cfg.label}</span>
                        <span className="text-xs text-gray-500 capitalize bg-[#0F172A] px-2 py-0.5 rounded">{issue.category}</span>
                        <span className="text-xs text-gray-500">Impact: {issue.impact}/10</span>
                      </div>
                      <h3 className="text-white font-semibold mb-1">{issue.title}</h3>
                      <p className="text-gray-400 text-sm mb-3 leading-relaxed">{issue.description}</p>
                      <div className="bg-[#0F172A] rounded-lg p-3 border border-[#334155]">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Fix</p>
                        <p className="text-teal-400 text-sm leading-relaxed">{issue.fix}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* AI Search Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            {/* AI Score */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 flex items-center gap-6">
              <div className="flex-shrink-0">
                <ScoreGauge score={report.aiSearchAnalysis.aiScore} size="sm" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl mb-1">AI Search Score</h3>
                <p className="text-gray-400 text-sm">
                  How well your site is optimized to appear in ChatGPT, Perplexity, Claude, and Gemini answers.
                  AI search is rapidly growing — sites optimized for AI get 3x more visibility.
                </p>
              </div>
            </div>

            {/* AI Issues */}
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">AI Search Issues</h3>
              {report.aiSearchAnalysis.aiIssues.map((issue, i) => {
                const cfg = priorityConfig[issue.priority]
                return (
                  <div key={i} className={`${cfg.bg} border ${cfg.border} rounded-xl p-5`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${cfg.text}`}>{cfg.label} Priority</span>
                    </div>
                    <h4 className="text-white font-semibold mb-1">{issue.title}</h4>
                    <p className="text-gray-400 text-sm mb-3 leading-relaxed">{issue.description}</p>
                    <div className="bg-[#0F172A] rounded-lg p-3 border border-[#334155]">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Fix</p>
                      <p className="text-teal-400 text-sm leading-relaxed">{issue.fix}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Opportunities */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Opportunities</h3>
              <div className="space-y-3">
                {report.aiSearchAnalysis.opportunities.map((opp, i) => (
                  <div key={i} className="bg-teal-900/20 border border-teal-800/50 rounded-lg p-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className="text-gray-300 text-sm">{opp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Competitors Tab */}
        {activeTab === 'competitors' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Suggested Competitors to Monitor</h3>
              <div className="space-y-3">
                {report.competitors.suggested.map((comp, i) => (
                  <div key={i} className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#0D9488]/20 border border-teal-800 flex items-center justify-center text-teal-400 font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-teal-400 font-medium">{comp}</p>
                      <p className="text-gray-500 text-xs mt-0.5">Analyze their content strategy and keywords</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-4">Content Gaps to Fill</h3>
              <div className="space-y-3">
                {report.competitors.gaps.map((gap, i) => (
                  <div key={i} className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-300 text-sm">{gap}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata summary */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">Site Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Word Count', value: report.metadata.wordCount, suffix: 'words' },
                  { label: 'Images', value: report.metadata.imageCount },
                  { label: 'Internal Links', value: report.metadata.internalLinks },
                  { label: 'External Links', value: report.metadata.externalLinks },
                  { label: 'H1 Tags', value: report.metadata.h1Count },
                  { label: 'H2 Tags', value: report.metadata.h2Count },
                ].map(item => (
                  <div key={item.label} className="bg-[#0F172A] rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">{item.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {[
                  { label: 'HTTPS', value: report.metadata.isHttps },
                  { label: 'Canonical', value: report.metadata.hasCanonical },
                  { label: 'Viewport', value: report.metadata.hasViewport },
                  { label: 'Schema', value: report.metadata.hasSchema },
                ].map(item => (
                  <div key={item.label} className={`rounded-lg p-3 text-center border ${item.value ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`}>
                    <p className={`text-lg font-bold ${item.value ? 'text-green-400' : 'text-red-400'}`}>
                      {item.value ? '✓' : '✗'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Plan Tab */}
        {activeTab === 'action' && (
          <div className="space-y-8">
            <p className="text-gray-400">
              Follow this prioritized 90-day plan to improve your SEO and AI search visibility. Start with Month 1 for the fastest wins.
            </p>
            {[
              { key: 'month1', label: 'Month 1: Foundation', color: 'teal', items: report.actionPlan.month1 },
              { key: 'month2', label: 'Month 2: Growth', color: 'blue', items: report.actionPlan.month2 },
              { key: 'month3', label: 'Month 3: Authority', color: 'purple', items: report.actionPlan.month3 },
            ].map(month => (
              <div key={month.key}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full bg-teal-500`} />
                  <h3 className="text-white font-bold text-xl">{month.label}</h3>
                </div>
                <div className="space-y-4">
                  {(month.items || []).map((item, i) => (
                    <div key={i} className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 hover:border-teal-800 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0D9488]/20 border border-teal-800 flex items-center justify-center text-teal-400 font-bold text-sm">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${effortColors[item.effort]}`}>
                              Effort: {item.effort}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${effortColors[item.impact]}`}>
                              Impact: {item.impact}
                            </span>
                          </div>
                          <h4 className="text-white font-semibold mb-1">{item.task}</h4>
                          <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
