import { prisma } from '@/lib/db'
import { recordMetric } from '@/lib/metrics/recorder'
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

  await Promise.all(
    leads.map((lead) =>
      prisma.lead.update({
        where: { id: lead.id },
        data: { enrichmentStatus: 'ENRICHING' },
      })
    )
  )

  await Promise.all(
    leads.map((lead) => {
      const companySize = scoreToCompanySize(lead.score)
      const funding = deriveFundingStage(lead.score)
      const techStack = detectTechStack(lead.snippet)
      const linkedin = deriveLinkedInHandle(lead.canonicalUrl)
      const updatedScore = Math.min(98, Math.round(lead.score + techStack.length * 2))

      return prisma.lead.update({
        where: { id: lead.id },
        data: {
          enrichmentStatus: 'ENRICHED',
          enrichedAt: new Date(),
          score: updatedScore,
          enrichmentMeta: {
            ...(lead.enrichmentMeta as Record<string, unknown>),
            companySize,
            funding,
            linkedin,
            techStack,
            enrichedBy: 'autonomous-worker',
          },
        },
      })
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
