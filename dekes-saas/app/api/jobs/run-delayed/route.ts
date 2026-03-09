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
  // Parse body once upfront — request body can only be consumed once
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = payloadSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const data = parsed.data

  try {
    // Guard: skip if the run was already executed or cancelled
    const existing = await prisma.run.findUnique({ where: { id: data.runId } })
    if (!existing) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 })
    }
    if (existing.status !== 'DELAYED') {
      return NextResponse.json(
        { skipped: true, reason: `run is ${existing.status}, not DELAYED` },
        { status: 409 },
      )
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

    // Post-run feedback (best-effort — never block the response)
    ecobeCompleteWorkload({
      decision_id: data.decisionId,
      executionRegion: data.selectedRegion,
      durationMinutes,
      status: 'success',
    }).catch((err) =>
      console.error('[run-delayed] ECOBE complete feedback failed', { runId: data.runId, err }),
    )

    return NextResponse.json({
      runId: data.runId,
      status: 'FINISHED',
      leadCount: leadGeneration.inserted,
      executionRegion: data.selectedRegion,
    })
  } catch (error: unknown) {
    // Best-effort: report failure back to ECOBE
    ecobeCompleteWorkload({
      decision_id: data.decisionId,
      executionRegion: data.selectedRegion,
      durationMinutes: 0,
      status: 'failed',
    }).catch(() => {})

    // Also mark the run as failed so it doesn't stay in STARTED
    prisma.run
      .update({
        where: { id: data.runId },
        data: { status: 'FAILED', error: error instanceof Error ? error.message : String(error) },
      })
      .catch(() => {})

    console.error('[run-delayed] job error', {
      runId: data.runId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: 'Delayed run failed' }, { status: 500 })
  }
}
