import { prisma } from '@/lib/db'
import type { JsonValue } from '@/lib/jobs/types'

export async function recordMetric(name: string, value: JsonValue, scope?: string) {
  await prisma.operationalMetric.create({
    data: {
      name,
      scope,
      value,
    },
  })
}
