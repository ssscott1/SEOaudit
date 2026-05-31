import * as cheerio from 'cheerio'

export interface Issue {
  id: string
  severity: 'critical' | 'warning' | 'info'
  category: 'technical' | 'content' | 'performance' | 'social'
  title: string
  description: string
  fix: string
  impact: number // 1-10
}

export interface CategoryScore {
  score: number
  maxScore: number
  label: string
}

export interface SEOAnalysisResult {
  score: number
  allIssues: Issue[]
  categories: {
    technical: CategoryScore
    content: CategoryScore
    performance: CategoryScore
    social: CategoryScore
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
    hasRobots: boolean
    isHttps: boolean
    pageSize: number
    missingAltCount: number
    ogTitle: string
    ogDescription: string
    ogImage: string
  }
  html: string
}

function estimateReadingLevel(text: string): string {
  const words = text.split(/\s+/).filter(Boolean)
  const sentences = text.split(/[.!?]+/).filter(Boolean)
  const syllables = words.reduce((acc, word) => {
    return acc + countSyllables(word)
  }, 0)

  if (words.length === 0 || sentences.length === 0) return 'Unknown'

  const avgWordsPerSentence = words.length / sentences.length
  const avgSyllablesPerWord = syllables / words.length
  const fleschKincaid = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59

  if (fleschKincaid < 6) return 'Elementary'
  if (fleschKincaid < 9) return 'Middle School'
  if (fleschKincaid < 13) return 'High School'
  return 'College'
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '')
  if (word.length <= 3) return 1
  const vowels = word.match(/[aeiouy]+/g) || []
  return Math.max(1, vowels.length)
}

export async function analyzeSEO(url: string): Promise<SEOAnalysisResult> {
  const isHttps = url.startsWith('https://')
  let html = ''
  let fetchError = false

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; SEOAuditBot/1.0; +https://seoauditpro.com)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: controller.signal,
      redirect: 'follow',
    })
    clearTimeout(timeout)

    html = await response.text()
  } catch {
    fetchError = true
    html = ''
  }

  const $ = cheerio.load(html)

  // Meta analysis
  const title = $('title').first().text().trim()
  const description = $('meta[name="description"]').attr('content') || ''
  const keywords = $('meta[name="keywords"]').attr('content') || ''
  const canonical = $('link[rel="canonical"]').attr('href') || ''
  const robotsMeta = $('meta[name="robots"]').attr('content') || ''
  const viewportMeta = $('meta[name="viewport"]').attr('content') || ''
  const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || ''

  // OG tags
  const ogTitle = $('meta[property="og:title"]').attr('content') || ''
  const ogDescription = $('meta[property="og:description"]').attr('content') || ''
  const ogImage = $('meta[property="og:image"]').attr('content') || ''

  // Headings
  const h1Tags = $('h1')
  const h2Tags = $('h2')
  const h3Tags = $('h3')

  // Images
  const images = $('img')
  const imagesWithoutAlt = $('img:not([alt]), img[alt=""]')
  const missingAltCount = imagesWithoutAlt.length

  // Links
  let internalLinks = 0
  let externalLinks = 0
  const hostname = (() => {
    try { return new URL(url).hostname } catch { return '' }
  })()

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    if (href.startsWith('http') || href.startsWith('//')) {
      try {
        const linkHost = new URL(href.startsWith('//') ? `https:${href}` : href).hostname
        if (linkHost === hostname) internalLinks++
        else externalLinks++
      } catch {
        externalLinks++
      }
    } else if (href.startsWith('/') || href.startsWith('#') || href.startsWith('.')) {
      internalLinks++
    }
  })

  // Schema
  const hasSchema = $('script[type="application/ld+json"]').length > 0

  // Content
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim()
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length

  // Page size estimate
  const pageSize = Buffer.byteLength(html, 'utf8')

  const issues: Issue[] = []
  let technicalScore = 0
  const technicalMax = 35
  let contentScore = 0
  const contentMax = 35
  let performanceScore = 0
  const performanceMax = 20
  let socialScore = 0
  const socialMax = 10

  // ===== TECHNICAL CHECKS =====

  // HTTPS
  if (!isHttps) {
    issues.push({
      id: 'no-https',
      severity: 'critical',
      category: 'technical',
      title: 'Site Not Using HTTPS',
      description: 'Your site is not using HTTPS. This is a major security and ranking issue.',
      fix: 'Install an SSL certificate and redirect all HTTP traffic to HTTPS. Most hosting providers offer free SSL via Let\'s Encrypt.',
      impact: 10,
    })
  } else {
    technicalScore += 5
  }

  // Fetch error
  if (fetchError) {
    issues.push({
      id: 'fetch-error',
      severity: 'critical',
      category: 'technical',
      title: 'Unable to Crawl Page',
      description: 'The page could not be crawled. This may indicate the site blocks crawlers, has a timeout, or is down.',
      fix: 'Ensure the site is accessible and does not block legitimate crawlers via robots.txt or firewall rules.',
      impact: 10,
    })
  }

  // Canonical
  if (!canonical) {
    issues.push({
      id: 'no-canonical',
      severity: 'warning',
      category: 'technical',
      title: 'Missing Canonical Tag',
      description: 'No canonical tag found. This can lead to duplicate content issues.',
      fix: 'Add <link rel="canonical" href="YOUR_URL"> to the <head> section to indicate the preferred URL.',
      impact: 6,
    })
  } else {
    technicalScore += 5
  }

  // Viewport
  if (!viewportMeta) {
    issues.push({
      id: 'no-viewport',
      severity: 'critical',
      category: 'technical',
      title: 'Missing Viewport Meta Tag',
      description: 'No viewport meta tag found. This means the page may not render properly on mobile devices.',
      fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the <head> section.',
      impact: 8,
    })
  } else {
    technicalScore += 5
  }

  // Robots meta
  if (robotsMeta.includes('noindex')) {
    issues.push({
      id: 'noindex',
      severity: 'critical',
      category: 'technical',
      title: 'Page Set to noindex',
      description: 'The robots meta tag includes "noindex", which prevents search engines from indexing this page.',
      fix: 'Remove "noindex" from the robots meta tag if you want this page to appear in search results.',
      impact: 10,
    })
  } else {
    technicalScore += 5
  }

  // Schema
  if (!hasSchema) {
    issues.push({
      id: 'no-schema',
      severity: 'warning',
      category: 'technical',
      title: 'Missing Structured Data (Schema.org)',
      description: 'No JSON-LD structured data found. Structured data helps search engines understand your content.',
      fix: 'Add JSON-LD structured data appropriate for your content type (Organization, Article, Product, etc.).',
      impact: 7,
    })
  } else {
    technicalScore += 5
  }

  // Charset
  if (!charset) {
    issues.push({
      id: 'no-charset',
      severity: 'warning',
      category: 'technical',
      title: 'Missing Charset Declaration',
      description: 'No charset meta tag found. This can cause character encoding issues.',
      fix: 'Add <meta charset="UTF-8"> as the first element in the <head> section.',
      impact: 4,
    })
  } else {
    technicalScore += 5
  }

  // Page size
  if (pageSize > 500000) {
    issues.push({
      id: 'large-page',
      severity: 'warning',
      category: 'technical',
      title: 'Large Page Size',
      description: `Page size is ${Math.round(pageSize / 1024)}KB which may slow down loading.`,
      fix: 'Minify HTML, CSS, and JavaScript. Remove unnecessary whitespace and comments.',
      impact: 6,
    })
  } else if (pageSize > 0) {
    technicalScore += 5
  }

  // H1 count
  if (h1Tags.length === 0) {
    issues.push({
      id: 'no-h1',
      severity: 'critical',
      category: 'content',
      title: 'Missing H1 Tag',
      description: 'No H1 heading found on the page. The H1 is crucial for SEO.',
      fix: 'Add a single H1 tag that includes your primary keyword and accurately describes the page content.',
      impact: 9,
    })
  } else if (h1Tags.length > 1) {
    issues.push({
      id: 'multiple-h1',
      severity: 'warning',
      category: 'content',
      title: 'Multiple H1 Tags',
      description: `Found ${h1Tags.length} H1 tags. Pages should have exactly one H1.`,
      fix: 'Keep only one H1 tag and use H2, H3 for subheadings.',
      impact: 6,
    })
    contentScore += 3
  } else {
    contentScore += 8
  }

  // Title checks
  if (!title) {
    issues.push({
      id: 'no-title',
      severity: 'critical',
      category: 'content',
      title: 'Missing Page Title',
      description: 'The page has no title tag. This is one of the most important SEO elements.',
      fix: 'Add a descriptive title tag between 50-60 characters that includes your primary keyword.',
      impact: 10,
    })
  } else if (title.length < 30) {
    issues.push({
      id: 'title-too-short',
      severity: 'warning',
      category: 'content',
      title: 'Title Tag Too Short',
      description: `Your title is ${title.length} characters. Ideal length is 50-60 characters.`,
      fix: 'Expand your title to 50-60 characters, including your primary keyword near the beginning.',
      impact: 7,
    })
    contentScore += 4
  } else if (title.length > 65) {
    issues.push({
      id: 'title-too-long',
      severity: 'warning',
      category: 'content',
      title: 'Title Tag Too Long',
      description: `Your title is ${title.length} characters. Titles over 60 characters get truncated in search results.`,
      fix: 'Shorten your title to under 60 characters while keeping your primary keyword.',
      impact: 6,
    })
    contentScore += 5
  } else {
    contentScore += 8
  }

  // Description checks
  if (!description) {
    issues.push({
      id: 'no-description',
      severity: 'critical',
      category: 'content',
      title: 'Missing Meta Description',
      description: 'No meta description found. Search engines may generate a random snippet instead.',
      fix: 'Add a compelling meta description between 150-160 characters that includes your keyword and a call-to-action.',
      impact: 8,
    })
  } else if (description.length < 100) {
    issues.push({
      id: 'description-too-short',
      severity: 'warning',
      category: 'content',
      title: 'Meta Description Too Short',
      description: `Your meta description is ${description.length} characters. Ideal is 150-160 characters.`,
      fix: 'Expand your meta description to 150-160 characters with a compelling reason to click.',
      impact: 5,
    })
    contentScore += 5
  } else if (description.length > 165) {
    issues.push({
      id: 'description-too-long',
      severity: 'warning',
      category: 'content',
      title: 'Meta Description Too Long',
      description: `Your meta description is ${description.length} characters. It will be truncated in search results.`,
      fix: 'Shorten your meta description to under 160 characters.',
      impact: 4,
    })
    contentScore += 6
  } else {
    contentScore += 8
  }

  // Word count
  if (wordCount < 300) {
    issues.push({
      id: 'thin-content',
      severity: 'critical',
      category: 'content',
      title: 'Thin Content',
      description: `Page has only ${wordCount} words. Google prefers substantial content (300+ words minimum).`,
      fix: 'Add more valuable, unique content to the page. Aim for at least 500-1000 words for competitive topics.',
      impact: 8,
    })
  } else if (wordCount < 600) {
    issues.push({
      id: 'low-word-count',
      severity: 'warning',
      category: 'content',
      title: 'Low Word Count',
      description: `Page has ${wordCount} words. For competitive topics, aim for 600+ words.`,
      fix: 'Add more comprehensive content covering related topics and answering user questions.',
      impact: 5,
    })
    contentScore += 5
  } else {
    contentScore += 8
  }

  // Heading structure
  if (h2Tags.length === 0 && wordCount > 300) {
    issues.push({
      id: 'no-h2',
      severity: 'warning',
      category: 'content',
      title: 'No H2 Subheadings',
      description: 'No H2 tags found. Subheadings help organize content for users and search engines.',
      fix: 'Break your content into sections using H2 and H3 tags with relevant keywords.',
      impact: 5,
    })
  } else if (h2Tags.length > 0) {
    contentScore += 4
  }

  // Keywords in meta
  if (!keywords) {
    issues.push({
      id: 'no-keywords',
      severity: 'info',
      category: 'content',
      title: 'Missing Keywords Meta Tag',
      description: 'No keywords meta tag found. While not a direct ranking factor, it can help organize your content strategy.',
      fix: 'Add a keywords meta tag with 5-10 relevant keywords, though this has minimal SEO impact.',
      impact: 2,
    })
  }

  // Image alt tags
  if (missingAltCount > 0) {
    issues.push({
      id: 'missing-alt-tags',
      severity: missingAltCount > 3 ? 'critical' : 'warning',
      category: 'content',
      title: `${missingAltCount} Images Missing Alt Text`,
      description: `${missingAltCount} out of ${images.length} images are missing alt text. Alt text is crucial for accessibility and image SEO.`,
      fix: 'Add descriptive alt text to all images, including relevant keywords where appropriate.',
      impact: missingAltCount > 3 ? 7 : 5,
    })
  } else if (images.length > 0) {
    contentScore += 3
  }

  // Performance checks
  if (pageSize > 200000) {
    performanceScore += 5
  } else if (pageSize > 0) {
    performanceScore += 10
  }

  // Resource estimation
  const scriptCount = $('script[src]').length
  const styleCount = $('link[rel="stylesheet"]').length

  if (scriptCount > 15) {
    issues.push({
      id: 'too-many-scripts',
      severity: 'warning',
      category: 'performance',
      title: 'Too Many JavaScript Files',
      description: `Found ${scriptCount} external JavaScript files. Too many scripts slow down page loading.`,
      fix: 'Bundle and minify JavaScript files. Consider code splitting and lazy loading non-critical scripts.',
      impact: 6,
    })
  } else {
    performanceScore += 5
  }

  if (styleCount > 5) {
    issues.push({
      id: 'too-many-styles',
      severity: 'info',
      category: 'performance',
      title: 'Multiple Stylesheets',
      description: `Found ${styleCount} external CSS files. Multiple stylesheets increase render-blocking resources.`,
      fix: 'Combine CSS files and consider inlining critical CSS for faster rendering.',
      impact: 4,
    })
  } else {
    performanceScore += 5
  }

  // Social / OG checks
  if (!ogTitle) {
    issues.push({
      id: 'no-og-title',
      severity: 'warning',
      category: 'social',
      title: 'Missing Open Graph Title',
      description: 'No og:title meta tag found. This affects how your page appears when shared on social media.',
      fix: 'Add <meta property="og:title" content="Your Page Title"> to the <head> section.',
      impact: 5,
    })
  } else {
    socialScore += 3
  }

  if (!ogDescription) {
    issues.push({
      id: 'no-og-description',
      severity: 'warning',
      category: 'social',
      title: 'Missing Open Graph Description',
      description: 'No og:description meta tag found. Social shares will show a poor preview.',
      fix: 'Add <meta property="og:description" content="Your description"> to the <head> section.',
      impact: 4,
    })
  } else {
    socialScore += 3
  }

  if (!ogImage) {
    issues.push({
      id: 'no-og-image',
      severity: 'warning',
      category: 'social',
      title: 'Missing Open Graph Image',
      description: 'No og:image meta tag found. Posts shared on social media will not have an image.',
      fix: 'Add <meta property="og:image" content="https://yoursite.com/image.jpg"> with a 1200x630px image.',
      impact: 5,
    })
  } else {
    socialScore += 4
  }

  // URL structure check
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    if (pathname.length > 100) {
      issues.push({
        id: 'long-url',
        severity: 'info',
        category: 'technical',
        title: 'URL Too Long',
        description: `URL is ${url.length} characters. Shorter, cleaner URLs are better for SEO.`,
        fix: 'Keep URLs short and descriptive. Remove unnecessary parameters and use hyphens instead of underscores.',
        impact: 3,
      })
    }
    if (pathname.includes('_')) {
      issues.push({
        id: 'url-underscores',
        severity: 'info',
        category: 'technical',
        title: 'URL Contains Underscores',
        description: 'URLs use underscores instead of hyphens. Hyphens are preferred for readability and SEO.',
        fix: 'Use hyphens (-) instead of underscores (_) in your URL structure.',
        impact: 3,
      })
    }
  } catch { /* ignore URL parse errors */ }

  // Sort issues by severity and impact
  const severityOrder = { critical: 0, warning: 1, info: 2 }
  issues.sort((a, b) => {
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity]
    if (sevDiff !== 0) return sevDiff
    return b.impact - a.impact
  })

  // Calculate final score
  const totalMax = technicalMax + contentMax + performanceMax + socialMax
  const totalRaw = technicalScore + contentScore + performanceScore + socialScore
  const score = Math.min(100, Math.max(0, Math.round((totalRaw / totalMax) * 100)))

  return {
    score,
    allIssues: issues,
    categories: {
      technical: {
        score: Math.round((technicalScore / technicalMax) * 100),
        maxScore: 100,
        label: 'Technical SEO',
      },
      content: {
        score: Math.round((contentScore / contentMax) * 100),
        maxScore: 100,
        label: 'Content Quality',
      },
      performance: {
        score: Math.round((performanceScore / performanceMax) * 100),
        maxScore: 100,
        label: 'Performance',
      },
      social: {
        score: Math.round((socialScore / socialMax) * 100),
        maxScore: 100,
        label: 'Social & OG',
      },
    },
    metadata: {
      title,
      description,
      wordCount,
      imageCount: images.length,
      linkCount: internalLinks + externalLinks,
      internalLinks,
      externalLinks,
      h1Count: h1Tags.length,
      h2Count: h2Tags.length,
      hasSchema,
      hasCanonical: !!canonical,
      hasViewport: !!viewportMeta,
      hasRobots: !!robotsMeta,
      isHttps,
      pageSize,
      missingAltCount,
      ogTitle,
      ogDescription,
      ogImage,
    },
    html,
  }
}
