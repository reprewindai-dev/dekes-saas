'use client'

import { useEffect, useState } from 'react'
import { BrainCircuit, ShieldCheck, TrendingUp, Zap } from 'lucide-react'

type AnalyticsPayload = {
  winRate: number
  funnel: Record<string, number>
  quality: {
    avgDiscoveryScore: number
    avgQualityScore: number
    mustHaveLeads: number
    highScoreLeads: number
  }
}

export default function LeadIntelligencePanel() {
  const [data, setData] = useState<AnalyticsPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leads/analytics', { credentials: 'include' })
      .then((res) => res.json())
      .then((payload) => setData(payload))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-slate-400">
        Loading lead intelligence...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-slate-400">
        Lead intelligence analytics are unavailable right now.
      </div>
    )
  }

  const reviewCount = data.funnel.REVIEW ?? 0
  const readyCount = data.funnel.OUTREACH_READY ?? 0

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-cyan-300" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Lead Intelligence Engine</h2>
          <p className="text-slate-400 text-sm">
            Discovery gate, quality gate, and closed-loop scoring performance.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <ShieldCheck className="w-4 h-4 text-cyan-300" />
            Discovery Score
          </div>
          <div className="text-2xl font-bold text-white">{data.quality.avgDiscoveryScore}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <Zap className="w-4 h-4 text-emerald-300" />
            Quality Score
          </div>
          <div className="text-2xl font-bold text-white">{data.quality.avgQualityScore}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <TrendingUp className="w-4 h-4 text-blue-300" />
            Must-Have Leads
          </div>
          <div className="text-2xl font-bold text-white">{data.quality.mustHaveLeads}</div>
          <div className="text-xs text-slate-500 mt-1">{readyCount} already outreach-ready</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <BrainCircuit className="w-4 h-4 text-violet-300" />
            Feedback Loop
          </div>
          <div className="text-2xl font-bold text-white">{data.winRate}%</div>
          <div className="text-xs text-slate-500 mt-1">{reviewCount} leads still in analyst review</div>
        </div>
      </div>
    </div>
  )
}
