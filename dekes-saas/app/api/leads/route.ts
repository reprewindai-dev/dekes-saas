import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { validateSession } from '@/lib/auth/jwt'

export async function GET(request: Request) {
  try {
    const token =
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      cookies().get('DEKES_SESSION')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await validateSession(token)
    const organizationId = session?.user.organizationId
    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const leads = await prisma.lead.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('List leads error:', error)
    return NextResponse.json({ error: 'Failed to list leads' }, { status: 500 })
  }
}
