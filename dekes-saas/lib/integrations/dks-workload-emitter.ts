import { 
  DksWorkloadPayload, 
  DksWorkloadResponse, 
  DksWorkloadOutcome,
  DksWorkloadPayloadSchema,
  DksWorkloadOutcomeSchema
} from './dks-workload-schema'
import { createApiError, createNetworkError, classifyError, logError } from '../error/error-handler'

/**
 * DKS → CO₂Router Workload Emitter
 * Handles sending DKS workloads to CO₂Router for carbon-aware routing
 */
export class DksWorkloadEmitter {
  private baseUrl: string
  private apiKey: string
  private enabled: boolean

  constructor() {
    this.baseUrl = this.getCo2RouterBaseUrl()
    this.apiKey = this.getCo2RouterApiKey()
    this.enabled = this.isEnabled()
  }

  private getCo2RouterBaseUrl(): string {
    const url = process.env.CO2ROUTER_API_URL || process.env.ECOBE_ENGINE_URL
    if (!url) {
      throw new Error('CO2ROUTER_API_URL or ECOBE_ENGINE_URL environment variable is required')
    }
    return url.replace(/\/$/, '')
  }

  private getCo2RouterApiKey(): string {
    const key = process.env.CO2ROUTER_API_KEY || process.env.ECOBE_ENGINE_API_KEY
    if (!key) {
      throw new Error('CO2ROUTER_API_KEY or ECOBE_ENGINE_API_KEY environment variable is required')
    }
    return key
  }

  private isEnabled(): boolean {
    return process.env.CO2ROUTER_INTEGRATION_ENABLED !== 'false'
  }

  /**
   * Send a DKS workload to CO₂Router for carbon-aware routing
   */
  async emitWorkload(payload: Omit<DksWorkloadPayload, 'sourceApp'>): Promise<DksWorkloadResponse> {
    if (!this.enabled) {
      console.warn('CO₂Router integration disabled, skipping workload emission')
      return {
        success: false,
        error: {
          code: 'INTEGRATION_DISABLED',
          message: 'CO₂Router integration is disabled'
        }
      }
    }

    try {
      // Validate payload
      const validatedPayload = DksWorkloadPayloadSchema.parse({
        ...payload,
        sourceApp: 'dks' as const
      })

      console.log(`[DKS→CO₂Router] Emitting workload: ${validatedPayload.workloadId}`, {
        type: validatedPayload.workloadType,
        org: validatedPayload.organizationId,
        regions: validatedPayload.candidateRegions
      })

      const response = await fetch(`${this.baseUrl}/api/v1/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'DKS-SaaS/1.0'
        },
        body: JSON.stringify({
          orgId: validatedPayload.organizationId,
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
            candidateStartWindowHours: validatedPayload.durationMinutes ? Math.ceil(validatedPayload.durationMinutes / 60) : undefined,
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
          }
        }),
        signal: false, // Don't follow redirects
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        const error = createApiError(
          response.status, 
          `CO₂Router API error (${response.status}): ${errorText}`
        )
        logError(error, { 
          workloadId: payload.workloadId,
          endpoint: '/api/v1/command',
          status: response.status 
        })
        throw error
      }

      const result = await response.json()
      
      console.log(`[DKS→CO₂Router] Workload routed successfully: ${validatedPayload.workloadId}`, {
        commandId: result.commandId,
        selectedRegion: result.recommendation?.selectedRegion,
        estimatedCO2: result.recommendation?.estimatedCO2
      })

      return {
        success: true,
        commandId: result.commandId,
        recommendation: result.recommendation
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'StandardError') {
        throw error
      }

      const standardError = error instanceof Error && error.message.includes('fetch')
        ? createNetworkError(`Failed to connect to CO₂Router: ${error.message}`, { 
            workloadId: payload.workloadId,
            endpoint: '/api/v1/command'
          })
        : classifyError(error)

      logError(standardError, { 
        workloadId: payload.workloadId,
        action: 'emit_workload'
      })

      // Return error response instead of throwing to avoid breaking DKS workflows
      return {
        success: false,
        error: {
          code: standardError.code || 'EMISSION_FAILED',
          message: standardError.message || 'Failed to emit workload to CO₂Router'
        }
      }
    }
  }

  /**
   * Report actual workload execution outcome back to CO₂Router
   */
  async reportOutcome(outcome: DksWorkloadOutcome): Promise<void> {
    if (!this.enabled) {
      console.warn('CO₂Router integration disabled, skipping outcome reporting')
      return
    }

    try {
      // Validate outcome
      const validatedOutcome = DksWorkloadOutcomeSchema.parse(outcome)

      console.log(`[DKS→CO₂Router] Reporting outcome for command: ${validatedOutcome.commandId}`, {
        region: validatedOutcome.execution.actualRegion,
        completed: validatedOutcome.status.completed,
        emissions: validatedOutcome.emissions?.actualEmissionsKgCo2e
      })

      const response = await fetch(`${this.baseUrl}/api/v1/outcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'DKS-SaaS/1.0'
        },
        body: JSON.stringify({
          commandId: validatedOutcome.commandId,
          orgId: validatedOutcome.metadata?.organizationId || 'unknown',
          execution: validatedOutcome.execution,
          emissions: validatedOutcome.emissions,
          cost: validatedOutcome.cost,
          status: validatedOutcome.status,
          metadata: {
            ...validatedOutcome.metadata,
            sourceApp: 'dks',
            reportedAt: new Date().toISOString(),
          }
        }),
        signal: false,
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error(`[DKS→CO₂Router] Failed to report outcome: ${response.status} ${errorText}`)
        // Don't throw - outcome reporting failures shouldn't break DKS workflows
        return
      }

      console.log(`[DKS→CO₂Router] Outcome reported successfully: ${validatedOutcome.commandId}`)

    } catch (error) {
      console.error(`[DKS→CO₂Router] Error reporting outcome:`, error)
      // Don't throw - outcome reporting failures shouldn't break DKS workflows
    }
  }

  /**
   * Check if CO₂Router integration is healthy
   */
  async healthCheck(): Promise<{ healthy: boolean; error?: string }> {
    if (!this.enabled) {
      return { healthy: false, error: 'Integration disabled' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'DKS-SaaS/1.0'
        },
        signal: false,
      })

      return { healthy: response.ok }
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Unknown health check error' 
      }
    }
  }
}

// Singleton instance
export const dksWorkloadEmitter = new DksWorkloadEmitter()

/**
 * Convenience function to emit a workload with common DKS context
 */
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
  } = {}
): Promise<DksWorkloadResponse> {
  
  const workloadId = `dks-${workloadType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  return dksWorkloadEmitter.emitWorkload({
    workloadId,
    sourceApp: 'dks',
    organizationId,
    userId: context.userId,
    workloadType,
    estimatedCpuHours: context.estimatedQueries ? context.estimatedQueries * 0.01 : 0.1, // Rough estimate
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
      complexity: context.estimatedQueries ? 
        (context.estimatedQueries > 1000 ? 'complex' : context.estimatedQueries > 100 ? 'medium' : 'simple') : 
        'simple'
    }
  })
}
