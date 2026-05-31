import Anthropic from '@anthropic-ai/sdk'
import type { SEOResult } from './seo-analyzer'

export interface AIAnalysis {
  aiScore: number
  aiIssues: AIIssue[]
  competitors: Competitor[]
  actionPlan: ActionPlan
}

export interface AIIssue {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  fix: string
}

export interface Competitor {
  name: string
  url: string
  strengths: string[]
  contentGaps: string[]
}

export interface ActionPlan {
  month1: string[]
  month2: string[]
  month3: string[]
}

const MOCK_AI_ANALYSIS: AIAnalysis = {
  aiScore: 42,
  aiIssues: [
    {
      id: 'ai-faq-missing',
      severity: 'critical',
      title: 'No FAQ content for AI search snippet opportunities',
      description: 'AI search engines (ChatGPT, Perplexity, Google AI Overviews) prefer pages with explicit Q&A content they can cite as direct answers.',
      fix: 'Add a FAQ section with 5–10 common questions and clear, concise answers (2–4 sentences each). Mark them up with FAQ schema.',
    },
    {
      id: 'ai-entity-clarity',
      severity: 'warning',
      title: 'Business entity not clearly defined',
      description: 'AI models struggle to identify and cite your business when entity information (who you are, what you do, where you operate) is not explicit.',
      fix: 'Add an About section with clear entity signals: business name, location, services offered, founding year, and credentials.',
    },
    {
      id: 'ai-structured-answers',
      severity: 'warning',
      title: 'Content lacks structured answer format',
      description: 'AI search engines extract "best answer" snippets from pages with clear, well-structured responses. Walls of text are rarely cited.',
      fix: 'Restructure key content using headers, bullet lists, and numbered steps. Front-load answers before supporting detail.',
    },
  ],
  competitors: [
    {
      name: 'Competitor A',
      url: 'https://example-competitor-1.com',
      strengths: ['Comprehensive FAQ sections', 'Strong structured data', 'Regular content updates'],
      contentGaps: ['No video content', 'Limited case studies', 'Weak social proof'],
    },
    {
      name: 'Competitor B',
      url: 'https://example-competitor-2.com',
      strengths: ['High domain authority', 'Multiple topic clusters', 'Strong backlink profile'],
      contentGaps: ['Slow page load times', 'No schema markup', 'Poor mobile experience'],
    },
    {
      name: 'Competitor C',
      url: 'https://example-competitor-3.com',
      strengths: ['Active blog with AI-ready content', 'Clear entity pages', 'Good internal linking'],
      contentGaps: ['Limited local SEO', 'No podcast/audio content', 'Weak email capture'],
    },
  ],
  actionPlan: {
    month1: [
      'Fix all critical technical SEO issues (HTTPS, canonical, viewport)',
      'Add/optimise title tags and meta descriptions for top 5 pages',
      'Add one H1 to every page that is missing it',
      'Add alt text to all images',
      'Install Google Search Console and submit sitemap',
    ],
    month2: [
      'Add FAQ section with schema markup to homepage and top service pages',
      'Create Organisation and WebSite JSON-LD schema',
      'Expand thin content pages to 800+ words',
      'Add Open Graph and Twitter Card tags to all pages',
      'Build 5 high-quality internal links between related pages',
    ],
    month3: [
      'Create 4 blog posts targeting long-tail keywords from competitor gap analysis',
      'Implement a content cluster strategy around your primary topic',
      'Optimise Core Web Vitals (LCP, FID, CLS)',
      'Launch a link-building outreach campaign',
      'Set up monthly performance reporting in Google Analytics 4',
    ],
  },
}

export async function analyzeWithAI(url: string, seoResult: SEOResult, pageContent: string): Promise<AIAnalysis> {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_key_here') {
    console.warn('ANTHROPIC_API_KEY not set — returning mock AI analysis')
    return MOCK_AI_ANALYSIS
  }

  const client = new Anthropic()

  const systemPrompt = `You are an expert SEO and AI search optimisation analyst. Your job is to analyse websites and provide actionable recommendations for both traditional search engines (Google) and AI-powered search (ChatGPT, Perplexity, Google AI Overviews, Claude).

You must respond ONLY with valid JSON matching this exact structure:
{
  "aiScore": <number 0-100>,
  "aiIssues": [
    {
      "id": "<unique-slug>",
      "severity": "<critical|warning|info>",
      "title": "<concise title>",
      "description": "<2-3 sentences explaining the problem>",
      "fix": "<specific actionable fix>"
    }
  ],
  "competitors": [
    {
      "name": "<competitor name>",
      "url": "<competitor URL>",
      "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
      "contentGaps": ["<gap 1>", "<gap 2>", "<gap 3>"]
    }
  ],
  "actionPlan": {
    "month1": ["<action 1>", "<action 2>", "<action 3>", "<action 4>", "<action 5>"],
    "month2": ["<action 1>", "<action 2>", "<action 3>", "<action 4>", "<action 5>"],
    "month3": ["<action 1>", "<action 2>", "<action 3>", "<action 4>", "<action 5>"]
  }
}

Rules:
- aiScore: Rate how well the site is optimised for AI search engines (0 = terrible, 100 = excellent)
- aiIssues: 3-6 specific issues with AI search visibility (FAQ gaps, entity clarity, structured answers, citation worthiness, E-E-A-T signals)
- competitors: 3 realistic competitor sites in the same niche (base on the URL/content provided)
- actionPlan: Prioritised 90-day plan, month1 = quick wins, month2 = structural improvements, month3 = growth initiatives
- Be specific to the actual site/niche — do not give generic advice`

  const userMessage = `Analyse this website for AI search optimisation:

URL: ${url}

SEO Score: ${seoResult.score}/100

Current SEO Issues Found:
${seoResult.allIssues.map(i => `- [${i.severity.toUpperCase()}] ${i.title}`).join('\n')}

Page Metadata:
- Title: ${seoResult.metadata.title || 'MISSING'}
- Description: ${seoResult.metadata.description || 'MISSING'}
- Word Count: ${seoResult.metadata.wordCount}
- Images: ${seoResult.metadata.imageCount}
- Has Schema: ${seoResult.metadata.hasSchema}
- H1 Count: ${seoResult.metadata.h1Count}

Page Content Sample (first 2000 chars):
${pageContent.substring(0, 2000)}

Provide your analysis as JSON only.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    // Extract JSON from response (may have markdown code blocks)
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')

    const parsed = JSON.parse(jsonMatch[0]) as AIAnalysis
    return parsed
  } catch (err) {
    console.error('AI analysis failed:', err)
    return MOCK_AI_ANALYSIS
  }
}
