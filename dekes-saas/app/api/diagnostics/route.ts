export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

export async function GET() {
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL ? 'SET (' + process.env.DATABASE_URL.substring(0, 20) + '...)' : 'MISSING',
    direct_database_url: process.env.DIRECT_DATABASE_URL ? 'SET' : 'MISSING',
    jwt_secret: process.env.JWT_SECRET ? 'SET' : 'MISSING',
  }

  // Test Prisma connectivity
  try {
    const { prisma } = await import('@/lib/db')
    const count = await prisma.user.count()
    checks.prisma = { status: 'connected', userCount: count }
  } catch (err: any) {
    checks.prisma = { status: 'error', message: err.message, name: err.name }
  }

  // Test JWT
  try {
    const { generateToken } = await import('@/lib/auth/jwt')
    const token = generateToken({ userId: 'test', email: 'test@test.com' })
    checks.jwt = { status: 'ok', tokenLength: token.length }
  } catch (err: any) {
    checks.jwt = { status: 'error', message: err.message }
  }

  return NextResponse.json(checks)
}
