import { assessLeadPipeline } from '../lib/leads/intelligence'

const baseWeights = {
  intentWeight: 1,
  urgencyWeight: 1,
  budgetWeight: 1,
  fitWeight: 1,
  engagementWeight: 1,
}

const strongLead = assessLeadPipeline({
  query: 'find security leaders evaluating zero trust vendors with active compliance projects',
  result: {
    position: 1,
    title: 'Zero trust migration RFP for enterprise security platform',
    snippet:
      'Security leadership is comparing vendors, requesting pricing, and planning implementation this quarter after new SOC 2 requirements.',
    link: 'https://acme-security.com/rfp/zero-trust-platform',
    displayed_link: 'acme-security.com',
    provider: 'serpapi',
    source: 'google',
  },
  intent: {
    intentClass: 'HIGH_INTENT',
    confidence: 0.9,
    buyerType: 'B2B_ENTERPRISE',
    urgencySignals: {
      immediate: true,
      timeline: 'immediate',
      budgetIndicators: ['pricing request', 'procurement review'],
    },
    painPoints: ['audit pressure', 'tool sprawl'],
    serviceFit: 0.91,
  },
  baseScore: 94,
  weights: baseWeights,
})

const weakLead = assessLeadPipeline({
  query: 'find security leaders evaluating zero trust vendors with active compliance projects',
  result: {
    position: 8,
    title: 'Top 10 security blogs to follow this year',
    snippet: 'A roundup of interesting security content and commentary.',
    link: 'https://example-media.com/blog/top-security-blogs',
    displayed_link: 'example-media.com',
    provider: 'serpapi',
    source: 'google',
  },
  intent: {
    intentClass: 'LOW_INTENT',
    confidence: 0.42,
    buyerType: 'UNKNOWN',
    urgencySignals: {
      immediate: false,
      timeline: 'unknown',
      budgetIndicators: [],
    },
    painPoints: [],
    serviceFit: 0.35,
  },
  baseScore: 62,
  weights: baseWeights,
})

const assertions = [
  {
    name: 'strong lead becomes outreach-ready',
    pass: strongLead.proofPack.recommendedStatus === 'OUTREACH_READY',
    detail: strongLead,
  },
  {
    name: 'strong lead scores as strong or elite quality',
    pass: ['strong', 'elite'].includes(strongLead.qualityGate.tier),
    detail: strongLead.qualityGate,
  },
  {
    name: 'weak lead does not become outreach-ready',
    pass: weakLead.proofPack.recommendedStatus !== 'OUTREACH_READY',
    detail: weakLead,
  },
]

const failures = assertions.filter((assertion) => !assertion.pass)

if (failures.length > 0) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        failures,
      },
      null,
      2,
    ),
  )
  process.exit(1)
}

console.log(
  JSON.stringify(
    {
      ok: true,
      strongLead: {
        finalScore: strongLead.scoring.finalScore,
        qualityTier: strongLead.qualityGate.tier,
        recommendedStatus: strongLead.proofPack.recommendedStatus,
      },
      weakLead: {
        finalScore: weakLead.scoring.finalScore,
        qualityTier: weakLead.qualityGate.tier,
        recommendedStatus: weakLead.proofPack.recommendedStatus,
      },
    },
    null,
    2,
  ),
)
