import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateSession } from '@/lib/auth/jwt'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    const session = await validateSession(token || '')
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organizationId!

    const [
      totalHandoffs,
      sentHandoffs,
      acceptedHandoffs,
      convertedHandoffs,
      recentHandoffs,
      monthlyStats
    ] = await Promise.all([
      // Total handoffs created
      prisma.ecobeHandoff.count({
        where: { organizationId }
      }),
      
      // Handoffs sent to ECOBE
      prisma.ecobeHandoff.count({
        where: { 
          organizationId,
          status: 'SENT'
        }
      }),
      
      // Handoffs accepted by ECOBE
      prisma.ecobeHandoff.count({
        where: { 
          organizationId,
          status: 'ACCEPTED'
        }
      }),
      
      // Handoffs converted to deals
      prisma.ecobeHandoff.count({
        where: { 
          organizationId,
          status: 'CONVERTED'
        }
      }),
      
      // Recent handoffs with details
      prisma.ecobeHandoff.findMany({
        where: { organizationId },
        include: {
          lead: {
            select: {
              id: true,
              title: true,
              score: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Monthly stats for the last 6 months
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as handoffs,
          COUNT(CASE WHEN status = 'CONVERTED' THEN 1 END) as conversions
        FROM ecobe_handoffs 
        WHERE organization_id = ${organizationId}
          AND created_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `
    ]) as [
      number,
      number,
      number,
      number,
      any[],
      Array<{ month: Date; handoffs: bigint; conversions: bigint }>
    ]

    const conversionRate = sentHandoffs > 0 
      ? Math.round((convertedHandoffs / sentHandoffs) * 100) 
      : 0

    const acceptanceRate = sentHandoffs > 0
      ? Math.round(((acceptedHandoffs + convertedHandoffs) / sentHandoffs) * 100)
      : 0

    return NextResponse.json({
      stats: {
        totalHandoffs,
        sentHandoffs,
        acceptedHandoffs,
        convertedHandoffs,
        conversionRate,
        acceptanceRate
      },
      recentHandoffs: recentHandoffs.map((handoff: any) => ({
        id: handoff.id,
        status: handoff.status,
        qualificationScore: handoff.qualificationScore,
        createdAt: handoff.createdAt,
        lead: handoff.lead
      })),
      monthlyStats: monthlyStats.map((stat: any) => ({
        month: stat.month,
        handoffs: Number(stat.handoffs),
        conversions: Number(stat.conversions)
      }))
    })

  } catch (error) {
    console.error('ECOBE dashboard stats error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
