import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth/jwt'
import { ecobeOptimizeQuery } from '@/lib/ecobe/client'
import { prisma } from '@/lib/db'

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

    const optimization = await ecobeOptimizeQuery({
      query: {
        id: ensuredQuery.id,
        query: data.query,
        estimatedResults: data.estimatedResults,
      },
      carbonBudget: data.carbonBudget,
      regions: data.regions,
    })

    const finishedRun = await prisma.run.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        status: 'FINISHED',
        resultCount: data.estimatedResults,
        leadCount: 0,
      },
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
      },
      optimization,
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Leads run error:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'Failed to run leads' }, { status: 500 })
  }
}
