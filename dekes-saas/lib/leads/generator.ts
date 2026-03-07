import { createHash } from 'crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { fetchSearchResults } from '@/lib/search/fallback'

export type LeadGenerationOptions = {
  query: string
  organizationId: string
  queryId: string
  runId: string
  regions: string[]
  selectedRegion?: string
  estimatedResults: number
}

export type LeadGenerationResult = {
  requested: number
  attempted: number
  inserted: number
  leads: Prisma.LeadUncheckedCreateInput[]
}

const SOURCE = 'SERPAPI_GOOGLE'
const MIN_SCORE = 45
const MAX_SCORE = 98

function normalizeGl(region?: string): string | undefined {
  if (!region) return undefined
  if (region.length === 2) return region.toLowerCase()
  const match = region.match(/^[A-Z]{2}/i)
  return match ? match[0].toLowerCase() : undefined
}

function hashCanonical(url: string, organizationId: string): string {
  return createHash('sha256').update(`${organizationId}::${url.toLowerCase()}`).digest('hex')
}

function scoreFromPosition(position: number): number {
  const score = MAX_SCORE - position * 4
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, score))
}

function secondaryScore(base: number, delta: number): number {
  return Math.max(30, Math.min(95, base + delta))
}

export async function generateLeadsFromSearch(
  options: LeadGenerationOptions
): Promise<LeadGenerationResult> {
  const gl = normalizeGl(options.selectedRegion || options.regions[0])
  const searchResults = await fetchSearchResults({
    query: options.query,
    gl,
    num: Math.min(options.estimatedResults, 100),
  })

  const leadsPayload: Prisma.LeadUncheckedCreateInput[] = []

  searchResults.forEach((result: any, idx: number) => {
    const link = result.link || result.displayed_link
    if (!link) return

    const canonicalUrl = link.trim()
    if (!canonicalUrl) return

    const canonicalHash = hashCanonical(canonicalUrl, options.organizationId)
    const baseScore = scoreFromPosition(idx)

    leadsPayload.push({
      organizationId: options.organizationId,
      queryId: options.queryId,
      runId: options.runId,
      source: result.provider === 'apify' ? 'APIFY_GOOGLE' : 'SERPAPI_GOOGLE',
      sourceUrl: canonicalUrl,
      canonicalUrl,
      canonicalHash,
      title: result.title?.trim() || null,
      snippet: result.snippet?.trim() || null,
      publishedAt: result.date ? new Date() : null,
      score: baseScore,
      intentDepth: secondaryScore(baseScore, 3),
      urgencyVelocity: secondaryScore(baseScore, -2),
      budgetSignals: secondaryScore(baseScore, -5),
      fitPrecision: secondaryScore(baseScore, 1),
      buyerType: 'B2B_SaaS',
      intentClass: baseScore > 70 ? 'HIGH_INTENT' : 'MEDIUM_INTENT',
      intentConfidence: Math.min(0.99, Math.max(0.4, baseScore / 100)),
      rush12HourEligible: baseScore > 80,
      painTags: [],
      serviceTags: [],
      meta: {
        serpPosition: result.position ?? idx + 1,
        serpSource: result.source ?? (result.provider === 'apify' ? 'apify_google' : 'google'),
        gl,
        provider: result.provider,
      } as Prisma.JsonObject,
    })
  })

  const created: Prisma.LeadUncheckedCreateInput[] = []

  for (const payload of leadsPayload) {
    try {
      await prisma.lead.upsert({
        where: {
          organizationId_canonicalHash: {
            organizationId: payload.organizationId,
            canonicalHash: payload.canonicalHash,
          },
        },
        update: {
          score: payload.score,
          intentDepth: payload.intentDepth,
          urgencyVelocity: payload.urgencyVelocity,
          budgetSignals: payload.budgetSignals,
          fitPrecision: payload.fitPrecision,
          snippet: payload.snippet,
          title: payload.title,
          runId: payload.runId,
          queryId: payload.queryId,
          meta: payload.meta,
        },
        create: payload,
      })
      created.push(payload)
    } catch (error) {
      console.error('Lead upsert failed', error)
    }
  }

  return {
    requested: searchResults.length,
    attempted: leadsPayload.length,
    inserted: created.length,
    leads: created,
  }
}
