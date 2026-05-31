'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UrlAnalyzer() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setError('')
    setLoading(true)

    let normalized = url.trim()
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized
    }

    try {
      new URL(normalized)
    } catch {
      setError('Please enter a valid URL (e.g. example.com or https://example.com)')
      setLoading(false)
      return
    }

    router.push(`/analyze?url=${encodeURIComponent(normalized)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Enter your website URL (e.g. example.com)"
          className="flex-1 px-5 py-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-50 placeholder-slate-500 text-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
          disabled={loading}
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="px-8 py-4 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold text-lg rounded-xl transition-all hover:shadow-lg hover:shadow-teal-900/20 whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analysing...
            </span>
          ) : (
            'Analyse Now'
          )}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-red-400 text-sm text-center">{error}</p>
      )}
    </form>
  )
}
