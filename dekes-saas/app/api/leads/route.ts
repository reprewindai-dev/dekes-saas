export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { validateSession } from '@/lib/auth/jwt'
import { getStoredUTMData } from '@/lib/utm'
import type { LeadListItem, ErrorResponse } from '@/types'

export async function GET(request: Request) {
  try {
    const token =
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      cookies().get('DEKES_SESSION')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await validateSession(token)
    const organizationId = session?.user.organizationId
    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawLeads = await prisma.lead.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        title: true,
        snippet: true,
        score: true,
        intentClass: true,
        status: true,
        source: true,
        sourceUrl: true,
        buyerType: true,
        createdAt: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        utmTerm: true,
        utmContent: true,
        meta: true,
        entity: {
          select: {
            displayName: true,
            primaryDomain: true,
            type: true,
          },
        },
      },
    })

    // Derive company and website from entity or URL domain
    const leads = rawLeads.map((lead) => {
      const meta = (lead.meta as Record<string, any>) || {}
      const discoveryGate = (meta.discoveryGate as Record<string, any>) || {}
      const qualityGate = (meta.qualityGate as Record<string, any>) || {}
      const outreach = (meta.outreach as Record<string, any>) || {}
      let company: string | null = lead.entity?.displayName ?? null
      let website: string | null = lead.entity?.primaryDomain ?? null
      if (!company && lead.sourceUrl) {
        try {
          const domain = new URL(lead.sourceUrl).hostname.replace(/^www\./, '')
          company = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
          website = domain
        } catch { /* invalid URL */ }
      }
      return {
        id: lead.id,
        title: lead.title,
        name: lead.title,
        company,
        website,
        entityType: lead.entity?.type ?? 'COMPANY',
        snippet: lead.snippet,
        score: lead.score,
        intentClass: lead.intentClass,
        status: lead.status,
        source: lead.source,
        sourceUrl: lead.sourceUrl,
        buyerType: lead.buyerType,
        createdAt: lead.createdAt,
        utmSource: lead.utmSource,
        utmMedium: lead.utmMedium,
        utmCampaign: lead.utmCampaign,
        utmTerm: lead.utmTerm,
        utmContent: lead.utmContent,
        triggerEvent: typeof meta.triggerEvent === 'string' ? meta.triggerEvent : null,
        whyNow: typeof meta.whyNow === 'string' ? meta.whyNow : null,
        qualityTier: typeof qualityGate.tier === 'string' ? qualityGate.tier : null,
        discoveryScore: typeof discoveryGate.score === 'number' ? discoveryGate.score : null,
        evidenceCount: typeof discoveryGate.evidenceCount === 'number' ? discoveryGate.evidenceCount : null,
        recommendedAction:
          typeof outreach.recommendedAction === 'string' ? outreach.recommendedAction : null,
        recommendedWindow:
          typeof outreach.recommendedWindow === 'string' ? outreach.recommendedWindow : null,
        confidenceLabel:
          typeof qualityGate.confidenceLabel === 'string' ? qualityGate.confidenceLabel : null,
      }
    })

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('List leads error:', error)
    return NextResponse.json({ error: 'Failed to list leads' }, { status: 500 })
  }
}
