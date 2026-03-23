type IntentClass = 'HIGH_INTENT' | 'MEDIUM_INTENT' | 'LOW_INTENT'

type IntentClassification = {
  intentClass: IntentClass
  confidence: number
  buyerType: 'B2B_SaaS' | 'B2B_ECOMMERCE' | 'B2B_ENTERPRISE' | 'UNKNOWN'
  urgencySignals: {
    immediate: boolean
    timeline: string
    budgetIndicators: string[]
  }
  painPoints: string[]
  serviceFit: number
}

type SearchResultLike = {
  position?: number
  title?: string
  snippet?: string
  link?: string
  displayed_link?: string
  provider?: string
  source?: string
}

export type LeadEvidenceCategory = 'intent' | 'timing' | 'budget' | 'fit' | 'validation'

export type LeadEvidenceItem = {
  category: LeadEvidenceCategory
  label: string
  detail: string
  weight: number
}

export type LeadReadiness = 'OUTREACH_READY' | 'REVIEW' | 'REJECT'

export type LeadPipelineAssessment = {
  identity: {
    domain: string | null
    companyName: string | null
    website: string | null
  }
  triggerEvent: string
  whyNow: string
  discoveryGate: {
    passed: boolean
    score: number
    evidenceCount: number
    matchedSignals: string[]
    reason: string
  }
  qualityGate: {
    passed: boolean
    score: number
    tier: 'elite' | 'strong' | 'review' | 'reject'
    confidenceLabel: 'high' | 'medium' | 'low'
    reason: string
  }
  scoring: {
    baseScore: number
    finalScore: number
    breakdown: {
      intentDepth: number
      urgencyVelocity: number
      budgetSignals: number
      fitPrecision: number
      engagementDepth: number
      discoveryStrength: number
    }
    weightsApplied: {
      intentWeight: number
      urgencyWeight: number
      budgetWeight: number
      fitWeight: number
      engagementWeight: number
    }
  }
  outreach: {
    recommendedAction: string
    recommendedWindow: string
    angle: string
    buyerPersona: string
  }
  proofPack: {
    evidence: LeadEvidenceItem[]
    validationSummary: string
    sourceSummary: string
    recommendedStatus: LeadReadiness
  }
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'for',
  'from',
  'how',
  'in',
  'into',
  'is',
  'it',
  'of',
  'on',
  'or',
  'recently',
  'that',
  'the',
  'their',
  'to',
  'who',
  'with',
])

const INTENT_PATTERNS: Array<{ regex: RegExp; label: string; detail: string; weight: number }> = [
  { regex: /\b(demo|book a demo|request demo|trial|free trial)\b/i, label: 'active-evaluation', detail: 'Hands-on evaluation language detected.', weight: 14 },
  { regex: /\b(pricing|quote|proposal|budget|cost|rfp|rfi|procurement)\b/i, label: 'commercial-intent', detail: 'Commercial buying language present.', weight: 15 },
  { regex: /\b(compare|comparison|alternatives?|versus|replacement|switch)\b/i, label: 'vendor-comparison', detail: 'Vendor comparison behavior detected.', weight: 14 },
  { regex: /\b(migration|implementation|integration|deployment|rollout|replatform)\b/i, label: 'implementation-motion', detail: 'Implementation planning signal present.', weight: 13 },
  { regex: /\b(security|compliance|zero trust|soc ?2|audit|governance)\b/i, label: 'security-governance-need', detail: 'Governance or security trigger identified.', weight: 12 },
]

const TIMING_PATTERNS: Array<{ regex: RegExp; label: string; detail: string; weight: number }> = [
  { regex: /\b(now|urgent|immediately|asap|this week|this month|this quarter)\b/i, label: 'urgent-window', detail: 'Short buying window language detected.', weight: 12 },
  { regex: /\b(hiring|job opening|head of|vp|director)\b/i, label: 'team-buildout', detail: 'Hiring or leadership expansion signal detected.', weight: 10 },
  { regex: /\b(raised|funding|series [abc]|seed|investment)\b/i, label: 'fresh-capital', detail: 'Funding or capital event detected.', weight: 9 },
  { regex: /\b(expanding|launching|rollout|new market|global)\b/i, label: 'expansion-motion', detail: 'Expansion or transformation motion detected.', weight: 8 },
]

const FIT_PATTERNS: Array<{ regex: RegExp; label: string; detail: string; weight: number }> = [
  { regex: /\b(b2b|enterprise|mid-market|saas|platform|revenue ops|sales ops)\b/i, label: 'target-market-fit', detail: 'ICP-aligned market segment present.', weight: 10 },
  { regex: /\b(cloud|aws|azure|gcp|kubernetes|snowflake|databricks)\b/i, label: 'modern-stack-fit', detail: 'Modern stack or cloud environment detected.', weight: 8 },
]

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function scoreToLabel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 78) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

function normalizeWords(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word))
}

function titleCaseCompany(slug: string): string {
  return slug
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function deriveIdentity(url: string, displayedLink?: string) {
  try {
    const parsed = new URL(url)
    const domain = parsed.hostname.replace(/^www\./, '').toLowerCase()
    const companySlug = domain.split('.')[0] || displayedLink?.split('.')[0] || 'Company'

    return {
      domain,
      companyName: titleCaseCompany(companySlug),
      website: `https://${domain}`,
    }
  } catch {
    return {
      domain: null,
      companyName: displayedLink ? titleCaseCompany(displayedLink.split('.')[0]) : null,
      website: null,
    }
  }
}

function collectPatternEvidence(
  text: string,
  patterns: Array<{ regex: RegExp; label: string; detail: string; weight: number }>,
  category: LeadEvidenceCategory,
): LeadEvidenceItem[] {
  const evidence: LeadEvidenceItem[] = []

  for (const pattern of patterns) {
    if (pattern.regex.test(text)) {
      evidence.push({
        category,
        label: pattern.label,
        detail: pattern.detail,
        weight: pattern.weight,
      })
    }
  }

  return evidence
}

function collectQueryOverlapEvidence(query: string, text: string): LeadEvidenceItem[] {
  const keywords = normalizeWords(query)
  const matches = keywords.filter((keyword) => text.includes(keyword)).slice(0, 4)

  if (matches.length === 0) {
    return []
  }

  return [
    {
      category: 'validation',
      label: 'query-alignment',
      detail: `Matches core ICP/query terms: ${matches.join(', ')}`,
      weight: clamp(matches.length * 3, 4, 12),
    },
  ]
}

function getPersona(intent: IntentClassification, text: string): string {
  if (/\bsecurity|compliance|risk|zero trust|soc ?2\b/i.test(text)) return 'Security leadership'
  if (/\brevenue|sales|pipeline|outbound|abm\b/i.test(text)) return 'Revenue leadership'
  if (/\bdata|platform|engineering|devops|cloud\b/i.test(text)) return 'Platform leadership'
  if (intent.buyerType === 'B2B_ENTERPRISE') return 'Enterprise buying team'
  return 'Commercial decision-maker'
}

function getTriggerEvent(evidence: LeadEvidenceItem[]): string {
  const top = [...evidence].sort((a, b) => b.weight - a.weight)[0]
  return top ? `${top.label.replace(/-/g, ' ')} detected` : 'Active buying behavior detected'
}

function getWhyNow(intent: IntentClassification, evidence: LeadEvidenceItem[]): string {
  if (intent.urgencySignals.immediate) {
    return 'Urgency signals indicate the buying window is already open.'
  }

  const timingEvidence = evidence.find((item) => item.category === 'timing')
  if (timingEvidence) {
    return timingEvidence.detail
  }

  return 'The account is showing active evaluation behavior, not passive browsing.'
}

function getRecommendedWindow(intent: IntentClassification, qualityScore: number): string {
  if (intent.urgencySignals.immediate && qualityScore >= 78) return 'Reach out inside 12 hours'
  if (qualityScore >= 70) return 'Reach out inside 48 hours'
  return 'Review and sequence inside 7 days'
}

function getRecommendedAction(intent: IntentClassification, qualityScore: number): string {
  if (intent.urgencySignals.immediate && qualityScore >= 78) {
    return 'Route directly to an owning rep with a high-priority outbound sequence.'
  }

  if (qualityScore >= 70) {
    return 'Send to outbound with a tailored message and same-week follow-up.'
  }

  return 'Hold for analyst review before rep handoff.'
}

function getOutreachAngle(intent: IntentClassification, query: string, evidence: LeadEvidenceItem[]): string {
  const painPoint = intent.painPoints?.[0]
  if (painPoint) {
    return `Lead with ${painPoint} and show how your offer reduces buying friction quickly.`
  }

  const budgetSignal = intent.urgencySignals.budgetIndicators?.[0]
  if (budgetSignal) {
    return `Anchor outreach on ${budgetSignal} and tie it to speed-to-value.`
  }

  const topEvidence = evidence.find((item) => item.category === 'intent')?.label
  if (topEvidence) {
    return `Open around ${topEvidence.replace(/-/g, ' ')} and connect it to the ICP in "${query}".`
  }

  return 'Lead with the detected buying motion and a concrete next step.'
}

export function assessLeadPipeline(args: {
  query: string
  result: SearchResultLike
  intent: IntentClassification
  baseScore: number
  weights: {
    intentWeight: number
    urgencyWeight: number
    budgetWeight: number
    fitWeight: number
    engagementWeight: number
  }
}): LeadPipelineAssessment {
  const canonicalUrl = args.result.link || args.result.displayed_link || ''
  const identity = deriveIdentity(canonicalUrl, args.result.displayed_link)
  const combinedText = `${args.query} ${args.result.title || ''} ${args.result.snippet || ''} ${canonicalUrl}`.toLowerCase()

  const intentEvidence = collectPatternEvidence(combinedText, INTENT_PATTERNS, 'intent')
  const timingEvidence = collectPatternEvidence(combinedText, TIMING_PATTERNS, 'timing')
  const fitEvidence = collectPatternEvidence(combinedText, FIT_PATTERNS, 'fit')
  const validationEvidence: LeadEvidenceItem[] = [
    ...(identity.domain
      ? [
          {
            category: 'validation' as const,
            label: 'company-domain-verified',
            detail: `Commercial domain verified: ${identity.domain}`,
            weight: 8,
          },
        ]
      : []),
    ...collectQueryOverlapEvidence(args.query, combinedText),
    ...(args.intent.confidence >= 0.7
      ? [
          {
            category: 'validation' as const,
            label: 'model-confidence',
            detail: `AI classification confidence at ${Math.round(args.intent.confidence * 100)}%.`,
            weight: 8,
          },
        ]
      : []),
  ]

  const budgetEvidence: LeadEvidenceItem[] = [
    ...args.intent.urgencySignals.budgetIndicators.slice(0, 3).map((indicator) => ({
      category: 'budget' as const,
      label: 'budget-indicator',
      detail: indicator,
      weight: 6,
    })),
    ...(args.intent.serviceFit >= 0.72
      ? [
          {
            category: 'fit' as const,
            label: 'service-fit',
            detail: `Service fit scored at ${Math.round(args.intent.serviceFit * 100)}%.`,
            weight: 8,
          },
        ]
      : []),
  ]

  const evidence = [
    ...intentEvidence,
    ...timingEvidence,
    ...budgetEvidence,
    ...fitEvidence,
    ...validationEvidence,
  ]

  const evidenceCount = evidence.length
  const matchedSignals = evidence.map((item) => item.label)
  const discoveryStrength = clamp(
    35 +
      evidence.filter((item) => item.category === 'intent').reduce((sum, item) => sum + item.weight, 0) +
      evidence.filter((item) => item.category === 'validation').reduce((sum, item) => sum + item.weight, 0) +
      (identity.domain ? 10 : 0),
    0,
    100,
  )

  const intentWeight = args.intent.intentClass === 'HIGH_INTENT' ? 18 : args.intent.intentClass === 'MEDIUM_INTENT' ? 8 : -4
  const intentDepth = clamp(
    Math.round(args.baseScore + intentWeight + args.intent.confidence * 14 + intentEvidence.length * 4),
    25,
    98,
  )

  const urgencyTimelineWeight =
    args.intent.urgencySignals.timeline === 'immediate'
      ? 14
      : args.intent.urgencySignals.timeline === 'weeks'
        ? 8
        : args.intent.urgencySignals.timeline === 'months'
          ? 2
          : 0
  const urgencyVelocity = clamp(
    Math.round(
      args.baseScore +
        (args.intent.urgencySignals.immediate ? 12 : 0) +
        urgencyTimelineWeight +
        timingEvidence.length * 3 -
        4,
    ),
    20,
    96,
  )

  const budgetSignals = clamp(
    Math.round(args.baseScore + args.intent.urgencySignals.budgetIndicators.length * 5 + budgetEvidence.length * 3 - 6),
    18,
    94,
  )

  const fitPrecision = clamp(
    Math.round(args.baseScore + (args.intent.serviceFit - 0.5) * 30 + fitEvidence.length * 4),
    22,
    96,
  )

  const engagementDepth = clamp(
    Math.round(args.baseScore + (args.intent.painPoints.length * 4) + (args.result.position && args.result.position <= 5 ? 8 : 0) - 3),
    20,
    95,
  )

  const rawComposite =
    intentDepth * 0.28 * args.weights.intentWeight +
    urgencyVelocity * 0.2 * args.weights.urgencyWeight +
    budgetSignals * 0.16 * args.weights.budgetWeight +
    fitPrecision * 0.2 * args.weights.fitWeight +
    engagementDepth * 0.16 * args.weights.engagementWeight +
    discoveryStrength * 0.12

  const weightSum =
    0.28 * args.weights.intentWeight +
    0.2 * args.weights.urgencyWeight +
    0.16 * args.weights.budgetWeight +
    0.2 * args.weights.fitWeight +
    0.16 * args.weights.engagementWeight +
    0.12

  const finalScore = clamp(Math.round(rawComposite / weightSum), 32, 98)

  const discoveryPassed = discoveryStrength >= 58 && evidenceCount >= 3
  const qualityScore = clamp(
    Math.round(
      finalScore * 0.45 +
        discoveryStrength * 0.25 +
        args.intent.confidence * 100 * 0.2 +
        Math.min(evidenceCount, 6) * 2,
    ),
    0,
    100,
  )
  const qualityPassed = discoveryPassed && qualityScore >= 64

  const qualityTier =
    qualityScore >= 82 && args.intent.confidence >= 0.75
      ? 'elite'
      : qualityScore >= 70
        ? 'strong'
        : qualityScore >= 56
          ? 'review'
          : 'reject'

  const recommendedStatus: LeadReadiness =
    qualityTier === 'elite' || qualityTier === 'strong'
      ? 'OUTREACH_READY'
      : qualityTier === 'review'
        ? 'REVIEW'
        : 'REJECT'

  const confidenceLabel = scoreToLabel(Math.round((qualityScore + args.intent.confidence * 100) / 2))
  const triggerEvent = getTriggerEvent(evidence)
  const whyNow = getWhyNow(args.intent, evidence)
  const recommendedWindow = getRecommendedWindow(args.intent, qualityScore)
  const recommendedAction = getRecommendedAction(args.intent, qualityScore)
  const buyerPersona = getPersona(args.intent, combinedText)
  const angle = getOutreachAngle(args.intent, args.query, evidence)

  return {
    identity,
    triggerEvent,
    whyNow,
    discoveryGate: {
      passed: discoveryPassed,
      score: discoveryStrength,
      evidenceCount,
      matchedSignals,
      reason: discoveryPassed
        ? 'Multiple buyer and validation signals corroborate the account.'
        : 'Insufficient multi-signal proof for automatic rep handoff.',
    },
    qualityGate: {
      passed: qualityPassed,
      score: qualityScore,
      tier: qualityTier,
      confidenceLabel,
      reason: qualityPassed
        ? 'Lead meets production handoff standards for timing, relevance, and signal proof.'
        : 'Lead needs review or more evidence before it should consume rep time.',
    },
    scoring: {
      baseScore: args.baseScore,
      finalScore,
      breakdown: {
        intentDepth,
        urgencyVelocity,
        budgetSignals,
        fitPrecision,
        engagementDepth,
        discoveryStrength,
      },
      weightsApplied: args.weights,
    },
    outreach: {
      recommendedAction,
      recommendedWindow,
      angle,
      buyerPersona,
    },
    proofPack: {
      evidence,
      validationSummary: `${validationEvidence.length} validation checks and ${intentEvidence.length + timingEvidence.length + budgetEvidence.length + fitEvidence.length} buying-context signals were captured.`,
      sourceSummary: `${args.result.provider || 'search'}:${args.result.source || 'organic'} position ${args.result.position || 'n/a'}`,
      recommendedStatus,
    },
  }
}
