import UrlAnalyzer from '@/components/UrlAnalyzer'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-slate-50 font-bold text-lg">SEO Audit Pro</span>
          </div>
          <Link href="/admin" className="text-slate-500 hover:text-slate-400 text-sm transition-colors">
            Admin
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-teal-900/40 border border-teal-800/50 rounded-full px-4 py-1.5 text-teal-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
            Free instant analysis · No account required
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-slate-50 leading-tight mb-6">
            Find Out Why You&apos;re{' '}
            <span className="text-teal-400">Invisible</span> to Google{' '}
            &amp; AI Search
          </h1>

          <p className="text-slate-400 text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
            Get an instant SEO score, discover your top issues, and unlock a full audit with AI search optimisation analysis, competitor insights, and a 90-day action plan.
          </p>

          <UrlAnalyzer />

          <p className="text-slate-600 text-sm mt-4">
            Enter any URL · Results in under 30 seconds · Free score always shown
          </p>
        </div>
      </section>

      {/* Feature tiles */}
      <section className="px-6 py-16 bg-slate-800/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-slate-50 text-3xl font-bold text-center mb-12">
            Everything you need to rank higher
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: '📊',
                title: 'Instant SEO Score',
                desc: '50+ signals analysed in seconds — title tags, meta descriptions, headings, schema, Open Graph, and more.',
              },
              {
                icon: '🤖',
                title: 'AI Search Audit',
                desc: 'Optimise for ChatGPT, Perplexity, and Google AI Overviews. Get your AI search citation score.',
              },
              {
                icon: '📅',
                title: '90-Day Action Plan',
                desc: 'Month-by-month roadmap tailored to your site — from quick wins to long-term growth initiatives.',
              },
              {
                icon: '🏆',
                title: 'Competitor Analysis',
                desc: 'See what your top 3 competitors are doing right and identify the content gaps you can exploit.',
              },
              {
                icon: '📄',
                title: 'PDF Report',
                desc: 'Download a professional PDF report to share with your team or clients.',
              },
              {
                icon: '✉️',
                title: 'Email Delivery',
                desc: 'Your full report is emailed as a PDF so you can reference it anytime, anywhere.',
              },
            ].map(f => (
              <div
                key={f.title}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:shadow-lg hover:shadow-teal-900/20 hover:border-teal-900/50 transition-all"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-slate-50 font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20" id="pricing">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-slate-50 text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
          <p className="text-slate-400 text-center mb-12">Start free. Pay only when you want the full picture.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-col">
              <div className="mb-6">
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">Free</p>
                <p className="text-slate-50 text-4xl font-bold">$0</p>
                <p className="text-slate-500 text-sm mt-1">Always free</p>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {[
                  'Instant SEO score (0–100)',
                  'Top 3 critical issues',
                  'Category score breakdown',
                  'Page metadata analysis',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-slate-400 text-sm">
                    <span className="text-emerald-400 mt-0.5">✓</span>{item}
                  </li>
                ))}
              </ul>
              <Link
                href="#"
                className="block text-center py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium transition-colors"
              >
                Start Free
              </Link>
            </div>

            {/* One-time */}
            <div className="bg-gradient-to-br from-teal-900/40 to-slate-800 rounded-2xl p-6 border-2 border-teal-600 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className="mb-6">
                <p className="text-teal-400 text-sm font-medium uppercase tracking-wide mb-2">One-Time</p>
                <p className="text-slate-50 text-4xl font-bold">$199</p>
                <p className="text-slate-500 text-sm mt-1">Pay once, keep forever</p>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {[
                  'Everything in Free',
                  'Full prioritised issue list',
                  'All fix instructions',
                  'AI search score',
                  'Competitor analysis',
                  '90-day action plan',
                  'PDF report emailed',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-slate-300 text-sm">
                    <span className="text-teal-400 mt-0.5">✓</span>{item}
                  </li>
                ))}
              </ul>
              <Link
                href="#"
                className="block text-center py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-teal-900/40"
              >
                Get Full Report
              </Link>
            </div>

            {/* Monthly */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-col">
              <div className="mb-6">
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">Monthly</p>
                <p className="text-slate-50 text-4xl font-bold">$49<span className="text-slate-500 text-lg font-normal">/mo</span></p>
                <p className="text-slate-500 text-sm mt-1">Cancel anytime</p>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {[
                  'Everything in One-Time',
                  'Fresh audit every month',
                  'Track score over time',
                  'Ongoing recommendations',
                  'Priority support',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-slate-400 text-sm">
                    <span className="text-emerald-400 mt-0.5">✓</span>{item}
                  </li>
                ))}
              </ul>
              <Link
                href="#"
                className="block text-center py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium transition-colors"
              >
                Subscribe Monthly
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} SEO Audit Pro. Built for growth.
          </p>
        </div>
      </footer>
    </div>
  )
}
