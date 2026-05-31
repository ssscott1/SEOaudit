import * as cheerio from 'cheerio'

export interface Issue {
  id: string
  severity: 'critical' | 'warning' | 'info'
  category: string
  title: string
  description: string
  fix: string
}

export interface SEOResult {
  score: number
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
}

export async function analyzeSEO(url: string): Promise<SEOResult> {
  const issues: Issue[] = []

  // Validate & normalize URL
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw new Error('Invalid URL')
  }

  // Fetch page HTML
  let html = ''
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEOAuditBot/1.0)',
      },
    })
    clearTimeout(timeout)
    html = await response.text()
  } catch {
    throw new Error('Failed to fetch URL. Please check the URL is accessible.')
  }

  const $ = cheerio.load(html)

  // --- HTTPS ---
  const isHttps = parsedUrl.protocol === 'https:'
  if (!isHttps) {
    issues.push({
      id: 'https-missing',
      severity: 'critical',
      category: 'technical',
      title: 'Site is not using HTTPS',
      description: 'Your site is served over HTTP, not HTTPS. Search engines penalise non-HTTPS sites and browsers show security warnings.',
      fix: 'Install an SSL certificate and redirect all HTTP traffic to HTTPS. Most hosting providers offer free SSL via Let\'s Encrypt.',
    })
  }

  // --- Title ---
  const title = $('title').first().text().trim()
  const titleLen = title.length
  if (!title) {
    issues.push({
      id: 'title-missing',
      severity: 'critical',
      category: 'content',
      title: 'Missing page title',
      description: 'No <title> tag was found. The title is one of the most important on-page SEO elements.',
      fix: 'Add a descriptive <title> tag between 50–60 characters that includes your primary keyword.',
    })
  } else if (titleLen < 30) {
    issues.push({
      id: 'title-too-short',
      severity: 'warning',
      category: 'content',
      title: `Page title is too short (${titleLen} chars)`,
      description: 'Your title tag is shorter than 30 characters. Short titles miss keyword opportunities and display poorly in search results.',
      fix: 'Expand your title to 50–60 characters. Include your primary keyword near the beginning.',
    })
  } else if (titleLen > 60) {
    issues.push({
      id: 'title-too-long',
      severity: 'warning',
      category: 'content',
      title: `Page title is too long (${titleLen} chars)`,
      description: `Your title is ${titleLen} characters. Google typically truncates titles beyond 60 characters in search results.`,
      fix: 'Shorten your title to under 60 characters while keeping your primary keyword.',
    })
  }

  // --- Meta Description ---
  const metaDesc = $('meta[name="description"]').attr('content') || ''
  const descLen = metaDesc.trim().length
  if (!metaDesc.trim()) {
    issues.push({
      id: 'meta-desc-missing',
      severity: 'critical',
      category: 'content',
      title: 'Missing meta description',
      description: 'No meta description was found. Meta descriptions appear in search results and heavily influence click-through rates.',
      fix: 'Add a <meta name="description"> tag with 150–160 characters summarising the page content.',
    })
  } else if (descLen < 70) {
    issues.push({
      id: 'meta-desc-too-short',
      severity: 'warning',
      category: 'content',
      title: `Meta description is too short (${descLen} chars)`,
      description: 'Your meta description is shorter than 70 characters, leaving valuable snippet space unused.',
      fix: 'Expand your meta description to 150–160 characters with a compelling call to action.',
    })
  } else if (descLen > 160) {
    issues.push({
      id: 'meta-desc-too-long',
      severity: 'warning',
      category: 'content',
      title: `Meta description is too long (${descLen} chars)`,
      description: `Your meta description is ${descLen} characters and will be truncated in search results.`,
      fix: 'Shorten your meta description to 150–160 characters.',
    })
  }

  // --- H1 ---
  const h1Tags = $('h1')
  const h1Count = h1Tags.length
  if (h1Count === 0) {
    issues.push({
      id: 'h1-missing',
      severity: 'critical',
      category: 'content',
      title: 'Missing H1 heading',
      description: 'No H1 heading was found. The H1 is a critical signal that tells search engines what your page is about.',
      fix: 'Add exactly one H1 tag containing your primary keyword. It should be the main heading of the page.',
    })
  } else if (h1Count > 1) {
    issues.push({
      id: 'h1-multiple',
      severity: 'warning',
      category: 'content',
      title: `Multiple H1 headings found (${h1Count})`,
      description: 'Having multiple H1 tags dilutes the SEO signal and can confuse search engines about the main topic.',
      fix: 'Consolidate to a single H1 tag. Convert other H1s to H2 or H3 as appropriate.',
    })
  }

  // --- H2 ---
  const h2Count = $('h2').length
  if (h2Count === 0 && h1Count > 0) {
    issues.push({
      id: 'h2-missing',
      severity: 'info',
      category: 'content',
      title: 'No H2 headings found',
      description: 'Using H2 headings to structure your content helps both users and search engines understand your page.',
      fix: 'Add H2 headings to organise your content into logical sections. Include secondary keywords where natural.',
    })
  }

  // --- Images without alt text ---
  const images = $('img')
  const imageCount = images.length
  let missingAlt = 0
  images.each((_, img) => {
    const alt = $(img).attr('alt')
    if (alt === undefined || alt === null || alt.trim() === '') missingAlt++
  })
  if (missingAlt > 0) {
    issues.push({
      id: 'images-missing-alt',
      severity: missingAlt > 3 ? 'critical' : 'warning',
      category: 'technical',
      title: `${missingAlt} image${missingAlt > 1 ? 's' : ''} missing alt text`,
      description: `${missingAlt} of ${imageCount} images have no alt attribute. Alt text helps search engines understand images and is essential for accessibility.`,
      fix: 'Add descriptive alt text to all images. Use keywords naturally but focus on accurately describing the image.',
    })
  }

  // --- Canonical ---
  const canonical = $('link[rel="canonical"]').attr('href') || ''
  if (!canonical) {
    issues.push({
      id: 'canonical-missing',
      severity: 'warning',
      category: 'technical',
      title: 'Missing canonical tag',
      description: 'No canonical tag was found. Without it, search engines may index duplicate versions of your page.',
      fix: 'Add <link rel="canonical" href="https://yourdomain.com/page"> in the <head> to specify the preferred URL.',
    })
  }

  // --- Viewport meta ---
  const viewport = $('meta[name="viewport"]').attr('content') || ''
  if (!viewport) {
    issues.push({
      id: 'viewport-missing',
      severity: 'critical',
      category: 'technical',
      title: 'Missing viewport meta tag',
      description: 'No viewport meta tag found. This means your site may not be mobile-friendly, which is a major ranking factor.',
      fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to your <head>.',
    })
  }

  // --- Robots meta ---
  const robotsMeta = $('meta[name="robots"]').attr('content') || ''
  if (robotsMeta.toLowerCase().includes('noindex')) {
    issues.push({
      id: 'robots-noindex',
      severity: 'critical',
      category: 'technical',
      title: 'Page is set to noindex',
      description: 'A robots meta tag with "noindex" is preventing search engines from indexing this page.',
      fix: 'Remove "noindex" from the robots meta tag unless you intentionally want this page excluded from search results.',
    })
  }

  // --- JSON-LD Schema ---
  const hasSchema = $('script[type="application/ld+json"]').length > 0
  if (!hasSchema) {
    issues.push({
      id: 'schema-missing',
      severity: 'warning',
      category: 'technical',
      title: 'No structured data (JSON-LD) found',
      description: 'Structured data helps search engines understand your content and can enable rich results in search (stars, FAQs, etc.).',
      fix: 'Add JSON-LD structured data relevant to your content type (Organization, Article, Product, FAQ, etc.).',
    })
  }

  // --- Open Graph ---
  const ogTitle = $('meta[property="og:title"]').attr('content') || ''
  const ogDescription = $('meta[property="og:description"]').attr('content') || ''
  const ogImage = $('meta[property="og:image"]').attr('content') || ''

  if (!ogTitle || !ogDescription || !ogImage) {
    const missing = []
    if (!ogTitle) missing.push('og:title')
    if (!ogDescription) missing.push('og:description')
    if (!ogImage) missing.push('og:image')
    issues.push({
      id: 'og-incomplete',
      severity: 'warning',
      category: 'social',
      title: `Missing Open Graph tags: ${missing.join(', ')}`,
      description: 'Open Graph tags control how your page appears when shared on social media. Missing tags result in poor-looking social shares.',
      fix: `Add the following Open Graph meta tags: ${missing.map(t => `<meta property="${t}" content="...">`).join(', ')}.`,
    })
  }

  // --- Twitter Card ---
  const twitterCard = $('meta[name="twitter:card"]').attr('content') || ''
  if (!twitterCard) {
    issues.push({
      id: 'twitter-card-missing',
      severity: 'info',
      category: 'social',
      title: 'Missing Twitter Card meta tags',
      description: 'Twitter Card tags control how your page appears when shared on Twitter/X.',
      fix: 'Add <meta name="twitter:card" content="summary_large_image"> and supporting twitter: meta tags.',
    })
  }

  // --- Word count ---
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim()
  const wordCount = bodyText.split(' ').filter(w => w.length > 0).length
  if (wordCount < 300) {
    issues.push({
      id: 'thin-content',
      severity: 'critical',
      category: 'content',
      title: `Thin content (${wordCount} words)`,
      description: 'Pages with fewer than 300 words are often considered thin content by search engines and may rank poorly.',
      fix: 'Expand your content to at least 500–800 words with substantive, helpful information for your target audience.',
    })
  } else if (wordCount < 600) {
    issues.push({
      id: 'low-word-count',
      severity: 'warning',
      category: 'content',
      title: `Low word count (${wordCount} words)`,
      description: 'Your page has fewer than 600 words. Comprehensive content typically ranks better for competitive keywords.',
      fix: 'Consider expanding your content with more detail, examples, FAQs, or supporting sections.',
    })
  }

  // --- Links ---
  const allLinks = $('a[href]')
  let internalLinks = 0
  let externalLinks = 0
  allLinks.each((_, a) => {
    const href = $(a).attr('href') || ''
    if (href.startsWith('http') || href.startsWith('//')) {
      try {
        const linkUrl = new URL(href.startsWith('//') ? 'https:' + href : href)
        if (linkUrl.hostname === parsedUrl.hostname) {
          internalLinks++
        } else {
          externalLinks++
        }
      } catch {
        // ignore
      }
    } else if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
      internalLinks++
    }
  })

  if (internalLinks < 3) {
    issues.push({
      id: 'low-internal-links',
      severity: 'info',
      category: 'technical',
      title: `Few internal links (${internalLinks})`,
      description: 'Internal links help search engines discover your content and distribute page authority across your site.',
      fix: 'Add links to related pages on your site within the content. Aim for at least 3–5 contextual internal links.',
    })
  }

  // --- Page size estimate ---
  const pageSizeKb = Math.round(Buffer.byteLength(html, 'utf8') / 1024)
  if (pageSizeKb > 200) {
    issues.push({
      id: 'large-page-size',
      severity: 'warning',
      category: 'performance',
      title: `Large page size (${pageSizeKb}KB HTML)`,
      description: 'Large HTML pages take longer to load, increasing time-to-first-byte and hurting Core Web Vitals.',
      fix: 'Minimise your HTML, remove unnecessary inline scripts/styles, and lazy-load non-critical content.',
    })
  }

  // --- Favicon ---
  const favicon = $('link[rel="icon"], link[rel="shortcut icon"]').attr('href') || ''
  if (!favicon) {
    issues.push({
      id: 'favicon-missing',
      severity: 'info',
      category: 'technical',
      title: 'No favicon found',
      description: 'A favicon improves brand recognition in browser tabs and bookmarks.',
      fix: 'Add <link rel="icon" href="/favicon.ico"> to your <head>.',
    })
  }

  // --- Heading hierarchy ---
  const hasH3WithoutH2 = $('h3').length > 0 && h2Count === 0
  if (hasH3WithoutH2) {
    issues.push({
      id: 'heading-hierarchy',
      severity: 'info',
      category: 'content',
      title: 'Inconsistent heading hierarchy',
      description: 'H3 headings were found without any H2 headings. Proper heading hierarchy improves both SEO and accessibility.',
      fix: 'Structure headings logically: H1 → H2 → H3. Do not skip heading levels.',
    })
  }

  // --- Keyword in title & H1 (basic check) ---
  if (title && h1Count > 0) {
    const h1Text = $('h1').first().text().trim().toLowerCase()
    const titleWords = title.toLowerCase().split(' ').filter(w => w.length > 4)
    const h1Words = h1Text.split(' ').filter(w => w.length > 4)
    const overlap = titleWords.filter(w => h1Words.includes(w))
    if (overlap.length === 0 && titleWords.length > 0) {
      issues.push({
        id: 'title-h1-mismatch',
        severity: 'warning',
        category: 'content',
        title: 'Title and H1 keywords don\'t align',
        description: 'Your page title and H1 heading share no common keywords. Aligning them reinforces your target keyword to search engines.',
        fix: 'Ensure your primary keyword appears in both the title tag and H1 heading.',
      })
    }
  }

  // --- Calculate scores per category ---
  const technicalIssues = issues.filter(i => i.category === 'technical')
  const contentIssues = issues.filter(i => i.category === 'content')
  const socialIssues = issues.filter(i => i.category === 'social')
  const performanceIssues = issues.filter(i => i.category === 'performance')

  function categoryScore(categoryIssues: Issue[]): number {
    let deduction = 0
    categoryIssues.forEach(i => {
      if (i.severity === 'critical') deduction += 25
      else if (i.severity === 'warning') deduction += 12
      else deduction += 5
    })
    return Math.max(0, 100 - deduction)
  }

  const categories = {
    technical: categoryScore(technicalIssues),
    content: categoryScore(contentIssues),
    social: categoryScore(socialIssues),
    performance: categoryScore(performanceIssues),
  }

  // Weighted overall score
  const score = Math.round(
    categories.technical * 0.35 +
    categories.content * 0.35 +
    categories.social * 0.15 +
    categories.performance * 0.15
  )

  return {
    score,
    allIssues: issues,
    categories,
    metadata: {
      title,
      description: metaDesc,
      wordCount,
      imageCount,
      url,
      h1Count,
      h2Count,
      internalLinks,
      externalLinks,
      hasSchema,
      hasCanonical: !!canonical,
      isHttps,
    },
  }
}
