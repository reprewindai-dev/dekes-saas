'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Clock3,
  ExternalLink,
  Filter,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'

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

const leadStatusOrder = ['SEND_NOW', 'QUEUE', 'HOLD', 'REJECTED']

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

  const summary = useMemo(() => {
    const sendNow = grouped.SEND_NOW?.length ?? 0
    const queue = grouped.QUEUE?.length ?? 0
    const hold = grouped.HOLD?.length ?? 0
    const rejected = grouped.REJECTED?.length ?? 0
    const avgScore =
      leads.length > 0
        ? Math.round(leads.reduce((sum, lead) => sum + (lead.score ?? 0), 0) / leads.length)
        : 0

    return { sendNow, queue, hold, rejected, avgScore }
  }, [grouped, leads])

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
      .then((data) => setLeads((data?.leads || []) as Lead[]))
      .catch((e: { message?: string }) => setError(e.message || 'Failed to load leads'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="dekes-shell min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[32px] border border-white/8 bg-[#07111f]/84 px-6 py-5 backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="dekes-panel flex h-12 w-12 items-center justify-center rounded-2xl">
                <Radar className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <p className="font-[var(--font-display)] text-xl font-semibold tracking-[0.16em] text-white">
                  DEKES
                </p>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--dekes-subtle)]">
                  Lead review surface
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/dashboard" className="rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white">
                Dashboard
              </Link>
              <Link
                href="/runs/new"
                className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-semibold text-slate-950"
              >
                Run New Search
              </Link>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="dekes-panel rounded-[28px] px-8 py-6 text-white">Loading leads...</div>
        ) : error ? (
          <div className="dekes-panel rounded-[28px] border-red-500/20 bg-red-500/10 px-6 py-5 text-sm text-red-200">
            {error}
          </div>
        ) : leads.length === 0 ? (
          <div className="dekes-panel-strong rounded-[32px] px-8 py-12">
            <h1 className="font-[var(--font-display)] text-3xl font-semibold text-white">No leads yet</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--dekes-muted)]">
              The runtime is empty. Launch a search and DEKES will start filling this surface with validated buyers,
              proof packs, timing windows, and recommended motion.
            </p>
            <Link
              href="/runs/new"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3.5 font-semibold text-slate-950"
            >
              Run New Search
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <>
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              <LeadSummaryCard label="SEND_NOW" value={summary.sendNow} detail="Highest urgency accounts" icon={Target} />
              <LeadSummaryCard label="QUEUE" value={summary.queue} detail="Strong, but slightly later timing" icon={Clock3} />
              <LeadSummaryCard label="HOLD" value={summary.hold} detail="Interesting, not yet proven" icon={Filter} />
              <LeadSummaryCard label="REJECTED" value={summary.rejected} detail="Rejected before sales wasted time" icon={ShieldCheck} />
              <LeadSummaryCard label="Avg score" value={summary.avgScore} detail="Average runtime confidence" icon={Sparkles} />
            </section>

            <section className="dekes-panel-strong rounded-[32px] p-7">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Lead runtime</p>
              <h1 className="mt-4 font-[var(--font-display)] text-4xl font-semibold text-white">
                Only the accounts with proof should live here.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--dekes-muted)]">
                Every card below should give a rep enough confidence to decide whether to move now, queue the account,
                hold it, or ignore it entirely. No vague lead scoring. No listicle trash. No page-level noise.
              </p>
            </section>

            <div className="space-y-8">
              {leadStatusOrder
                .filter((status) => grouped[status]?.length)
                .map((status) => (
                  <section key={status} className="dekes-panel rounded-[32px] overflow-hidden">
                    <div className="flex flex-col gap-3 border-b border-white/8 px-6 py-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-[var(--font-display)] text-2xl font-semibold text-white">{status}</p>
                        <p className="mt-1 text-sm text-[var(--dekes-muted)]">
                          {status === 'SEND_NOW'
                            ? 'Move first. These buyers already have enough proof and urgency.'
                            : status === 'QUEUE'
                              ? 'Keep these buyers warm and hit them in the recommended window.'
                              : status === 'HOLD'
                                ? 'Interesting signals, but still missing proof before outreach.'
                                : 'Rejected by the runtime so sales never has to waste a cycle.'}
                        </p>
                      </div>
                      <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                        {grouped[status].length} leads
                      </div>
                    </div>

                    <div className="space-y-4 p-4 sm:p-6">
                      {grouped[status].map((lead) => (
                        <LeadCard key={lead.id} lead={lead} />
                      ))}
                    </div>
                  </section>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function LeadSummaryCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: number
  detail: string
  icon: typeof Target
}) {
  return (
    <div className="dekes-panel rounded-[24px] p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[var(--dekes-subtle)]">{label}</p>
      <p className="mt-2 font-[var(--font-display)] text-3xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--dekes-muted)]">{detail}</p>
    </div>
  )
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr_0.85fr_0.8fr]">
        <div>
          <Link href={`/leads/${lead.id}`} className="font-[var(--font-display)] text-2xl font-semibold text-white hover:text-cyan-200">
            {lead.name || lead.title || 'Untitled lead'}
          </Link>
          <p className="mt-1 text-sm uppercase tracking-[0.18em] text-[var(--dekes-subtle)]">{lead.entityType}</p>
          {lead.triggerEvent && <p className="mt-4 text-sm font-medium text-cyan-200">{lead.triggerEvent}</p>}
          {lead.whyNow && <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--dekes-muted)]">{lead.whyNow}</p>}
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--dekes-subtle)]">Company</p>
            <p className="mt-2 text-white">{lead.company || 'Unknown company'}</p>
          </div>
          {lead.website ? (
            <a
              className="inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-cyan-100"
              href={lead.website}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              {lead.website.replace(/^https?:\/\//, '')}
            </a>
          ) : (
            <p className="text-sm text-[var(--dekes-subtle)]">No website</p>
          )}
          <div className="flex flex-wrap gap-2">
            {lead.qualityTier && (
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs text-cyan-100">
                {lead.qualityTier}
              </span>
            )}
            {lead.confidenceLabel && (
              <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-xs text-blue-100">
                {lead.confidenceLabel} confidence
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <MetricLine label="Score" value={lead.score ?? 0} />
          <MetricLine label="Discovery" value={lead.discoveryScore ?? 0} />
          <MetricLine label="Evidence" value={lead.evidenceCount ?? 0} max={8} />
        </div>

        <div className="flex flex-col items-start gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--dekes-subtle)]">Recommended window</p>
            <p className="mt-2 text-sm text-white">{lead.recommendedWindow || 'Monitor for another trigger'}</p>
          </div>
          <p className="text-sm leading-7 text-[var(--dekes-muted)]">
            {lead.recommendedAction || 'No action packaged yet.'}
          </p>
          <div className="mt-auto flex flex-wrap gap-3">
            {lead.sourceUrl && (
              <a
                href={lead.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-medium text-white"
              >
                Source
              </a>
            )}
            <Link
              href={`/leads/${lead.id}`}
              className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              View proof
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricLine({
  label,
  value,
  max = 100,
}: {
  label: string
  value: number
  max?: number
}) {
  const pct = max > 0 ? (value / max) * 100 : 0

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-[var(--dekes-subtle)]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="dekes-stat-line">
        <span style={{ width: `${Math.max(4, Math.min(100, pct))}%` }} />
      </div>
    </div>
  )
}
