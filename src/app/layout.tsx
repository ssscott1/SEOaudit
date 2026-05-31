import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SEO Audit Pro — Instant SEO & AI Search Analysis',
  description: 'Find out why your website is invisible to Google and AI search engines. Get a comprehensive SEO audit with actionable fix recommendations in minutes.',
  keywords: 'SEO audit, AI search optimisation, website analysis, Google ranking, search visibility',
  openGraph: {
    title: 'SEO Audit Pro — Instant SEO & AI Search Analysis',
    description: 'Find out why your website is invisible to Google and AI search engines.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-slate-900">
      <body className="min-h-screen bg-slate-900 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  )
}
