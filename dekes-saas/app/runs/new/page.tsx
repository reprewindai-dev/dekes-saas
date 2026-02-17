'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type Optimization = any

type RunResponse = {
  organizationId: string
  query: { id: string; query: string }
  run: { id: string; status: string; startedAt: string; finishedAt: string | null }
  optimization: Optimization
}

export default function NewRunPage() {
  const [query, setQuery] = useState('find B2B SaaS founders in Austin who recently raised seed')
  const [estimatedResults, setEstimatedResults] = useState(100)
  const [carbonBudget, setCarbonBudget] = useState(10000)
  const [regions, setRegions] = useState('US-CAL-CISO,FR,DE')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<RunResponse | null>(null)

  const regionList = useMemo(() => {
    return regions
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean)
  }, [regions])

  async function runSearch() {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/leads/run', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          estimatedResults,
          carbonBudget,
          regions: regionList,
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to run search')
      }

      setResult(data as RunResponse)
    } catch (e: any) {
      setError(e.message || 'Failed to run search')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-white font-bold">
                DEKES
              </Link>
              <span className="text-sm text-slate-400">Run New Search</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/leads" className="text-sm text-slate-300 hover:text-white transition">
                Review Leads
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Run a Lead Generation Search</h1>
          <p className="text-slate-400">
            This runs your query through ECOBE optimization and records a run in the database.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Search Query</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Describe your ideal customer and intent signals…"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Estimated Results</label>
                <input
                  type="number"
                  value={estimatedResults}
                  onChange={(e) => setEstimatedResults(parseInt(e.target.value || '0', 10) || 0)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Carbon Budget</label>
                <input
                  type="number"
                  value={carbonBudget}
                  onChange={(e) => setCarbonBudget(parseFloat(e.target.value || '0') || 0)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Candidate Regions (comma-separated)</label>
              <input
                type="text"
                value={regions}
                onChange={(e) => setRegions(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <div className="mt-2 text-xs text-slate-500">Example: US-CAL-CISO,FR,DE</div>
            </div>

            <button
              disabled={loading || query.trim().length === 0}
              onClick={runSearch}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition"
            >
              {loading ? 'Running…' : 'Run Search'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-white font-semibold">Run Complete</div>
                <div className="text-slate-400 text-sm">Run ID: {result.run.id}</div>
              </div>
              <Link
                href="/leads"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition"
              >
                Go to Leads
              </Link>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-lg">
                <div className="text-slate-400 text-xs mb-1">Query</div>
                <div className="text-white">{result.query.query}</div>
              </div>
              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-lg">
                <div className="text-slate-400 text-xs mb-1">Status</div>
                <div className="text-white">{result.run.status}</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-slate-300 font-semibold mb-2">Optimization Output</div>
              <pre className="text-xs text-slate-200 bg-slate-950/40 border border-slate-800 rounded-lg p-4 overflow-x-auto">
                {JSON.stringify(result.optimization, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
