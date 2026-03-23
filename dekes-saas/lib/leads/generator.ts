import { createHash } from 'crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { fetchSearchResults } from '@/lib/search/fallback'
import { classifyLeadIntent } from '@/lib/ai/groq'
import { getCalibratedWeights } from '@/lib/leads/feedback-loop'
import { assessLeadPipeline } from '@/lib/leads/intelligence'
import type { UTMData } from '@/lib/utm'

export type LeadGenerationOptions = {
  query: string
  organizationId: string
  queryId: string
  runId: string
  regions: string[]
  selectedRegion?: string
  estimatedResults: number
  utmData?: UTMData
}

export type LeadGenerationResult = {
  requested: number
  attempted: number
  inserted: number
  rejected: number
  leads: Prisma.LeadUncheckedCreateInput[]
}

const MIN_SCORE = 45
const MAX_SCORE = 98

const REJECTED_TITLE_PATTERNS =
  /\b(top\s+\d+|best\s+\d+|top\s+\w+\s+\d+|best\s+\w+\s+\d+|list\s+of|directory|companies\s+to|agencies\s+to|platforms\s+to|roundup|round-up|alternatives\s+to|vs\s+|versus|comparison|compared|review\s+of|reviews\s+of|\d+\s+best|\d+\s+top)\b/i

const REJECTED_DOMAINS = new Set([
  'youtube.com',
  'linkedin.com',
  'reddit.com',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'medium.com',
  'clutch.co',
  'g2.com',
  'capterra.com',
  'trustpilot.com',
  'yelp.com',
  'glassdoor.com',
  'crunchbase.com',
  'wikipedia.org',
  'pinterest.com',
  'tiktok.com',
  'quora.com',
  'indeed.com',
  'bbb.org',
  'forbes.com',
  'inc.com',
  'entrepreneur.com',
  'hubspot.com',
  'nerdwallet.com',
  'themanifest.com',
  'goodfirms.co',
  'designrush.com',
  'sortlist.com',
  'upcity.com',
  'expertise.com',
])

const REJECTED_PATH_PATTERNS =
  /\/(blog|news|article|press|wiki|category|tag|archive|search|forum|thread|discussion|listicle)\b/i

function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return null
  }
}

type RejectReason = 'title_pattern' | 'platform_domain' | 'aggregator_path' | null

function shouldRejectResult(title: string | null | undefined, url: string): RejectReason {
  if (title && REJECTED_TITLE_PATTERNS.test(title)) {
    return 'title_pattern'
  }

  const domain = extractDomain(url)
  if (domain) {
    for (const blocked of REJECTED_DOMAINS) {
      if (domain === blocked || domain.endsWith(`.${blocked}`)) {
        return 'platform_domain'
      }
    }
  }

  try {
    const path = new URL(url).pathname
    if (REJECTED_PATH_PATTERNS.test(path)) {
      return 'aggregator_path'
    }
  } catch {
    // Ignore invalid URL parsing here and let downstream logic handle it.
  }

  return null
}

function normalizeGl(region?: string): string | undefined {
  if (!region) return undefined
  if (region.length === 2) return region.toLowerCase()
  const match = region.match(/^[A-Z]{2}/i)
  return match ? match[0].toLowerCase() : undefined
}

function hashCanonical(url: string, organizationId: string): string {
  return createHash('sha256')
    .update(`${organizationId}::${url.toLowerCase()}`)
    .digest('hex')
}

function scoreFromPosition(position: number): number {
  const score = MAX_SCORE - position * 4
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, score))
}

export async function generateLeadsFromSearch(
  options: LeadGenerationOptions,
): Promise<LeadGenerationResult> {
  const gl = normalizeGl(options.selectedRegion || options.regions[0])
  const searchResults = await fetchSearchResults({
    query: options.query,
    gl,
    num: Math.min(options.estimatedResults, 100),
  })

  const created: Prisma.LeadUncheckedCreateInput[] = []
  const weights = await getCalibratedWeights()

  let rejectedCount = 0

  for (const [idx, result] of searchResults.entries()) {
    const link = result.link || result.displayed_link
    if (!link) continue

    const canonicalUrl = link.trim()
    if (!canonicalUrl) continue

    const rejectReason = shouldRejectResult(result.title, canonicalUrl)
    if (rejectReason) {
      rejectedCount++
      console.log(
        `[DEKES] Rejected result: ${rejectReason} | ${result.title?.substring(0, 60)} | ${extractDomain(canonicalUrl)}`,
      )
      continue
    }

    const canonicalHash = hashCanonical(canonicalUrl, options.organizationId)
    const baseScore = scoreFromPosition(idx)

    const intentClassification = await classifyLeadIntent(
      result.title || '',
      result.snippet || '',
      canonicalUrl,
    )

    const pipelineAssessment = assessLeadPipeline({
      query: options.query,
      result: {
        position: result.position ?? idx + 1,
        title: result.title,
        snippet: result.snippet,
        link: canonicalUrl,
        displayed_link: result.displayed_link,
        provider: result.provider,
        source: result.source,
      },
      intent: intentClassification,
      baseScore,
      weights,
    })

    if (pipelineAssessment.proofPack.recommendedStatus === 'REJECT') {
      rejectedCount++
      console.log(
        `[DEKES] Rejected by gate | ${pipelineAssessment.qualityGate.reason} | ${result.title?.substring(0, 60)}`,
      )
      continue
    }

    const finalScore = Math.max(
      MIN_SCORE,
      Math.min(MAX_SCORE, pipelineAssessment.scoring.finalScore),
    )

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
      score: finalScore,
      intentDepth: pipelineAssessment.scoring.breakdown.intentDepth,
      urgencyVelocity: pipelineAssessment.scoring.breakdown.urgencyVelocity,
      budgetSignals: pipelineAssessment.scoring.breakdown.budgetSignals,
      fitPrecision: pipelineAssessment.scoring.breakdown.fitPrecision,
      buyerType: intentClassification.buyerType,
      intentClass: intentClassification.intentClass,
      intentConfidence: intentClassification.confidence,
      rush12HourEligible: intentClassification.urgencySignals.immediate,
      painTags: intentClassification.painPoints,
      serviceTags: intentClassification.urgencySignals.budgetIndicators,
      status:
        pipelineAssessment.proofPack.recommendedStatus === 'OUTREACH_READY'
          ? 'OUTREACH_READY'
          : 'REVIEW',
      utmSource: options.utmData?.utm_source,
      utmMedium: options.utmData?.utm_medium,
      utmCampaign: options.utmData?.utm_campaign,
      utmTerm: options.utmData?.utm_term,
      utmContent: options.utmData?.utm_content,
      meta: {
        domain: pipelineAssessment.identity.domain,
        companyName: pipelineAssessment.identity.companyName,
        website: pipelineAssessment.identity.website,
        triggerEvent: pipelineAssessment.triggerEvent,
        whyNow: pipelineAssessment.whyNow,
        discoveryGate: pipelineAssessment.discoveryGate,
        qualityGate: pipelineAssessment.qualityGate,
        scoring: pipelineAssessment.scoring,
        outreach: pipelineAssessment.outreach,
        proofPack: pipelineAssessment.proofPack,
        serpPosition: result.position ?? idx + 1,
        serpSource: result.source ?? (result.provider === 'apify' ? 'apify_google' : 'google'),
        gl,
        provider: result.provider,
        aiClassification: intentClassification,
        urgencyTimeline: intentClassification.urgencySignals.timeline,
        serviceFit: intentClassification.serviceFit,
        utmCapturedAt: options.utmData?.captured_at,
      } as Prisma.JsonObject,
    }

    try {
      let isDuplicate = false
      let duplicateOfLeadId: string | undefined

      try {
        const domain = new URL(canonicalUrl).hostname.replace(/^www\./, '')
        const existingDomainLead = await prisma.lead.findFirst({
          where: {
            organizationId: options.organizationId,
            canonicalUrl: { contains: domain },
            canonicalHash: { not: leadPayload.canonicalHash },
          },
          select: { id: true },
          orderBy: { score: 'desc' },
        })

        if (existingDomainLead) {
          isDuplicate = true
          duplicateOfLeadId = existingDomainLead.id
        }
      } catch {
        // Ignore duplicate lookup URL parsing issues and continue.
      }

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
          status: leadPayload.status,
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
          isDuplicate,
          duplicateOfLeadId: duplicateOfLeadId ?? null,
        },
        create: {
          ...leadPayload,
          isDuplicate,
          duplicateOfLeadId: duplicateOfLeadId ?? null,
        },
      })

      created.push(leadPayload)
    } catch (error) {
      console.error('Lead upsert failed', error)
    }
  }

  console.log(
    `[DEKES] Lead generation complete: ${created.length} inserted, ${rejectedCount} rejected out of ${searchResults.length} results`,
  )

  return {
    requested: searchResults.length,
    attempted: searchResults.length - rejectedCount,
    inserted: created.length,
    rejected: rejectedCount,
    leads: created,
  }
}
