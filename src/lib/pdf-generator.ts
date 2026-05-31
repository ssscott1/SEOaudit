// PDF generation using @react-pdf/renderer
// This runs server-side to generate PDF buffers

import React from 'react'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ReactPDF = require('@react-pdf/renderer')
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ReactPDFDocumentProps = { title?: string; author?: string; children?: React.ReactNode }
import { AIAnalysisResult } from './ai-analyzer'
import { SEOAnalysisResult } from './seo-analyzer'

// Register fonts (uses built-in PDF fonts)
Font.registerHyphenationCallback(word => [word])

const colors = {
  navy: '#0F172A',
  card: '#1E293B',
  teal: '#0D9488',
  white: '#F8FAFC',
  secondary: '#94A3B8',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#334155',
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.navy,
    fontFamily: 'Helvetica',
    color: colors.white,
    padding: 0,
  },
  coverPage: {
    backgroundColor: colors.navy,
    padding: 60,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.teal,
    marginBottom: 8,
    textAlign: 'center',
  },
  coverTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  coverUrl: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 40,
    textAlign: 'center',
  },
  scoreBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
  },
  coverDate: {
    fontSize: 12,
    color: colors.secondary,
    textAlign: 'center',
    marginTop: 40,
  },
  contentPage: {
    backgroundColor: colors.navy,
    padding: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomColor: colors.teal,
    borderBottomWidth: 2,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
    borderColor: colors.border,
    borderWidth: 1,
  },
  issueTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 10,
    color: colors.secondary,
    marginBottom: 5,
    lineHeight: 1.4,
  },
  issueFix: {
    fontSize: 10,
    color: colors.teal,
    lineHeight: 1.3,
  },
  badge: {
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 6,
    padding: 14,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 10,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.teal,
    textAlign: 'center',
  },
  actionItem: {
    backgroundColor: colors.card,
    borderRadius: 5,
    padding: 10,
    marginBottom: 7,
    borderColor: colors.border,
    borderWidth: 1,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 3,
  },
  actionDesc: {
    fontSize: 9,
    color: colors.secondary,
    lineHeight: 1.3,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 5,
  },
  smallBadge: {
    borderRadius: 2,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  smallBadgeText: {
    fontSize: 8,
    color: colors.white,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    fontSize: 10,
    color: colors.secondary,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    fontSize: 10,
    color: colors.secondary,
  },
  summaryBox: {
    backgroundColor: colors.teal,
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 11,
    color: colors.white,
    lineHeight: 1.5,
  },
  bulletPoint: {
    fontSize: 10,
    color: colors.secondary,
    marginBottom: 3,
    paddingLeft: 10,
  },
  competitorItem: {
    backgroundColor: colors.card,
    borderRadius: 5,
    padding: 10,
    marginBottom: 6,
    borderColor: colors.border,
    borderWidth: 1,
  },
  competitorText: {
    fontSize: 11,
    color: colors.teal,
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.teal,
    marginBottom: 8,
    marginTop: 12,
  },
})

interface Issue {
  severity: string
  title: string
  description: string
  fix: string
}

interface ActionItem {
  task: string
  effort: string
  impact: string
  description: string
}

interface AIIssue {
  priority: string
  title: string
  description: string
  fix: string
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical': return colors.error
    case 'warning': return colors.warning
    case 'info': return '#6366F1'
    default: return colors.secondary
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high': return colors.error
    case 'medium': return colors.warning
    case 'low': return colors.success
    default: return colors.secondary
  }
}

function getEffortColor(effort: string) {
  switch (effort) {
    case 'high': return colors.error
    case 'medium': return colors.warning
    case 'low': return colors.success
    default: return colors.secondary
  }
}

function createPDFDocument(
  url: string,
  seoResult: SEOAnalysisResult,
  aiResult: AIAnalysisResult,
  date: string
): React.ReactElement<ReactPDFDocumentProps> {
  // Cover page
  const coverPage = React.createElement(
    Page,
    { size: 'A4', style: styles.page },
    React.createElement(
      View,
      { style: styles.coverPage },
      React.createElement(Text, { style: styles.brandName }, 'SEO AUDIT PRO'),
      React.createElement(Text, { style: styles.coverTitle }, 'Comprehensive SEO & AI Search Audit'),
      React.createElement(Text, { style: styles.coverUrl }, url),
      React.createElement(
        View,
        { style: styles.scoreBox },
        React.createElement(Text, { style: styles.scoreNumber }, String(seoResult.score)),
        React.createElement(Text, { style: styles.scoreLabel }, '/ 100')
      ),
      React.createElement(
        Text,
        { style: { fontSize: 14, color: colors.secondary, marginBottom: 6 } },
        `Grade: ${aiResult.summary?.grade || 'N/A'}`
      ),
      React.createElement(Text, { style: styles.coverDate }, `Generated on ${date}`)
    )
  )

  // Summary page
  const summaryPage = React.createElement(
    Page,
    { size: 'A4', style: styles.page },
    React.createElement(
      View,
      { style: styles.contentPage },
      React.createElement(Text, { style: styles.sectionTitle }, 'Executive Summary'),
      React.createElement(
        View,
        { style: styles.summaryBox },
        React.createElement(
          Text,
          { style: styles.summaryTitle },
          `SEO Health: ${aiResult.summary?.grade || 'N/A'} (${seoResult.score}/100)`
        ),
        React.createElement(
          Text,
          { style: styles.summaryText },
          'This report provides a comprehensive analysis of your site\'s SEO and AI search optimization. Follow the 90-day action plan to improve your search visibility.'
        )
      ),
      React.createElement(
        View,
        { style: styles.row },
        ...[
          { label: 'Technical', score: seoResult.categories.technical.score },
          { label: 'Content', score: seoResult.categories.content.score },
          { label: 'Performance', score: seoResult.categories.performance.score },
          { label: 'Social', score: seoResult.categories.social.score },
        ].map(cat =>
          React.createElement(
            View,
            { style: styles.categoryCard, key: cat.label },
            React.createElement(Text, { style: styles.categoryLabel }, cat.label),
            React.createElement(Text, { style: styles.categoryScore }, String(cat.score))
          )
        )
      ),
      ...(aiResult.summary?.criticalIssues || []).map((issue, i) =>
        React.createElement(Text, { style: styles.bulletPoint, key: i }, `• ${issue}`)
      )
    ),
    React.createElement(Text, { style: styles.footer }, 'SEO Audit Pro'),
    React.createElement(Text, { style: styles.pageNumber }, '2')
  )

  // SEO Issues page
  const seoPage = React.createElement(
    Page,
    { size: 'A4', style: styles.page },
    React.createElement(
      View,
      { style: styles.contentPage },
      React.createElement(Text, { style: styles.sectionTitle }, 'SEO Issues & Fixes'),
      ...(seoResult.allIssues || []).slice(0, 8).map((issue: Issue, i: number) =>
        React.createElement(
          View,
          { style: styles.card, key: i },
          React.createElement(
            View,
            { style: { ...styles.badge, backgroundColor: getSeverityColor(issue.severity) } },
            React.createElement(Text, { style: styles.badgeText }, issue.severity.toUpperCase())
          ),
          React.createElement(Text, { style: styles.issueTitle }, issue.title),
          React.createElement(Text, { style: styles.issueDescription }, issue.description),
          React.createElement(Text, { style: styles.issueFix }, `Fix: ${issue.fix}`)
        )
      )
    ),
    React.createElement(Text, { style: styles.footer }, 'SEO Audit Pro'),
    React.createElement(Text, { style: styles.pageNumber }, '3')
  )

  // AI Analysis page
  const aiPage = React.createElement(
    Page,
    { size: 'A4', style: styles.page },
    React.createElement(
      View,
      { style: styles.contentPage },
      React.createElement(Text, { style: styles.sectionTitle }, 'AI Search Optimization'),
      React.createElement(
        Text,
        { style: { fontSize: 11, color: colors.secondary, marginBottom: 14 } },
        `AI Search Score: ${aiResult.aiScore}/100 — Measures visibility in ChatGPT, Perplexity, Claude & Gemini.`
      ),
      ...(aiResult.aiIssues || []).slice(0, 5).map((issue: AIIssue, i: number) =>
        React.createElement(
          View,
          { style: styles.card, key: i },
          React.createElement(
            View,
            { style: { ...styles.badge, backgroundColor: getPriorityColor(issue.priority) } },
            React.createElement(Text, { style: styles.badgeText }, `${issue.priority.toUpperCase()} PRIORITY`)
          ),
          React.createElement(Text, { style: styles.issueTitle }, issue.title),
          React.createElement(Text, { style: styles.issueDescription }, issue.description),
          React.createElement(Text, { style: styles.issueFix }, `Fix: ${issue.fix}`)
        )
      )
    ),
    React.createElement(Text, { style: styles.footer }, 'SEO Audit Pro'),
    React.createElement(Text, { style: styles.pageNumber }, '4')
  )

  // Action Plan page
  const actionPage = React.createElement(
    Page,
    { size: 'A4', style: styles.page },
    React.createElement(
      View,
      { style: styles.contentPage },
      React.createElement(Text, { style: styles.sectionTitle }, '90-Day Action Plan'),

      React.createElement(Text, { style: styles.monthTitle }, 'Month 1: Foundation'),
      ...(aiResult.actionPlan?.month1 || []).map((item: ActionItem, i: number) =>
        React.createElement(
          View,
          { style: styles.actionItem, key: `m1-${i}` },
          React.createElement(
            View,
            { style: styles.badgeRow },
            React.createElement(
              View,
              { style: { ...styles.smallBadge, backgroundColor: getEffortColor(item.effort) } },
              React.createElement(Text, { style: styles.smallBadgeText }, `Effort: ${item.effort}`)
            ),
            React.createElement(
              View,
              { style: { ...styles.smallBadge, backgroundColor: getEffortColor(item.impact) } },
              React.createElement(Text, { style: styles.smallBadgeText }, `Impact: ${item.impact}`)
            )
          ),
          React.createElement(Text, { style: styles.actionTitle }, item.task),
          React.createElement(Text, { style: styles.actionDesc }, item.description)
        )
      ),

      React.createElement(Text, { style: styles.monthTitle }, 'Month 2: Growth'),
      ...(aiResult.actionPlan?.month2 || []).map((item: ActionItem, i: number) =>
        React.createElement(
          View,
          { style: styles.actionItem, key: `m2-${i}` },
          React.createElement(Text, { style: styles.actionTitle }, item.task),
          React.createElement(Text, { style: styles.actionDesc }, item.description)
        )
      ),

      React.createElement(Text, { style: styles.monthTitle }, 'Month 3: Authority'),
      ...(aiResult.actionPlan?.month3 || []).map((item: ActionItem, i: number) =>
        React.createElement(
          View,
          { style: styles.actionItem, key: `m3-${i}` },
          React.createElement(Text, { style: styles.actionTitle }, item.task),
          React.createElement(Text, { style: styles.actionDesc }, item.description)
        )
      )
    ),
    React.createElement(Text, { style: styles.footer }, 'SEO Audit Pro'),
    React.createElement(Text, { style: styles.pageNumber }, '5')
  )

  return React.createElement(
    Document,
    { title: `SEO Audit - ${url}`, author: 'SEO Audit Pro' },
    coverPage,
    summaryPage,
    seoPage,
    aiPage,
    actionPage
  ) as React.ReactElement<ReactPDFDocumentProps>
}

export async function generatePDFBuffer(
  url: string,
  reportId: string,
  seoResult: SEOAnalysisResult,
  aiResult: AIAnalysisResult
): Promise<Buffer> {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Suppress unused warning
  void reportId

  const doc = createPDFDocument(url, seoResult, aiResult, date)
  const pdfBuffer = await ReactPDF.renderToBuffer(doc)
  return Buffer.from(pdfBuffer)
}
