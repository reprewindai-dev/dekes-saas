const LEGACY_DEFAULT_BASE = 'http://localhost:3000'
const MODERN_DEFAULT_BASE = 'https://api.ecobe.dev'

export type EcobeOptimizeRequest = {
  query: {
    id: string
    query: string
    estimatedResults: number
  }
  carbonBudget: number
  regions: string[]
}

export type EcobeOptimizeResponse = {
  selectedRegion: string
  estimatedCO2?: number
  scheduledTime?: string
  [key: string]: unknown
}

export type EcobeReportCarbonUsageRequest = {
  queryId: string
  actualCO2: number
}

export type EcobeAnalyticsResponse = {
  totalWorkloads: number
  totalCO2Saved: number
  averageCarbonIntensity: number
  workloads: Array<{
    id: string
    queryString: string
    selectedRegion: string
    actualCO2: number
    status: string
    createdAt: string
  }>
}

export type EcobeProspectPayload = {
  organization: {
    name: string
    domain?: string | null
    sizeLabel?: string | null
    region?: string | null
  }
  intent: {
    score: number
    reason: string
    keywords: string[]
  }
  contact?: {
    name?: string | null
    email?: string | null
    linkedin?: string | null
  }
  source: {
    leadId: string
    queryId?: string | null
    runId?: string | null
  }
}

export type EcobeTenantPayload = {
  organizationName: string
  externalOrgId: string
  ownerEmail: string
  plan?: string
}

export type EcobeDemoPayload = {
  organizationName: string
  contactEmail: string
  workloadSummary: string
  priority?: 'low' | 'medium' | 'high'
  metadata?: Record<string, unknown>
}

export type EcobeHandoffStatusResponse = {
  status: string
  externalLeadId?: string
  externalOrgId?: string
  convertedAt?: string
  notes?: string
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '')
}

function getLegacyBaseUrl(): string {
  return normalizeBaseUrl(process.env.ECOBE_ENGINE_BASE_URL || process.env.ECOBE_ENGINE_URL || LEGACY_DEFAULT_BASE)
}

function getLegacyHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const apiKey = process.env.ECOBE_ENGINE_API_KEY
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`
  return headers
}

function getModernBaseUrl(): string {
  return normalizeBaseUrl(process.env.ECOBE_API_BASE_URL || MODERN_DEFAULT_BASE)
}

function getModernApiKey(): string {
  const key = process.env.ECOBE_API_KEY
  if (!key) throw new Error('Missing ECOBE_API_KEY')
  return key
}

async function callModernApi<T = any>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${getModernBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getModernApiKey()}`,
      ...(init.headers || {}),
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`ECOBE API ${path} failed (${res.status}): ${text}`)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

function getOptimizeUrl(): string {
  const direct = process.env.ECOBE_OPTIMIZE_URL || process.env.ECOBE_ENGINE_URL
  if (direct) return normalizeBaseUrl(direct)
  return `${getLegacyBaseUrl()}/api/v1/dekes/optimize`
}

function getReportUrl(): string {
  const direct = process.env.ECOBE_REPORT_URL
  if (direct) return normalizeBaseUrl(direct)
  return `${getLegacyBaseUrl()}/api/v1/dekes/report`
}

function getAnalyticsUrl(): string {
  const direct = process.env.ECOBE_ANALYTICS_URL
  if (direct) return normalizeBaseUrl(direct)
  return `${getLegacyBaseUrl()}/api/v1/dekes/analytics`
}

export async function ecobeOptimizeQuery(request: EcobeOptimizeRequest): Promise<EcobeOptimizeResponse> {
  const res = await fetch(getOptimizeUrl(), {
    method: 'POST',
    headers: getLegacyHeaders(),
    body: JSON.stringify(request),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`ECOBE optimize failed (${res.status}): ${text}`)
  }

  return (await res.json()) as EcobeOptimizeResponse
}

export async function ecobeReportCarbonUsage({ queryId, actualCO2 }: EcobeReportCarbonUsageRequest): Promise<void> {
  const res = await fetch(getReportUrl(), {
    method: 'POST',
    headers: getLegacyHeaders(),
    body: JSON.stringify({ queryId, actualCO2 }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`ECOBE report failed (${res.status}): ${text}`)
  }
}

export async function ecobeFetchAnalytics(): Promise<EcobeAnalyticsResponse> {
  const res = await fetch(getAnalyticsUrl(), {
    method: 'GET',
    headers: getLegacyHeaders(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`ECOBE analytics failed (${res.status}): ${text}`)
  }

  return (await res.json()) as EcobeAnalyticsResponse
}

export async function createEcobeProspect(payload: EcobeProspectPayload) {
  return callModernApi<{ id: string; status: string; externalLeadId?: string }>('/api/v1/prospects', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function createEcobeTenant(payload: EcobeTenantPayload) {
  return callModernApi<{ id: string; status: string; externalOrgId?: string }>('/api/v1/tenants', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function triggerEcobeDemo(payload: EcobeDemoPayload) {
  return callModernApi<{ id: string; status: string }>('/api/v1/demos', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getEcobeHandoffStatus(externalId: string) {
  return callModernApi<EcobeHandoffStatusResponse>(`/api/v1/handoffs/${externalId}`, {
    method: 'GET',
  })
}
