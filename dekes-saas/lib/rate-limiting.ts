import { redisCache } from '@/lib/upstash/redis'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class InMemoryRateLimiter {
  private store: RateLimitStore = {}
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests = 5, windowMs = 60_000, cleanupIntervalMs = 300_000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs

    const timer = setInterval(() => this.cleanup(), cleanupIntervalMs)
    timer.unref?.()
  }

  private cleanup(): void {
    const now = Date.now()
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].resetTime <= now) {
        delete this.store[key]
      }
    })
  }

  isAllowed(identifier: string): { allowed: boolean; resetTime?: number; remaining?: number } {
    const now = Date.now()

    if (!this.store[identifier] || this.store[identifier].resetTime <= now) {
      this.store[identifier] = {
        count: 1,
        resetTime: now + this.windowMs,
      }
      return {
        allowed: true,
        resetTime: this.store[identifier].resetTime,
        remaining: this.maxRequests - 1,
      }
    }

    if (this.store[identifier].count >= this.maxRequests) {
      return {
        allowed: false,
        resetTime: this.store[identifier].resetTime,
        remaining: 0,
      }
    }

    this.store[identifier].count++
    return {
      allowed: true,
      resetTime: this.store[identifier].resetTime,
      remaining: this.maxRequests - this.store[identifier].count,
    }
  }

  reset(): void {
    this.store = {}
  }
}

class DistributedRateLimiter {
  private fallback: InMemoryRateLimiter
  private readonly maxRequests: number
  private readonly windowSeconds: number

  constructor(maxRequests: number, windowSeconds: number) {
    this.maxRequests = maxRequests
    this.windowSeconds = windowSeconds
    this.fallback = new InMemoryRateLimiter(maxRequests, windowSeconds * 1000)
  }

  async isAllowed(identifier: string): Promise<{ allowed: boolean; resetTime?: number; remaining?: number }> {
    try {
      return await redisCache.checkRateLimit(identifier, this.maxRequests, this.windowSeconds)
    } catch {
      return this.fallback.isAllowed(identifier)
    }
  }

  reset(): void {
    this.fallback.reset()
  }
}

export const authRateLimiter = new DistributedRateLimiter(5, 15 * 60)
export const apiRateLimiter = new DistributedRateLimiter(100, 60)
export const heavyApiRateLimiter = new DistributedRateLimiter(10, 60)

export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  const ip =
    forwardedFor?.split(',')[0]?.trim() ||
    realIp ||
    cfConnectingIp ||
    'unknown'

  const userAgent = request.headers.get('user-agent') || 'unknown'
  return `${ip}:${Buffer.from(userAgent).toString('base64').slice(0, 16)}`
}
