'use client'

import UrlAnalyzer from '@/components/UrlAnalyzer'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Navigation */}
      <nav className="border-b border-[#334155]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0D9488] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg">SEO Audit Pro</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#pricing" className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</a>
              <a href="/admin" className="text-gray-400 hover:text-white text-sm transition-colors">Admin</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-900/30 border border-teal-800 rounded-full px-4 py-1.5 text-teal-400 text-sm mb-6">
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
            Free instant analysis — no signup required
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Find Out Why You&apos;re
            <br />
            <span className="text-[#0D9488]">Invisible to Google</span>
            <br />
            & AI Search
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Get your free SEO score and top 3 issues in under 30 seconds.
            Then unlock a full AI-powered audit with every fix and a 90-day plan.
          </p>

          <UrlAnalyzer />

          <p className="text-gray-500 text-sm mt-4">
            Works with any website. No signup needed for free analysis.
          </p>
        </div>
      </section>

      {/* Features Tiles */}
      <section className="py-16 px-4 bg-[#0F172A]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 hover:border-[#0D9488] transition-all duration-300 group">
              <div className="w-12 h-12 bg-teal-900/30 border border-teal-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-900/50 transition-colors">
                <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Instant SEO Score</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Get a comprehensive 0-100 score across technical SEO, content quality, performance, and social signals — in seconds.
              </p>
            </div>

            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 hover:border-[#0D9488] transition-all duration-300 group">
              <div className="w-12 h-12 bg-teal-900/30 border border-teal-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-900/50 transition-colors">
                <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">AI Search Audit</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Discover how well you rank in ChatGPT, Perplexity, Claude, and Gemini answers — the future of search is AI-powered.
              </p>
            </div>

            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 hover:border-[#0D9488] transition-all duration-300 group">
              <div className="w-12 h-12 bg-teal-900/30 border border-teal-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-900/50 transition-colors">
                <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">90-Day Action Plan</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Get a step-by-step, prioritized plan with exact tasks for each month to climb rankings and dominate your niche.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 border-t border-[#334155]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-gray-400">Three simple steps to a better-ranking website</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Enter Your URL',
                desc: 'Paste your website URL. We analyze 50+ SEO signals in real-time.',
              },
              {
                step: '02',
                title: 'Get Your Free Score',
                desc: 'See your SEO score and top 3 critical issues instantly. No signup required.',
              },
              {
                step: '03',
                title: 'Unlock Full Report',
                desc: 'Pay once for a complete audit with every fix, competitor data, and action plan.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-[#0D9488]/20 border border-teal-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-400 font-bold text-lg">{item.step}</span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 bg-[#1E293B] border-y border-[#334155]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Trusted by businesses</p>
            <h2 className="text-3xl font-bold text-white">Join 2,000+ Businesses Who&apos;ve Audited Their Site</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: 'Found 3 critical issues we had no idea about. Fixed them in a week and saw ranking improvements within a month.',
                name: 'Sarah K.',
                role: 'E-commerce Owner',
                score: 92,
              },
              {
                quote: 'The AI search optimization section was eye-opening. We were completely invisible to ChatGPT users. Now we show up.',
                name: 'Marcus T.',
                role: 'Digital Agency CEO',
                score: 78,
              },
              {
                quote: 'The 90-day action plan saved us thousands in consulting fees. Everything was specific and prioritized.',
                name: 'Priya M.',
                role: 'SaaS Founder',
                score: 85,
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-[#0F172A] border border-[#334155] rounded-xl p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">{testimonial.name}</p>
                    <p className="text-gray-500 text-xs">{testimonial.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-teal-400 font-bold">{testimonial.score}/100</p>
                    <p className="text-gray-500 text-xs">Final Score</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Simple, Transparent Pricing</h2>
            <p className="text-gray-400">Start free. Upgrade when you&apos;re ready to fix your issues.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
              <div className="mb-6">
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Free</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$0</span>
                </div>
                <p className="text-gray-500 text-sm mt-1">No credit card needed</p>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  'SEO score (0-100)',
                  'Top 3 critical issues',
                  'Quick overview',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-400 text-sm">
                    <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className="block text-center py-3 border border-[#334155] hover:border-[#0D9488] text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all"
              >
                Start Free Analysis
              </a>
            </div>

            {/* One-time */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
              <div className="mb-6">
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Full Report</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$199</span>
                  <span className="text-gray-400">once</span>
                </div>
                <p className="text-gray-500 text-sm mt-1">One-time payment</p>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  'Complete issue list + fixes',
                  'AI search optimization',
                  'Competitor analysis',
                  '90-day action plan',
                  'PDF report via email',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                    <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className="block text-center py-3 bg-[#1E293B] border border-[#0D9488] hover:bg-[#0D9488] text-teal-400 hover:text-white rounded-lg text-sm font-medium transition-all"
              >
                Get Full Report
              </a>
            </div>

            {/* Monthly — Best */}
            <div className="bg-[#1E293B] border-2 border-[#0D9488] rounded-xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#0D9488] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                  Most Popular
                </span>
              </div>
              <div className="mb-6 mt-2">
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Monthly Audit</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$49</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-teal-400 text-sm mt-1">Cancel anytime</p>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  'Everything in Full Report',
                  'Monthly re-audit',
                  'Progress tracking',
                  'Updated action plans',
                  'Priority support',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                    <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className="block text-center py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-teal-900/30"
              >
                Start Monthly Audit
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#334155] py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0D9488] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-white font-bold">SEO Audit Pro</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 SEO Audit Pro. Professional SEO Analysis.</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>Secured by Stripe</span>
            <span>·</span>
            <span>GDPR Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
