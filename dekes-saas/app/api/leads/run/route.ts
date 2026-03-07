import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth/jwt'
import { ecobeOptimizeQuery, ecobeReportCarbonUsage } from '@/lib/ecobe/client'
import { prisma } from '@/lib/db'
import { generateLeadsFromSearch } from '@/lib/leads/generator'

const runSchema = z.object({
  queryId: z.string().min(1).optional(),
  query: z.string().min(1),
  estimatedResults: z.number().int().positive().default(100),
  carbonBudget: z.number().positive().default(10000),
  regions: z.array(z.string()).min(1).default(['US-CAL-CISO', 'FR', 'DE']),
})

export async function POST(request: Request) {
  try {
    const token =
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      cookies().get('DEKES_SESSION')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await validateSession(token)
    if (!session || !session.user.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = runSchema.parse(body)

    const organizationId = session.user.organizationId

    const query = data.queryId
      ? await prisma.query.findFirst({
          where: { id: data.queryId, organizationId },
        })
      : null

    const ensuredQuery = query
      ? await prisma.query.update({
          where: { id: query.id },
          data: { query: data.query, enabled: true },
        })
      : await prisma.query.create({
          data: {
            organizationId,
            name: data.query,
            query: data.query,
            enabled: true,
          },
        })

    const run = await prisma.run.create({
      data: {
        organizationId,
        queryId: ensuredQuery.id,
        status: 'STARTED',
      },
    })

    const optimizationErrorContext: Record<string, unknown> = {}
    const optimizationResult = await ecobeOptimizeQuery({
      query: {
        id: ensuredQuery.id,
        query: data.query,
        estimatedResults: data.estimatedResults,
      },
      carbonBudget: data.carbonBudget,
      regions: data.regions,
    }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error)
      optimizationErrorContext.error = message
      console.warn('ECOBE optimize unavailable, falling back to default region', message)
      return null
    })

    const optimization =
      optimizationResult ?? ({
        selectedRegion: data.regions[0],
        fallback: true,
        error: optimizationErrorContext.error,
      } as Awaited<ReturnType<typeof ecobeOptimizeQuery>>)

    const leadGeneration = await generateLeadsFromSearch({
      query: data.query,
      organizationId,
      queryId: ensuredQuery.id,
      runId: run.id,
      regions: data.regions,
      selectedRegion: typeof optimization.selectedRegion === 'string' ? optimization.selectedRegion : undefined,
      estimatedResults: data.estimatedResults,
    })

    const finishedRun = await prisma.run.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        status: 'FINISHED',
        resultCount: leadGeneration.requested,
        leadCount: leadGeneration.inserted,
      },
    })

    const estimatedEnergyKwh = (data.estimatedResults / 1000) * 0.05
    const estimatedCO2 =
      typeof optimization.estimatedCO2 === 'number' ? optimization.estimatedCO2 : null
    const carbonIntensity =
      estimatedEnergyKwh > 0 && estimatedCO2 !== null
        ? estimatedCO2 / estimatedEnergyKwh
        : null
    const actualEnergyKwh = (leadGeneration.requested / 1000) * 0.05
    const fallbackCarbonIntensity = 500 // gCO2/kWh baseline
    const actualCO2 =
      actualEnergyKwh * (carbonIntensity ?? fallbackCarbonIntensity)

    // Report actual CO2 usage back to ECOBE (best-effort)
    ecobeReportCarbonUsage({
      queryId: ensuredQuery.id,
      actualCO2,
    }).catch((error) => {
      console.error('Failed to report ECOBE carbon usage', error)
    })

    return NextResponse.json({
      organizationId,
      query: {
        id: ensuredQuery.id,
        query: ensuredQuery.query,
      },
      run: {
        id: finishedRun.id,
        status: finishedRun.status,
        startedAt: finishedRun.startedAt,
        finishedAt: finishedRun.finishedAt,
        resultCount: finishedRun.resultCount,
        leadCount: finishedRun.leadCount,
      },
      optimization,
      leadGeneration,
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Leads run error:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'Failed to run leads' }, { status: 500 })
  }
}
