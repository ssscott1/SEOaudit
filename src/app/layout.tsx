import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'SEO Audit Pro — Instant SEO & AI Search Analysis',
  description: 'Get your free SEO score in seconds. Then unlock a full audit with prioritized fixes, AI search optimization, competitor analysis, and a 90-day action plan.',
  keywords: 'SEO audit, AI search optimization, website analysis, Google ranking, SEO score',
  openGraph: {
    title: 'SEO Audit Pro — Instant SEO & AI Search Analysis',
    description: 'Find out exactly why your site is invisible to Google and AI search engines.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
