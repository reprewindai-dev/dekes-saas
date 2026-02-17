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

function getEcobeBaseUrl(): string {
  return process.env.ECOBE_ENGINE_URL || 'http://localhost:3000'
}

export async function ecobeOptimizeQuery(
  request: EcobeOptimizeRequest
): Promise<EcobeOptimizeResponse> {
  const baseUrl = getEcobeBaseUrl()
  const url = `${baseUrl}/api/v1/dekes/optimize`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const apiKey = process.env.ECOBE_ENGINE_API_KEY
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
    cache: 'no-store',
  })

  if (!res.ok) {
    let details: unknown = undefined
    try {
      details = await res.json()
    } catch {
      details = await res.text().catch(() => undefined)
    }
    throw new Error(`ECOBE optimize failed (${res.status}): ${JSON.stringify(details)}`)
  }

  return (await res.json()) as EcobeOptimizeResponse
}
