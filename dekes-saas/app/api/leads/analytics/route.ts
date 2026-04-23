export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'
import { getConversionAnalytics, getCalibratedWeights } from '@/lib/leads/feedback-loop'

export async function GET(request: Request) {
  try {
    const token =
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      cookies().get('DEKES_SESSION')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await validateSession(token)
    if (!session?.user.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organizationId
    const [analytics, calibratedWeights, leadStatusCounts, recentLeadMeta] = await Promise.all([
      getConversionAnalytics(organizationId),
      getCalibratedWeights(),
      prisma.lead.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: { status: true },
      }),
      prisma.lead.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          meta: true,
          score: true,
        },
      }),
    ])

    const funnel = leadStatusCounts.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = row._count.status
      return acc
    }, {})

    const qualityRollup = recentLeadMeta.reduce(
      (acc, lead) => {
        const meta = (lead.meta as Record<string, any>) || {}
        const discoveryGate = (meta.discoveryGate as Record<string, any>) || {}
        const qualityGate = (meta.qualityGate as Record<string, any>) || {}

        if (typeof discoveryGate.score === 'number') {
          acc.discoveryTotal += discoveryGate.score
          acc.discoveryCount += 1
        }
        if (typeof qualityGate.score === 'number') {
          acc.qualityTotal += qualityGate.score
          acc.qualityCount += 1
        }
        if (qualityGate.tier === 'elite' || qualityGate.tier === 'strong') {
          acc.mustHaveLeads += 1
        }
        if (lead.score >= 80) {
          acc.highScoreLeads += 1
        }
        return acc
      },
      {
        discoveryTotal: 0,
        discoveryCount: 0,
        qualityTotal: 0,
        qualityCount: 0,
        mustHaveLeads: 0,
        highScoreLeads: 0,
      },
    )

    return NextResponse.json({
      ...analytics,
      calibratedWeights,
      funnel,
      quality: {
        avgDiscoveryScore:
          qualityRollup.discoveryCount > 0
            ? Math.round(qualityRollup.discoveryTotal / qualityRollup.discoveryCount)
            : 0,
        avgQualityScore:
          qualityRollup.qualityCount > 0
            ? Math.round(qualityRollup.qualityTotal / qualityRollup.qualityCount)
            : 0,
        mustHaveLeads: qualityRollup.mustHaveLeads,
        highScoreLeads: qualityRollup.highScoreLeads,
      },
    })
  } catch (error) {
    console.error('[leads/analytics] Error:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
