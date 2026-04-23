import {
  DksWorkloadPayload,
  DksWorkloadResponse,
  DksWorkloadOutcome,
  DksWorkloadPayloadSchema,
  DksWorkloadOutcomeSchema,
} from './dks-workload-schema'
import { createApiError, createNetworkError, classifyError, logError } from '../error/error-handler'

export class DksWorkloadEmitter {
  private _baseUrl: string | null = null
  private _apiKey: string | null = null
  private _enabled: boolean | null = null

  private get baseUrl(): string {
    if (this._baseUrl === null) {
      const url = process.env.CO2ROUTER_API_URL || process.env.ECOBE_ENGINE_URL
      if (!url) {
        throw new Error('CO2ROUTER_API_URL or ECOBE_ENGINE_URL environment variable is required')
      }
      this._baseUrl = url.replace(/\/$/, '')
    }
    return this._baseUrl
  }

  private get apiKey(): string {
    if (this._apiKey === null) {
      const key = process.env.CO2ROUTER_API_KEY || process.env.ECOBE_ENGINE_API_KEY
      if (!key) {
        throw new Error('CO2ROUTER_API_KEY or ECOBE_ENGINE_API_KEY environment variable is required')
      }
      this._apiKey = key
    }
    return this._apiKey
  }

  private get enabled(): boolean {
    if (this._enabled === null) {
      this._enabled = process.env.CO2ROUTER_INTEGRATION_ENABLED !== 'false'
    }
    return this._enabled
  }

  async emitWorkload(payload: Omit<DksWorkloadPayload, 'sourceApp'>): Promise<DksWorkloadResponse> {
    if (!this.enabled) {
      return {
        success: false,
        error: {
          code: 'INTEGRATION_DISABLED',
          message: 'CO2Router integration is disabled',
        },
      }
    }

    try {
      const validatedPayload = DksWorkloadPayloadSchema.parse({
        ...payload,
        sourceApp: 'dks' as const,
      })

      console.log(`[DKS->CO2Router] Emitting workload: ${validatedPayload.workloadId}`, {
        type: validatedPayload.workloadType,
        org: validatedPayload.orgId,
        regions: validatedPayload.candidateRegions,
      })

      const response = await fetch(`${this.baseUrl}/api/v1/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'User-Agent': 'DKS-SaaS/1.0',
        },
        body: JSON.stringify({
          orgId: validatedPayload.orgId,
          workloadId: validatedPayload.workloadId,
          sourceApp: 'dks',
          workload: {
            type: validatedPayload.workloadType,
            modelFamily: validatedPayload.metadata?.signalType,
            estimatedGpuHours: validatedPayload.estimatedGpuHours,
            estimatedCpuHours: validatedPayload.estimatedCpuHours,
            estimatedMemoryGb: validatedPayload.estimatedMemoryGb,
          },
          constraints: {
            maxLatencyMs: validatedPayload.maxLatencyMs,
            deadlineAt: validatedPayload.deadlineAt,
            mustRunRegions: validatedPayload.candidateRegions,
            excludedRegions: validatedPayload.excludedRegions,
            carbonPriority: validatedPayload.carbonPriority,
            costPriority: validatedPayload.priority,
            latencyPriority: validatedPayload.priority,
          },
          execution: {
            mode: validatedPayload.allowTimeShifting ? 'scheduled' : 'immediate',
            candidateStartWindowHours: validatedPayload.durationMinutes
              ? Math.ceil(validatedPayload.durationMinutes / 60)
              : undefined,
          },
          preferences: {
            allowTimeShifting: validatedPayload.allowTimeShifting,
            allowCrossRegionExecution: validatedPayload.allowCrossRegionExecution,
            requireCreditCoverage: false,
          },
          metadata: {
            ...validatedPayload.metadata,
            sourceApp: 'dks',
            emittedAt: new Date().toISOString(),
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        const error = createApiError(response.status, `CO2Router API error (${response.status}): ${errorText}`)
        logError(error, {
          workloadId: payload.workloadId,
          endpoint: '/api/v1/command',
          status: response.status,
        })
        throw error
      }

      const result = await response.json()
      return {
        success: true,
        commandId: result.commandId,
        recommendation: result.recommendation,
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'StandardError') {
        throw error
      }

      const standardError =
        error instanceof Error && error.message.includes('fetch')
          ? createNetworkError(`Failed to connect to CO2Router: ${error.message}`, {
              workloadId: payload.workloadId,
              endpoint: '/api/v1/command',
            })
          : classifyError(error)

      logError(standardError, {
        workloadId: payload.workloadId,
        action: 'emit_workload',
      })

      return {
        success: false,
        error: {
          code: standardError.code || 'EMISSION_FAILED',
          message: standardError.message || 'Failed to emit workload to CO2Router',
        },
      }
    }
  }

  async reportOutcome(outcome: DksWorkloadOutcome): Promise<void> {
    if (!this.enabled) {
      return
    }

    try {
      const validatedOutcome = DksWorkloadOutcomeSchema.parse(outcome)

      const response = await fetch(`${this.baseUrl}/api/v1/outcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'User-Agent': 'DKS-SaaS/1.0',
        },
        body: JSON.stringify({
          commandId: validatedOutcome.commandId,
          orgId: validatedOutcome.orgId,
          sourceApp: 'dks',
          execution: validatedOutcome.execution,
          emissions: validatedOutcome.emissions,
          cost: validatedOutcome.cost,
          status: validatedOutcome.status,
          metadata: {
            ...validatedOutcome.metadata,
            sourceApp: 'dks',
            reportedAt: new Date().toISOString(),
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error(`[DKS->CO2Router] Failed to report outcome: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('[DKS->CO2Router] Error reporting outcome:', error)
    }
  }

  async healthCheck(): Promise<{ healthy: boolean; error?: string }> {
    if (!this.enabled) {
      return { healthy: false, error: 'Integration disabled' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'User-Agent': 'DKS-SaaS/1.0',
        },
      })

      return { healthy: response.ok }
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown health check error',
      }
    }
  }
}

export const dksWorkloadEmitter = new DksWorkloadEmitter()

export async function emitDksWorkload(
  workloadType: DksWorkloadPayload['workloadType'],
  organizationId: string,
  context: {
    leadId?: string
    queryId?: string
    runId?: string
    userId?: string
    signalType?: string
    signalCount?: number
    estimatedQueries?: number
    durationMinutes?: number
  },
  options: {
    priority?: DksWorkloadPayload['priority']
    carbonPriority?: DksWorkloadPayload['carbonPriority']
    candidateRegions?: string[]
    excludedRegions?: string[]
    maxLatencyMs?: number
    deadlineAt?: string
  } = {},
): Promise<DksWorkloadResponse> {
  const workloadId = `dks-${workloadType}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

  return dksWorkloadEmitter.emitWorkload({
    workloadId,
    orgId: organizationId,
    userId: context.userId,
    workloadType,
    estimatedCpuHours: context.estimatedQueries ? context.estimatedQueries * 0.01 : 0.1,
    durationMinutes: context.durationMinutes || 30,
    candidateRegions: options.candidateRegions,
    excludedRegions: options.excludedRegions,
    maxLatencyMs: options.maxLatencyMs,
    deadlineAt: options.deadlineAt,
    priority: options.priority || 'medium',
    carbonPriority: options.carbonPriority || 'medium',
    allowTimeShifting: true,
    allowCrossRegionExecution: true,
    metadata: {
      leadId: context.leadId,
      queryId: context.queryId,
      runId: context.runId,
      signalType: context.signalType,
      signalCount: context.signalCount,
      estimatedQueries: context.estimatedQueries,
      complexity: context.estimatedQueries
        ? context.estimatedQueries > 1000
          ? 'complex'
          : context.estimatedQueries > 100
            ? 'medium'
            : 'simple'
        : 'simple',
    },
  })
}
