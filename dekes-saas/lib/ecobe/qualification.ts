import type { Lead, Organization, Query, Run } from '@prisma/client'

export interface QualificationContext {
  lead: Lead
  query: Query
  run: Run
  organization: Organization
}

export interface QualificationResult {
  isQualified: boolean
  reason: string
  score: number
  signals: string[]
}

type LeadMetaRecord = Record<string, unknown> & {
  domain?: string | null
  triggerEvent?: string | null
  whyNow?: string | null
  discoveryGate?: {
    passed?: boolean
    score?: number
    evidenceCount?: number
  }
  qualityGate?: {
    passed?: boolean
    score?: number
    tier?: string
  }
  outreach?: {
    recommendedAction?: string
    recommendedWindow?: string
    buyerPersona?: string
  }
  proofPack?: {
    evidence?: Array<{ label?: string }>
  }
}

type EnrichmentMetaRecord = Record<string, unknown> & {
  companySize?: string
  funding?: string
  linkedin?: string | null
  techStack?: string[]
  serviceFit?: number
}

export function qualifyLeadForEcobe(context: QualificationContext): QualificationResult {
  const { lead, query, organization } = context
  const meta = ((lead.meta || {}) as LeadMetaRecord) ?? {}
  const enrichment = ((lead.enrichmentMeta || {}) as EnrichmentMetaRecord) ?? {}

  const signals: string[] = []
  let score = 0

  const discoveryGate = meta.discoveryGate
  const qualityGate = meta.qualityGate
  const proofEvidence = meta.proofPack?.evidence ?? []
  const techStack = enrichment.techStack ?? []

  if (lead.status === 'OUTREACH_READY') {
    signals.push('outreach-ready-status')
    score += 18
  }

  if (lead.score >= 85) {
    signals.push('elite-lead-score')
    score += 18
  } else if (lead.score >= 72) {
    signals.push('strong-lead-score')
    score += 12
  }

  if (lead.intentClass === 'HIGH_INTENT') {
    signals.push('high-intent-class')
    score += 14
  } else if (lead.intentClass === 'MEDIUM_INTENT') {
    signals.push('medium-intent-class')
    score += 8
  }

  if ((lead.intentConfidence ?? 0) >= 0.75) {
    signals.push('high-intent-confidence')
    score += 12
  } else if ((lead.intentConfidence ?? 0) >= 0.6) {
    signals.push('medium-intent-confidence')
    score += 7
  }

  if (discoveryGate?.passed) {
    signals.push('discovery-gate-passed')
    score += 12
  }

  if ((discoveryGate?.evidenceCount ?? 0) >= 4) {
    signals.push('multi-signal-proof')
    score += 10
  }

  if (qualityGate?.passed) {
    signals.push('quality-gate-passed')
    score += 16
  }

  if (qualityGate?.tier === 'elite') {
    signals.push('elite-quality-tier')
    score += 10
  } else if (qualityGate?.tier === 'strong') {
    signals.push('strong-quality-tier')
    score += 6
  }

  if ((meta.triggerEvent || meta.whyNow) && proofEvidence.length > 0) {
    signals.push('proof-pack-present')
    score += 8
  }

  if (meta.outreach?.recommendedAction) {
    signals.push('actionable-outreach-brief')
    score += 5
  }

  if (enrichment.companySize || enrichment.funding) {
    signals.push('company-context-enriched')
    score += 6
  }

  if (techStack.length >= 2) {
    signals.push('tech-context-enriched')
    score += 4
  }

  if (organization.plan !== 'FREE') {
    signals.push('paid-plan')
    score += 4
  }

  const isQualified = score >= 55

  const reason = isQualified
    ? [
        meta.triggerEvent || 'Validated buying motion',
        meta.whyNow || 'Timing window is actionable',
        meta.outreach?.recommendedWindow || 'Ready for downstream handoff',
      ]
        .filter(Boolean)
        .join(' | ')
    : 'Lead does not yet meet the proof and timing threshold for ECOBE handoff'

  return {
    isQualified,
    reason,
    score,
    signals,
  }
}
