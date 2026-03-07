import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { validateSession } from '@/lib/auth/jwt'
import { qualifyLeadForEcobe } from '@/lib/ecobe/qualification'
import { createEcobeProspect, createEcobeTenant, triggerEcobeDemo } from '@/lib/ecobe/client'
import { publishEvent } from '@/lib/events/publisher'
import { recordMetric } from '@/lib/metrics/recorder'

const handoffSchema = z.object({
  leadId: z.string().cuid(),
})

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    const session = await validateSession(token || '')
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { leadId } = handoffSchema.parse(body)

    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        organizationId: session.user.organizationId!,
      },
      include: {
        query: true,
        run: true,
        organization: true,
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const qualification = qualifyLeadForEcobe({
      lead,
      query: lead.query!,
      run: lead.run!,
      organization: lead.organization!,
    })

    if (!qualification.isQualified) {
      return NextResponse.json({
        error: 'Lead not qualified for ECOBE handoff',
        reason: qualification.reason,
      }, { status: 400 })
    }

    const existingHandoff = await prisma.ecobeHandoff.findFirst({
      where: {
        leadId,
        status: { in: ['PENDING', 'SENT', 'ACCEPTED'] },
      },
    })

    if (existingHandoff) {
      return NextResponse.json({
        error: 'Handoff already exists',
        handoffId: existingHandoff.id,
        status: existingHandoff.status,
      }, { status: 409 })
    }

    const handoffPayload = {
      organization: {
        name: lead.organization!.name,
        domain: (lead.meta as any)?.domain || null,
        sizeLabel: (lead.meta as any)?.sizeLabel || null,
        region: (lead.meta as any)?.region || null,
      },
      intent: {
        score: qualification.score,
        reason: qualification.reason,
        keywords: qualification.signals,
      },
      contact: {
        name: (lead.meta as any)?.contactName || null,
        email: (lead.meta as any)?.contactEmail || null,
        linkedin: (lead.meta as any)?.linkedin || null,
      },
      source: {
        leadId: lead.id,
        queryId: lead.queryId,
        runId: lead.runId,
      },
    }

    const handoff = await prisma.ecobeHandoff.create({
      data: {
        organizationId: session.user.organizationId!,
        leadId,
        queryId: lead.queryId,
        runId: lead.runId,
        handoffType: 'PROSPECT',
        status: 'PENDING',
        payloadJson: handoffPayload,
        qualificationReason: qualification.reason,
        qualificationScore: qualification.score,
        attempts: 0,
      },
    })

    try {
      // Trigger event-driven job instead of direct API call
      const { jobScheduler } = await import('@/lib/jobs/scheduler')
      const jobId = await jobScheduler.triggerEcobeHandoff(handoff.id, leadId)

      await publishEvent({
        type: 'ECOBE_HANDOFF_QUEUED',
        payload: {
          handoffId: handoff.id,
          leadId,
          jobId,
        } as any,
      })

      await recordMetric('ecobe.handoff.queued', {
        handoffId: handoff.id,
        leadId,
        qualificationScore: qualification.score,
      }, session.user.organizationId!)

      return NextResponse.json({
        success: true,
        handoffId: handoff.id,
        status: 'QUEUED',
        jobId,
        qualification: {
          isQualified: qualification.isQualified,
          score: qualification.score,
          reason: qualification.reason,
        },
      })

    } catch (apiError) {
      await prisma.ecobeHandoff.update({
        where: { id: handoff.id },
        data: {
          status: 'FAILED',
          errorMessage: apiError instanceof Error ? apiError.message : 'Unknown error',
          failedAt: new Date(),
          attempts: { increment: 1 },
        },
      })

      await publishEvent({
        type: 'ECOBE_HANDOFF_FAILED',
        payload: {
          handoffId: handoff.id,
          leadId,
          error: apiError instanceof Error ? apiError.message : 'Unknown error',
        },
      })

      return NextResponse.json({
        error: 'Failed to send handoff to ECOBE',
        handoffId: handoff.id,
        apiError: apiError instanceof Error ? apiError.message : 'Unknown error',
      }, { status: 502 })
    }

  } catch (error) {
    console.error('ECOBE handoff error:', error)
    return NextResponse.json({
      error: 'Internal server error',
    }, { status: 500 })
  }
}
