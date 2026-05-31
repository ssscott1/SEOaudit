import Anthropic from '@anthropic-ai/sdk'
import { SEOAnalysisResult } from './seo-analyzer'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export interface AIIssue {
  title: string
  description: string
  fix: string
  priority: 'high' | 'medium' | 'low'
}

export interface ActionItem {
  task: string
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  description: string
}

export interface AIAnalysisResult {
  aiScore: number
  aiIssues: AIIssue[]
  opportunities: string[]
  competitors: {
    suggested: string[]
    gaps: string[]
  }
  actionPlan: {
    month1: ActionItem[]
    month2: ActionItem[]
    month3: ActionItem[]
  }
  summary: {
    grade: string
    topWins: string[]
    criticalIssues: string[]
  }
}

const SYSTEM_PROMPT = `You are an expert SEO and AI search optimization consultant with 15 years of experience helping businesses rank on Google and appear in AI search engines like ChatGPT, Perplexity, Claude, and Gemini.

Your task is to analyze a website's SEO data and provide actionable, specific recommendations. You focus on:
1. Traditional SEO improvements (technical, content, authority)
2. AI search optimization (how to appear in AI-generated answers)
3. Competitive positioning
4. Prioritized action plans

Always respond with valid JSON only. No markdown, no explanation outside JSON.`

export async function analyzeWithAI(
  url: string,
  seoResult: SEOAnalysisResult,
  htmlSnippet: string
): Promise<AIAnalysisResult> {
  // Prepare a content snippet (first 3000 chars of body text)
  const bodyPreview = htmlSnippet.slice(0, 3000)

  const userPrompt = `Analyze this website for SEO and AI search optimization:

URL: ${url}
SEO Score: ${seoResult.score}/100
Title: ${seoResult.metadata.title || 'Missing'}
Description: ${seoResult.metadata.description || 'Missing'}
Word Count: ${seoResult.metadata.wordCount}
H1 Count: ${seoResult.metadata.h1Count}
H2 Count: ${seoResult.metadata.h2Count}
Has Schema: ${seoResult.metadata.hasSchema}
Images Without Alt: ${seoResult.metadata.missingAltCount}
Internal Links: ${seoResult.metadata.internalLinks}
External Links: ${seoResult.metadata.externalLinks}
HTTPS: ${seoResult.metadata.isHttps}
Has Canonical: ${seoResult.metadata.hasCanonical}
Has Viewport: ${seoResult.metadata.hasViewport}
OG Title: ${seoResult.metadata.ogTitle || 'Missing'}

Top SEO Issues Found:
${seoResult.allIssues.slice(0, 5).map(i => `- [${i.severity}] ${i.title}: ${i.description}`).join('\n')}

Page Content Preview:
${bodyPreview}

Please provide a comprehensive analysis in this exact JSON format:
{
  "aiScore": <number 0-100 representing AI search optimization score>,
  "aiIssues": [
    {
      "title": "<issue title>",
      "description": "<what the problem is and why it matters for AI search>",
      "fix": "<specific actionable fix>",
      "priority": "<high|medium|low>"
    }
  ],
  "opportunities": [
    "<specific opportunity string 1>",
    "<specific opportunity string 2>",
    "<specific opportunity string 3>",
    "<specific opportunity string 4>",
    "<specific opportunity string 5>"
  ],
  "competitors": {
    "suggested": [
      "<competitor domain 1>",
      "<competitor domain 2>",
      "<competitor domain 3>"
    ],
    "gaps": [
      "<content gap or opportunity vs competitors>",
      "<content gap or opportunity vs competitors>",
      "<content gap or opportunity vs competitors>"
    ]
  },
  "actionPlan": {
    "month1": [
      {
        "task": "<specific task title>",
        "effort": "<low|medium|high>",
        "impact": "<low|medium|high>",
        "description": "<detailed description of what to do>"
      }
    ],
    "month2": [
      {
        "task": "<specific task title>",
        "effort": "<low|medium|high>",
        "impact": "<low|medium|high>",
        "description": "<detailed description>"
      }
    ],
    "month3": [
      {
        "task": "<specific task title>",
        "effort": "<low|medium|high>",
        "impact": "<low|medium|high>",
        "description": "<detailed description>"
      }
    ]
  },
  "summary": {
    "grade": "<letter grade A-F>",
    "topWins": [
      "<quick win that's already done well>",
      "<quick win that's already done well>"
    ],
    "criticalIssues": [
      "<most critical issue to fix>",
      "<most critical issue to fix>",
      "<most critical issue to fix>"
    ]
  }
}

Focus on AI search optimization specifically:
- How well structured is the content for AI to extract answers?
- Does the site have clear entity definitions (what is this business, what do they do)?
- Are there FAQ sections that AI can use for featured snippets?
- Is the content authoritative with citations and expertise signals?
- How can they appear in ChatGPT, Perplexity, Claude, and Gemini answers?

Provide 5-7 AI issues, 3 action items per month, and make everything specific to this site's niche.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Extract JSON from the response (handle potential markdown code blocks)
    let jsonText = content.text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const result = JSON.parse(jsonText) as AIAnalysisResult
    return result
  } catch (error) {
    console.error('AI analysis error:', error)
    // Return a fallback result
    return generateFallbackAnalysis(url, seoResult)
  }
}

function generateFallbackAnalysis(url: string, seoResult: SEOAnalysisResult): AIAnalysisResult {
  const hostname = (() => { try { return new URL(url).hostname } catch { return url } })()

  return {
    aiScore: Math.max(20, seoResult.score - 15),
    aiIssues: [
      {
        title: 'Missing FAQ Schema Markup',
        description: 'AI search engines like ChatGPT and Perplexity prioritize content with FAQ schemas when generating answers.',
        fix: 'Add FAQ schema markup to your top pages answering common customer questions.',
        priority: 'high',
      },
      {
        title: 'Weak Entity Definition',
        description: 'AI search engines need clear entity definitions to understand what your business does and who it serves.',
        fix: 'Add a clear "About" section with structured data defining your business, services, and location.',
        priority: 'high',
      },
      {
        title: 'No Authoritative Citations',
        description: 'AI models favor content with citations and expert sources when generating recommendations.',
        fix: 'Add citations, link to authoritative sources, and include expert quotes or statistics in your content.',
        priority: 'medium',
      },
      {
        title: 'Missing Conversational Content',
        description: 'AI search engines answer conversational queries. Your content needs to directly answer questions people ask.',
        fix: 'Create content that directly answers "who, what, when, where, why, how" questions about your business and industry.',
        priority: 'medium',
      },
      {
        title: 'No Review/Social Proof Schema',
        description: 'AI engines use review signals to determine authority. Reviews with schema markup are more likely to be cited.',
        fix: 'Add Review and AggregateRating schema markup showcasing customer reviews.',
        priority: 'low',
      },
    ],
    opportunities: [
      'Create a comprehensive FAQ page targeting question-based searches',
      'Build "Best of" and comparison content to capture AI recommendation queries',
      'Develop a resource hub to establish topical authority in your niche',
      'Optimize for voice search with natural language, question-answer format',
      'Create detailed service/product descriptions that AI can use as references',
    ],
    competitors: {
      suggested: [
        `competitor1-${hostname.split('.')[0]}.com`,
        `best-${hostname.split('.')[0]}-alternative.com`,
        `${hostname.split('.')[0]}-reviews.com`,
      ],
      gaps: [
        'Comparison content (your service vs alternatives)',
        'In-depth how-to guides and tutorials',
        'Industry statistics and original research',
      ],
    },
    actionPlan: {
      month1: [
        {
          task: 'Fix Critical Technical SEO Issues',
          effort: 'low',
          impact: 'high',
          description: 'Address all critical SEO issues identified in the audit, including meta tags, canonical URLs, and schema markup.',
        },
        {
          task: 'Create FAQ Content and Schema',
          effort: 'medium',
          impact: 'high',
          description: 'Research top 20 questions your customers ask and create an FAQ page with proper schema markup.',
        },
        {
          task: 'Optimize Meta Titles and Descriptions',
          effort: 'low',
          impact: 'high',
          description: 'Rewrite all page titles and descriptions to optimal length with primary keywords.',
        },
      ],
      month2: [
        {
          task: 'Build Topical Authority Content',
          effort: 'high',
          impact: 'high',
          description: 'Create 4-6 comprehensive blog posts covering core topics in your niche, each 1000+ words.',
        },
        {
          task: 'Implement Full Schema Markup',
          effort: 'medium',
          impact: 'medium',
          description: 'Add Organization, LocalBusiness, Product, or Service schema across all key pages.',
        },
        {
          task: 'Competitor Content Gap Analysis',
          effort: 'medium',
          impact: 'high',
          description: 'Identify what content competitors rank for that you don\'t and create superior versions.',
        },
      ],
      month3: [
        {
          task: 'Build High-Quality Backlinks',
          effort: 'high',
          impact: 'high',
          description: 'Launch outreach campaign for guest posts, directory listings, and partnership links.',
        },
        {
          task: 'Optimize for Voice and AI Search',
          effort: 'medium',
          impact: 'medium',
          description: 'Reformat existing content to directly answer conversational queries AI assistants receive.',
        },
        {
          task: 'Review and Refine Strategy',
          effort: 'low',
          impact: 'medium',
          description: 'Analyze traffic changes, track keyword rankings, and adjust content strategy based on data.',
        },
      ],
    },
    summary: {
      grade: seoResult.score >= 80 ? 'B' : seoResult.score >= 60 ? 'C' : seoResult.score >= 40 ? 'D' : 'F',
      topWins: [
        seoResult.metadata.isHttps ? 'Site uses HTTPS (security baseline met)' : '',
        seoResult.metadata.hasCanonical ? 'Canonical tags properly configured' : '',
      ].filter(Boolean).slice(0, 2),
      criticalIssues: seoResult.allIssues
        .filter(i => i.severity === 'critical')
        .slice(0, 3)
        .map(i => i.title),
    },
  }
}
