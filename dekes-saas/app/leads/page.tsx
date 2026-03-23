'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Lead = {
  id: string
  status: string
  entityType: string
  name: string | null
  title: string | null
  company: string | null
  website: string | null
  sourceUrl: string | null
  score: number | null
  createdAt: string
  triggerEvent: string | null
  whyNow: string | null
  qualityTier: string | null
  discoveryScore: number | null
  evidenceCount: number | null
  recommendedAction: string | null
  recommendedWindow: string | null
  confidenceLabel: string | null
}

export default function LeadsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])

  const grouped = useMemo(() => {
    const buckets: Record<string, Lead[]> = {}
    for (const lead of leads) {
      const key = lead.status || 'UNKNOWN'
      if (!buckets[key]) buckets[key] = []
      buckets[key].push(lead)
    }
    return buckets
  }, [leads])

  useEffect(() => {
    setLoading(true)
    setError('')

    fetch('/api/leads', { credentials: 'include' })
      .then(async (res) => {
        const data = await res.json().catch(() => null)
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load leads')
        }
        return data
      })
      .then((data) => {
        setLeads((data?.leads || []) as Lead[])
      })
      .catch((e: { message?: string }) => setError(e.message || 'Failed to load leads'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-white font-bold">
                DEKES
              </Link>
              <span className="text-sm text-slate-400">Leads</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/runs/new"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
              >
                Run New Search
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="text-slate-200">Loading leads...</div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        ) : leads.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
            <h1 className="text-2xl font-bold text-white mb-2">No leads yet</h1>
            <p className="text-slate-400 mb-6">Run a search to generate your first batch of qualified buyers.</p>
            <Link
              href="/runs/new"
              className="inline-flex px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Run New Search
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Lead Intelligence</h1>
              <p className="text-slate-400">
                Each account now includes discovery proof, quality gating, and a next-best action.
              </p>
            </div>

            {Object.entries(grouped)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([status, items]) => (
                <section
                  key={status}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="text-white font-semibold">{status}</div>
                    <div className="text-slate-400 text-sm">{items.length} leads</div>
                  </div>

                  <div className="divide-y divide-slate-800">
                    {items.map((lead) => (
                      <div key={lead.id} className="px-6 py-5">
                        <div className="grid lg:grid-cols-[1.4fr_1fr_0.9fr_0.7fr] gap-6">
                          <div>
                            <Link
                              href={`/leads/${lead.id}`}
                              className="text-white font-semibold hover:text-cyan-300 transition"
                            >
                              {lead.name || lead.title || 'Untitled'}
                            </Link>
                            <div className="text-slate-400 text-sm mt-1">{lead.entityType}</div>
                            {lead.triggerEvent && (
                              <div className="text-cyan-300 text-sm mt-3">{lead.triggerEvent}</div>
                            )}
                            {lead.whyNow && (
                              <div className="text-slate-400 text-sm mt-2 max-w-xl">{lead.whyNow}</div>
                            )}
                          </div>

                          <div>
                            <div className="text-white">{lead.company || '—'}</div>
                            {lead.website ? (
                              <a
                                className="text-blue-400 hover:text-blue-300 text-sm"
                                href={lead.website}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {lead.website}
                              </a>
                            ) : (
                              <div className="text-slate-400 text-sm">—</div>
                            )}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {lead.qualityTier && (
                                <span className="px-2 py-1 rounded-full text-xs border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                                  {lead.qualityTier}
                                </span>
                              )}
                              {lead.confidenceLabel && (
                                <span className="px-2 py-1 rounded-full text-xs border border-blue-500/20 bg-blue-500/10 text-blue-300">
                                  {lead.confidenceLabel} confidence
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="text-white text-sm">Score: {lead.score ?? '—'}</div>
                            <div className="text-slate-400 text-sm mt-1">
                              Discovery: {lead.discoveryScore ?? '—'}
                            </div>
                            <div className="text-slate-400 text-sm mt-1">
                              Evidence: {lead.evidenceCount ?? '—'}
                            </div>
                            {lead.recommendedWindow && (
                              <div className="text-emerald-300 text-sm mt-3">{lead.recommendedWindow}</div>
                            )}
                            {lead.recommendedAction && (
                              <div className="text-slate-400 text-sm mt-2">{lead.recommendedAction}</div>
                            )}
                          </div>

                          <div className="flex flex-col items-start gap-3">
                            {lead.sourceUrl ? (
                              <a
                                className="text-blue-400 hover:text-blue-300 text-sm"
                                href={lead.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Open Source
                              </a>
                            ) : (
                              <div className="text-slate-400 text-sm">—</div>
                            )}
                            <div className="text-slate-300 text-sm">
                              {new Date(lead.createdAt).toLocaleString()}
                            </div>
                            <Link
                              href={`/leads/${lead.id}`}
                              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition"
                            >
                              View Proof
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
          </div>
        )}
      </main>
    </div>
  )
}
