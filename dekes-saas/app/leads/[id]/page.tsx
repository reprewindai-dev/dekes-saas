'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Activity, CheckCircle2, Clock3, XCircle } from 'lucide-react'
import LeadHandoffSection from '@/components/ecobe/lead-handoff-section'

interface Lead {
  id: string
  title: string
  snippet: string
  sourceUrl: string
  score: number
  status: string
  createdAt: string
  meta: Record<string, any>
  enrichmentMeta?: Record<string, any>
}

interface EcobeHandoff {
  id: string
  status: string
  qualificationScore: number | null
  qualificationReason: string | null
  createdAt: string
  sentAt: string | null
  convertedAt: string | null
  attempts: number
}

const OUTCOME_ACTIONS = [
  { label: 'Mark Contacted', status: 'CONTACTED', icon: Clock3 },
  { label: 'Move To Review', status: 'REVIEW', icon: Activity },
  { label: 'Mark Won', status: 'WON', icon: CheckCircle2 },
  { label: 'Mark Lost', status: 'LOST', icon: XCircle },
] as const

export default function LeadDetailPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [lead, setLead] = useState<Lead | null>(null)
  const [handoff, setHandoff] = useState<EcobeHandoff | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savingStatus, setSavingStatus] = useState<string | null>(null)

  useEffect(() => {
    const pathParts = window.location.pathname.split('/')
    const leadId = pathParts[pathParts.length - 1]

    if (!leadId || leadId === 'page') {
      router.push('/leads')
      return
    }

    Promise.all([
      fetch(`/api/leads/${leadId}`, { credentials: 'include' }),
      fetch(`/api/leads/${leadId}/ecobe-handoff`, { credentials: 'include' }),
    ])
      .then(async ([leadRes, handoffRes]) => {
        const leadData = await leadRes.json()
        const handoffData = await handoffRes.json()

        if (!leadRes.ok) {
          throw new Error(leadData.error || 'Failed to load lead')
        }

        setLead(leadData.lead)
        setHandoff(handoffData.handoff || null)
      })
      .catch((err: { message?: string }) => setError(err.message || 'Failed to load lead'))
      .finally(() => setLoading(false))
  }, [router])

  async function updateOutcome(status: string) {
    if (!lead) return
    setSavingStatus(status)
    setError(null)

    try {
      const response = await fetch(`/api/leads/${lead.id}/outcome`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update lead')
      }

      setLead((current) => (current ? { ...current, status } : current))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead')
    } finally {
      setSavingStatus(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading lead...</div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 max-w-md">
          <h1 className="text-xl font-bold text-white mb-4">Error</h1>
          <p className="text-slate-400 mb-6">{error || 'Lead not found'}</p>
          <button
            onClick={() => router.push('/leads')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Back to Leads
          </button>
        </div>
      </div>
    )
  }

  const meta = lead.meta || {}
  const qualityGate = meta.qualityGate || {}
  const discoveryGate = meta.discoveryGate || {}
  const outreach = meta.outreach || {}
  const proofPack = meta.proofPack || {}
  const evidence = Array.isArray(proofPack.evidence) ? proofPack.evidence : []
  const enrichmentMeta = lead.enrichmentMeta || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/leads')}
                className="p-2 text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Lead Proof Pack</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.open('/ecobe/handoffs', '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg text-cyan-400 transition"
              >
                <Activity className="w-4 h-4" />
                ECOBE Pipeline
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
              <div className="flex items-start justify-between gap-6 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {lead.title || 'Untitled Lead'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 text-sm rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                      {lead.status}
                    </span>
                    <span className="text-slate-400 text-sm">
                      Score: <span className="font-medium text-white">{lead.score}</span>
                    </span>
                    {qualityGate.tier && (
                      <span className="px-3 py-1 text-sm rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300">
                        {qualityGate.tier}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">Created</div>
                  <div className="text-white">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {meta.triggerEvent && (
                <div className="mb-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Trigger event</div>
                  <div className="text-white">{meta.triggerEvent}</div>
                </div>
              )}

              {meta.whyNow && (
                <div className="mb-6 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Why now</div>
                  <div className="text-slate-200">{meta.whyNow}</div>
                </div>
              )}

              {lead.snippet && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Source summary</h3>
                  <p className="text-slate-300 leading-relaxed">{lead.snippet}</p>
                </div>
              )}

              {lead.sourceUrl && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Source</h3>
                  <a
                    href={lead.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Source
                  </a>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Discovery Gate</h2>
                <div className="text-3xl font-bold text-white mb-2">
                  {discoveryGate.score ?? '—'}
                </div>
                <div className="text-slate-400 text-sm mb-3">
                  {discoveryGate.passed ? 'Passed' : 'Needs more proof'}
                </div>
                <div className="text-slate-300 text-sm">
                  {discoveryGate.reason || 'No discovery summary available.'}
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Quality Gate</h2>
                <div className="text-3xl font-bold text-white mb-2">
                  {qualityGate.score ?? '—'}
                </div>
                <div className="text-slate-400 text-sm mb-3">
                  {qualityGate.confidenceLabel || 'unknown'} confidence
                </div>
                <div className="text-slate-300 text-sm">
                  {qualityGate.reason || 'No quality summary available.'}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Validation Proof</h2>
              {evidence.length === 0 ? (
                <div className="text-slate-400">No evidence captured yet.</div>
              ) : (
                <div className="space-y-3">
                  {evidence.map((item: Record<string, any>, index: number) => (
                    <div
                      key={`${item.label || 'evidence'}-${index}`}
                      className="p-4 rounded-xl bg-slate-950/50 border border-slate-800"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-white font-medium">
                            {String(item.label || 'proof').replace(/-/g, ' ')}
                          </div>
                          <div className="text-slate-400 text-sm mt-1">{item.detail || '—'}</div>
                        </div>
                        <div className="text-cyan-300 text-sm">+{item.weight || 0}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Recommended Motion</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-slate-400 mb-2">Recommended action</div>
                  <div className="text-white">{outreach.recommendedAction || '—'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-2">Timing window</div>
                  <div className="text-white">{outreach.recommendedWindow || '—'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-2">Buyer persona</div>
                  <div className="text-white">{outreach.buyerPersona || '—'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-2">Outreach angle</div>
                  <div className="text-white">{outreach.angle || '—'}</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Update Outcome</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {OUTCOME_ACTIONS.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => updateOutcome(action.status)}
                    disabled={savingStatus !== null}
                    className="p-4 bg-slate-950/50 hover:bg-slate-900 border border-slate-800 rounded-lg text-left transition disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <action.icon className="w-5 h-5 text-cyan-300" />
                      <div>
                        <div className="font-semibold text-white">{action.label}</div>
                        <div className="text-sm text-slate-400">
                          {savingStatus === action.status ? 'Saving...' : 'Record a real pipeline outcome'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <LeadHandoffSection
              lead={lead}
              existingHandoff={handoff}
              onHandoffCreated={(newHandoff) => setHandoff(newHandoff)}
            />

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-400">Lead score</div>
                  <div className="text-2xl font-bold text-white">{lead.score}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Company size</div>
                  <div className="text-white">{enrichmentMeta.companySize || '—'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Funding stage</div>
                  <div className="text-white">{enrichmentMeta.funding || '—'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">LinkedIn</div>
                  <div className="text-white break-all">{enrichmentMeta.linkedin || '—'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Tech stack</div>
                  <div className="text-white">
                    {Array.isArray(enrichmentMeta.techStack) && enrichmentMeta.techStack.length > 0
                      ? enrichmentMeta.techStack.join(', ')
                      : '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
