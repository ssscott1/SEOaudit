import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Analysis } from './db/schema'
import type { Issue } from './seo-analyzer'
import type { AIAnalysis } from './ai-analyzer'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },
  scoreInfo: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  scoreUrl: {
    fontSize: 11,
    color: '#0D9488',
    marginBottom: 4,
  },
  scoreDate: {
    fontSize: 10,
    color: '#94A3B8',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 12,
    marginTop: 16,
  },
  issueCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  issueTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 1.5,
    marginBottom: 6,
  },
  issueFix: {
    fontSize: 10,
    color: '#34D399',
    lineHeight: 1.5,
  },
  issueFixLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#34D399',
  },
  categoryGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  categoryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    width: '22%',
    alignItems: 'center',
  },
  categoryScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  categoryName: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  actionItem: {
    backgroundColor: '#1E293B',
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
    flexDirection: 'row',
  },
  actionBullet: {
    fontSize: 10,
    color: '#0D9488',
    marginRight: 8,
    fontWeight: 'bold',
  },
  actionText: {
    fontSize: 10,
    color: '#CBD5E1',
    flex: 1,
    lineHeight: 1.5,
  },
  monthTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0D9488',
    marginBottom: 8,
    marginTop: 12,
  },
  footer: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 9,
    color: '#475569',
    textAlign: 'center',
  },
})

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#EF4444'
    case 'warning': return '#F59E0B'
    default: return '#3B82F6'
  }
}

function getScoreColor(score: number): string {
  if (score >= 70) return '#10B981'
  if (score >= 40) return '#F59E0B'
  return '#EF4444'
}

interface FullReport {
  allIssues: Issue[]
  categories: { technical: number; content: number; social: number; performance: number }
  metadata: {
    title: string
    description: string
    wordCount: number
    imageCount: number
  }
  aiAnalysis?: AIAnalysis
}

function buildDocument(analysis: Analysis, fullReport: FullReport) {
  const { allIssues, categories, metadata, aiAnalysis } = fullReport
  const criticalIssues = allIssues.filter(i => i.severity === 'critical')
  const warningIssues = allIssues.filter(i => i.severity === 'warning')

  const cr = React.createElement

  return cr(Document, {},
    // Page 1: Overview & Issues
    cr(Page, { size: 'A4', style: styles.page },
      cr(View, { style: styles.header },
        cr(Text, { style: styles.title }, 'SEO Audit Report'),
        cr(Text, { style: styles.subtitle }, `Generated ${new Date(analysis.createdAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}`)
      ),

      cr(View, { style: styles.scoreSection },
        cr(View, { style: { ...styles.scoreCircle, borderColor: getScoreColor(analysis.score) } },
          cr(Text, { style: { ...styles.scoreNumber, color: getScoreColor(analysis.score) } }, String(analysis.score)),
          cr(Text, { style: styles.scoreLabel }, '/100')
        ),
        cr(View, { style: styles.scoreInfo },
          cr(Text, { style: styles.scoreTitle }, 'Overall SEO Score'),
          cr(Text, { style: styles.scoreUrl }, analysis.url),
          cr(Text, { style: styles.scoreDate }, `Report for: ${analysis.name || analysis.email || 'Unnamed'}`),
          cr(Text, { style: { fontSize: 10, color: '#94A3B8', marginTop: 4 } },
            `Issues found: ${allIssues.length} (${criticalIssues.length} critical, ${warningIssues.length} warnings)`
          )
        )
      ),

      cr(Text, { style: styles.sectionTitle }, 'Category Scores'),
      cr(View, { style: styles.categoryGrid },
        ...(Object.entries(categories) as [string, number][]).map(([cat, score]) =>
          cr(View, { key: cat, style: styles.categoryCard },
            cr(Text, { style: { ...styles.categoryScore, color: getScoreColor(score) } }, String(score)),
            cr(Text, { style: styles.categoryName }, cat.charAt(0).toUpperCase() + cat.slice(1))
          )
        )
      ),

      cr(View, { style: { backgroundColor: '#1E293B', borderRadius: 8, padding: 14, marginBottom: 16 } },
        cr(Text, { style: { fontSize: 12, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 8 } }, 'Page Details'),
        cr(Text, { style: { fontSize: 10, color: '#94A3B8', marginBottom: 3 } }, `Title: ${metadata.title || 'Missing'}`),
        cr(Text, { style: { fontSize: 10, color: '#94A3B8', marginBottom: 3 } }, `Description: ${metadata.description ? metadata.description.substring(0, 100) + '...' : 'Missing'}`),
        cr(Text, { style: { fontSize: 10, color: '#94A3B8', marginBottom: 3 } }, `Word Count: ${metadata.wordCount} words`),
        cr(Text, { style: { fontSize: 10, color: '#94A3B8' } }, `Images: ${metadata.imageCount}`)
      ),

      criticalIssues.length > 0
        ? cr(View, {},
            cr(Text, { style: { ...styles.sectionTitle, color: '#EF4444' } }, `Critical Issues (${criticalIssues.length})`),
            ...criticalIssues.slice(0, 5).map(issue =>
              cr(View, { key: issue.id, style: { ...styles.issueCard, borderLeftColor: '#EF4444' } },
                cr(Text, { style: styles.issueTitle }, issue.title),
                cr(Text, { style: styles.issueDescription }, issue.description),
                cr(View, {},
                  cr(Text, { style: styles.issueFixLabel }, 'Fix: '),
                  cr(Text, { style: styles.issueFix }, issue.fix)
                )
              )
            )
          )
        : cr(View, {}),

      cr(View, { style: styles.footer },
        cr(Text, { style: styles.footerText }, 'SEO Audit Pro — Confidential Report — Page 1')
      )
    ),

    // Page 2: Warnings + AI
    cr(Page, { size: 'A4', style: styles.page },
      cr(View, { style: styles.header },
        cr(Text, { style: styles.title }, 'SEO Issues (Continued)')
      ),

      warningIssues.length > 0
        ? cr(View, {},
            cr(Text, { style: { ...styles.sectionTitle, color: '#F59E0B' } }, `Warnings (${warningIssues.length})`),
            ...warningIssues.slice(0, 6).map(issue =>
              cr(View, { key: issue.id, style: { ...styles.issueCard, borderLeftColor: '#F59E0B' } },
                cr(Text, { style: styles.issueTitle }, issue.title),
                cr(Text, { style: styles.issueDescription }, issue.description),
                cr(View, {},
                  cr(Text, { style: styles.issueFixLabel }, 'Fix: '),
                  cr(Text, { style: styles.issueFix }, issue.fix)
                )
              )
            )
          )
        : cr(View, {}),

      aiAnalysis
        ? cr(View, {},
            cr(Text, { style: { ...styles.sectionTitle, color: '#0D9488' } }, 'AI Search Optimisation'),
            cr(View, { style: styles.scoreSection },
              cr(View, { style: { ...styles.scoreCircle, borderColor: getScoreColor(aiAnalysis.aiScore) } },
                cr(Text, { style: { ...styles.scoreNumber, color: getScoreColor(aiAnalysis.aiScore) } }, String(aiAnalysis.aiScore)),
                cr(Text, { style: styles.scoreLabel }, '/100')
              ),
              cr(View, { style: styles.scoreInfo },
                cr(Text, { style: styles.scoreTitle }, 'AI Search Score'),
                cr(Text, { style: { fontSize: 11, color: '#94A3B8', lineHeight: 1.5 } },
                  'How well your site is optimised for AI-powered search'
                )
              )
            ),
            ...aiAnalysis.aiIssues.slice(0, 3).map(issue =>
              cr(View, { key: issue.id, style: { ...styles.issueCard, borderLeftColor: getSeverityColor(issue.severity) } },
                cr(Text, { style: styles.issueTitle }, issue.title),
                cr(Text, { style: styles.issueDescription }, issue.description),
                cr(View, {},
                  cr(Text, { style: styles.issueFixLabel }, 'Fix: '),
                  cr(Text, { style: styles.issueFix }, issue.fix)
                )
              )
            )
          )
        : cr(View, {}),

      cr(View, { style: styles.footer },
        cr(Text, { style: styles.footerText }, 'SEO Audit Pro — Confidential Report — Page 2')
      )
    ),

    // Page 3: Action Plan
    cr(Page, { size: 'A4', style: styles.page },
      cr(View, { style: styles.header },
        cr(Text, { style: styles.title }, '90-Day Action Plan'),
        cr(Text, { style: styles.subtitle }, 'Your prioritised roadmap to SEO improvement')
      ),

      aiAnalysis
        ? cr(View, {},
            cr(Text, { style: styles.monthTitle }, 'Month 1 — Quick Wins'),
            ...aiAnalysis.actionPlan.month1.map((action, i) =>
              cr(View, { key: i, style: styles.actionItem },
                cr(Text, { style: styles.actionBullet }, `${i + 1}.`),
                cr(Text, { style: styles.actionText }, action)
              )
            ),
            cr(Text, { style: styles.monthTitle }, 'Month 2 — Structural Improvements'),
            ...aiAnalysis.actionPlan.month2.map((action, i) =>
              cr(View, { key: i, style: styles.actionItem },
                cr(Text, { style: styles.actionBullet }, `${i + 1}.`),
                cr(Text, { style: styles.actionText }, action)
              )
            ),
            cr(Text, { style: styles.monthTitle }, 'Month 3 — Growth Initiatives'),
            ...aiAnalysis.actionPlan.month3.map((action, i) =>
              cr(View, { key: i, style: styles.actionItem },
                cr(Text, { style: styles.actionBullet }, `${i + 1}.`),
                cr(Text, { style: styles.actionText }, action)
              )
            )
          )
        : cr(View, { style: { backgroundColor: '#1E293B', borderRadius: 8, padding: 20 } },
            cr(Text, { style: { color: '#94A3B8', fontSize: 12 } },
              'Action plan requires AI analysis. Please ensure your Anthropic API key is configured.'
            )
          ),

      cr(View, { style: styles.footer },
        cr(Text, { style: styles.footerText }, 'SEO Audit Pro — Confidential Report — Page 3')
      )
    )
  )
}

export async function generatePDF(analysis: Analysis): Promise<Buffer> {
  if (!analysis.fullReport) {
    throw new Error('Full report data not available')
  }

  const fullReport = JSON.parse(analysis.fullReport) as FullReport
  const document = buildDocument(analysis, fullReport)
  const buffer = await renderToBuffer(document)
  return Buffer.from(buffer)
}
