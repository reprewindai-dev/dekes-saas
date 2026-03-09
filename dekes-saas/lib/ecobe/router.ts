const ECOBE_BASE = (process.env.ECOBE_API_BASE_URL || 'https://api.ecobe.dev').replace(/\/+$/, '')

function getHeaders(): Record<string, string> {
  const key = process.env.ECOBE_API_KEY
  return {
    'Content-Type': 'application/json',
    ...(key ? { Authorization: `Bearer ${key}` } : {}),
  }
}

export type WorkloadType =
  | 'lead_generation_batch'
  | 'enrichment_job'
  | 'intent_classification_batch'
  | 'web_discovery_task'

export type EcobeRouteRequest = {
  organizationId: string
  source: 'DEKES'
  workloadType: WorkloadType
  candidateRegions: string[]
  durationMinutes: number
  delayToleranceMinutes: number
}

export type EcobeRouteAction = 'execute' | 'delay' | 'reroute'

export type EcobeRouteResponse = {
  decisionId: string
  action: EcobeRouteAction
  /** Region to run in (execute / reroute) */
  selectedRegion?: string
  /** Alias used by reroute responses */
  target?: string
  predicted_clean_window?: {
    expected_minutes: number
    region?: string
  }
  carbonDelta?: number
  qualityTier?: string
  policyAction?: string
  timestamp: string
}

export type EcobeCompleteRequest = {
  decision_id: string
  executionRegion: string
  durationMinutes: number
  status: 'success' | 'failed' | 'partial'
}

export async function ecobeRouteWorkload(req: EcobeRouteRequest): Promise<EcobeRouteResponse> {
  const res = await fetch(`${ECOBE_BASE}/api/v1/route`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(req),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`ECOBE route failed (${res.status}): ${text}`)
  }

  return (await res.json()) as EcobeRouteResponse
}

export async function ecobeCompleteWorkload(req: EcobeCompleteRequest): Promise<void> {
  const res = await fetch(`${ECOBE_BASE}/api/v1/workloads/complete`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(req),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`ECOBE complete failed (${res.status}): ${text}`)
  }
}
