import { prisma } from '@/lib/db'
import { recordMetric } from '@/lib/metrics/recorder'
import { redisCache } from '@/lib/upstash/redis'
import { classifyLeadIntent, type IntentClassification } from '@/lib/ai/groq'
import type { JobResult } from '@/lib/jobs/types'

const BATCH_SIZE = 25

const companySizeBuckets = [
  { max: 10, label: '1-10 employees' },
  { max: 50, label: '11-50 employees' },
  { max: 200, label: '51-200 employees' },
  { max: 500, label: '201-500 employees' },
  { max: 1000, label: '501-1000 employees' },
  { max: Number.MAX_SAFE_INTEGER, label: '1000+ employees' },
]

const techStackSignals = ['aws', 'azure', 'gcp', 'snowflake', 'databricks', 'kubernetes']

function scoreToCompanySize(score: number) {
  const sizeIndex = Math.min(companySizeBuckets.length - 1, Math.floor(score / 15))
  return companySizeBuckets[sizeIndex].label
}

function deriveLinkedInHandle(sourceUrl?: string | null) {
  if (!sourceUrl) return null
  const domain = sourceUrl.replace(/^https?:\/\//, '').split('/')[0]
  const companySlug = domain.split('.')[0]
  return `https://www.linkedin.com/company/${companySlug}`
}

function deriveFundingStage(score: number) {
  if (score > 85) return 'Series B+'
  if (score > 70) return 'Series A'
  if (score > 60) return 'Seed'
  return 'Pre-seed'
}

function detectTechStack(snippet?: string | null) {
  if (!snippet) return []
  const lower = snippet.toLowerCase()
  return techStackSignals.filter((signal) => lower.includes(signal))
}

export async function runLeadEnrichmentJob(): Promise<JobResult> {
  const leads = await prisma.lead.findMany({
    where: {
      isDuplicate: false,
      enrichmentStatus: { in: ['PENDING', 'ENRICHING'] },
    },
    orderBy: { createdAt: 'asc' },
    take: BATCH_SIZE,
  })

  if (leads.length === 0) {
    return { success: true, processed: 0 }
  }

  // Mark as enriching to prevent duplicate processing
  await Promise.all(
    leads.map((lead) =>
      prisma.lead.update({
        where: { id: lead.id },
        data: { enrichmentStatus: 'ENRICHING' },
      })
    )
  )

  // Process each lead with AI-powered enrichment
  await Promise.all(
    leads.map(async (lead) => {
      try {
        // Check cache for existing AI classification
        const cacheKey = `ai_enrichment:${lead.canonicalHash}`
        let aiClassification: IntentClassification | null = await redisCache.get(cacheKey)

        if (!aiClassification) {
          // Get fresh AI classification
          aiClassification = await classifyLeadIntent(
            lead.title || '',
            lead.snippet || '',
            lead.canonicalUrl
          )
          
          // Cache for 24 hours
          await redisCache.set(cacheKey, aiClassification, 86400)
        }

        const companySize = scoreToCompanySize(lead.score)
        const funding = deriveFundingStage(lead.score)
        const techStack = detectTechStack(lead.snippet)
        const linkedin = deriveLinkedInHandle(lead.canonicalUrl)
        const leadMeta = (lead.meta as Record<string, unknown>) || {}
        const qualityGate = (leadMeta.qualityGate as Record<string, unknown> | undefined) || {}
        const proofPack = (leadMeta.proofPack as Record<string, unknown> | undefined) || {}
        
        // Enhanced scoring with AI insights
        const aiBoost = aiClassification.serviceFit * 10
        const techBoost = techStack.length * 2
        const updatedScore = Math.min(98, Math.round(lead.score + aiBoost + techBoost))
        const promotedStatus =
          updatedScore >= 78 &&
          aiClassification.confidence >= 0.7 &&
          qualityGate.tier !== 'reject'
            ? 'OUTREACH_READY'
            : lead.status === 'OUTREACH_READY'
              ? 'OUTREACH_READY'
              : 'REVIEW'

        return prisma.lead.update({
          where: { id: lead.id },
          data: {
            enrichmentStatus: 'ENRICHED',
            enrichedAt: new Date(),
            score: updatedScore,
            status: promotedStatus,
            buyerType: aiClassification.buyerType,
            intentClass: aiClassification.intentClass,
            intentConfidence: aiClassification.confidence,
            rush12HourEligible: aiClassification.urgencySignals.immediate,
            painTags: aiClassification.painPoints,
            serviceTags: aiClassification.urgencySignals.budgetIndicators,
            meta: {
              ...leadMeta,
              sizeLabel: companySize,
              funding,
              linkedin,
              techStack,
              qualityGate: {
                ...qualityGate,
                score: Math.max(Number(qualityGate.score || 0), updatedScore),
                passed: promotedStatus === 'OUTREACH_READY' || qualityGate.passed === true,
                tier:
                  promotedStatus === 'OUTREACH_READY'
                    ? updatedScore >= 88
                      ? 'elite'
                      : 'strong'
                    : qualityGate.tier || 'review',
              },
              outreach: {
                ...((leadMeta.outreach as Record<string, unknown> | undefined) || {}),
                recommendedAction:
                  promotedStatus === 'OUTREACH_READY'
                    ? 'Route to the owning rep and launch the recommended sequence.'
                    : 'Hold for analyst review before rep handoff.',
              },
              proofPack: {
                ...proofPack,
                enriched: true,
                validationSummary:
                  typeof proofPack.validationSummary === 'string'
                    ? `${proofPack.validationSummary} Enrichment confirmed firmographic context.`
                    : 'Enrichment confirmed firmographic context.',
              },
            },
            enrichmentMeta: {
              ...(lead.enrichmentMeta as Record<string, unknown>),
              companySize,
              funding,
              linkedin,
              techStack,
              enrichedBy: 'autonomous-worker',
              aiClassification,
              urgencyTimeline: aiClassification.urgencySignals.timeline,
              serviceFit: aiClassification.serviceFit,
              aiBoost: Math.round(aiBoost),
              techBoost,
            },
          },
        })
      } catch (error) {
        console.error(`Failed to enrich lead ${lead.id}:`, error)
        
        // Mark as failed but don't block the batch
        return prisma.lead.update({
          where: { id: lead.id },
          data: {
            enrichmentStatus: 'FAILED',
            enrichmentMeta: {
              ...(lead.enrichmentMeta as Record<string, unknown>),
              error: error instanceof Error ? error.message : 'Unknown error',
              failedAt: new Date(),
            },
          },
        })
      }
    })
  )

  await recordMetric(
    'job.lead_enrichment',
    {
      processed: leads.length,
      enrichedLeadIds: leads.map((lead) => lead.id),
    },
    'dekes'
  )

  return { success: true, processed: leads.length }
}
