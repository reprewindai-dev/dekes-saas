/**
 * QStash-triggered handler for runs that ECOBE asked to delay.
 *
 * After the predicted clean window expires QStash POSTs here with the
 * original run context.  We execute the lead-generation workload,
 * update the Run record, and send post-run feedback back to ECOBE.
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { generateLeadsFromSearch } from '@/lib/leads/generator'
import { ecobeCompleteWorkload } from '@/lib/ecobe/router'

const payloadSchema = z.object({
  runId: z.string().min(1),
  queryId: z.string().min(1),
  query: z.string().min(1),
  estimatedResults: z.number().int().positive(),
  regions: z.array(z.string()).min(1),
  organizationId: z.string().min(1),
  decisionId: z.string().min(1),
  selectedRegion: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = payloadSchema.parse(body)

    // Guard: skip if the run was already executed or cancelled
    const existing = await prisma.run.findUnique({ where: { id: data.runId } })
    if (!existing || existing.status !== 'DELAYED') {
      return NextResponse.json({ skipped: true, reason: 'run not in DELAYED state' })
    }

    // Mark as running again
    await prisma.run.update({
      where: { id: data.runId },
      data: { status: 'STARTED', ecobeRegion: data.selectedRegion },
    })

    const runStart = Date.now()

    const leadGeneration = await generateLeadsFromSearch({
      query: data.query,
      organizationId: data.organizationId,
      queryId: data.queryId,
      runId: data.runId,
      regions: data.regions,
      selectedRegion: data.selectedRegion,
      estimatedResults: data.estimatedResults,
    })

    const durationMinutes = Math.ceil((Date.now() - runStart) / 60_000) || 1

    await prisma.run.update({
      where: { id: data.runId },
      data: {
        finishedAt: new Date(),
        status: 'FINISHED',
        resultCount: leadGeneration.requested,
        leadCount: leadGeneration.inserted,
      },
    })

    // Post-run feedback (best-effort)
    ecobeCompleteWorkload({
      decision_id: data.decisionId,
      executionRegion: data.selectedRegion,
      durationMinutes,
      status: 'success',
    }).catch((err) => console.error('ECOBE complete feedback failed for delayed run', err))

    return NextResponse.json({
      runId: data.runId,
      status: 'FINISHED',
      leadCount: leadGeneration.inserted,
      executionRegion: data.selectedRegion,
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    // Report failure to ECOBE if we have a decision ID
    try {
      const raw = await request.text().catch(() => '{}')
      const parsed = JSON.parse(raw)
      if (parsed?.decisionId && parsed?.selectedRegion) {
        await ecobeCompleteWorkload({
          decision_id: parsed.decisionId,
          executionRegion: parsed.selectedRegion,
          durationMinutes: 0,
          status: 'failed',
        })
      }
    } catch {
      // best-effort
    }

    console.error(
      'Delayed run job error:',
      error instanceof Error ? error.message : String(error),
    )
    return NextResponse.json({ error: 'Delayed run failed' }, { status: 500 })
  }
}
