import { createHash } from 'crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { fetchSearchResults } from '@/lib/search/fallback'
import { classifyLeadIntent } from '@/lib/ai/groq'

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

  const created: Prisma.LeadUncheckedCreateInput[] = []

  // Process leads sequentially to handle async AI classification properly
  for (const [idx, result] of searchResults.entries()) {
    const link = result.link || result.displayed_link
    if (!link) continue

    const canonicalUrl = link.trim()
    if (!canonicalUrl) continue

    const canonicalHash = hashCanonical(canonicalUrl, options.organizationId)
    const baseScore = scoreFromPosition(idx)

    // Get AI-powered intent classification
    let intentClassification
    try {
      intentClassification = await classifyLeadIntent(
        result.title || '',
        result.snippet || '',
        canonicalUrl
      )
    } catch (error) {
      console.warn('AI classification failed, using fallback:', error)
      intentClassification = {
        intentClass: baseScore > 70 ? 'HIGH_INTENT' : 'MEDIUM_INTENT',
        confidence: Math.min(0.99, Math.max(0.4, baseScore / 100)),
        buyerType: 'B2B_SaaS',
        urgencySignals: {
          immediate: baseScore > 80,
          timeline: 'unknown',
          budgetIndicators: [],
        },
        painPoints: [],
        serviceFit: baseScore / 100,
      }
    }

    const leadPayload: Prisma.LeadUncheckedCreateInput = {
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
      buyerType: intentClassification.buyerType,
      intentClass: intentClassification.intentClass,
      intentConfidence: intentClassification.confidence,
      rush12HourEligible: intentClassification.urgencySignals.immediate,
      painTags: intentClassification.painPoints,
      serviceTags: intentClassification.urgencySignals.budgetIndicators,
      meta: {
        serpPosition: result.position ?? idx + 1,
        serpSource: result.source ?? (result.provider === 'apify' ? 'apify_google' : 'google'),
        gl,
        provider: result.provider,
        aiClassification: intentClassification,
        urgencyTimeline: intentClassification.urgencySignals.timeline,
        serviceFit: intentClassification.serviceFit,
      } as Prisma.JsonObject,
    }

    try {
      await prisma.lead.upsert({
        where: {
          organizationId_canonicalHash: {
            organizationId: leadPayload.organizationId,
            canonicalHash: leadPayload.canonicalHash,
          },
        },
        update: {
          score: leadPayload.score,
          intentDepth: leadPayload.intentDepth,
          urgencyVelocity: leadPayload.urgencyVelocity,
          budgetSignals: leadPayload.budgetSignals,
          fitPrecision: leadPayload.fitPrecision,
          snippet: leadPayload.snippet,
          title: leadPayload.title,
          runId: leadPayload.runId,
          queryId: leadPayload.queryId,
          meta: leadPayload.meta,
          buyerType: leadPayload.buyerType,
          intentClass: leadPayload.intentClass,
          intentConfidence: leadPayload.intentConfidence,
          rush12HourEligible: leadPayload.rush12HourEligible,
          painTags: leadPayload.painTags,
          serviceTags: leadPayload.serviceTags,
        },
        create: leadPayload,
      })
      created.push(leadPayload)
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
