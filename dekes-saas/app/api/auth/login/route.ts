import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/jwt'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = loginSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { organization: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account is suspended' }, { status: 403 })
    }

    // Verify password
    const valid = await verifyPassword(data.password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Create session
    const token = await createSession(
      user.id,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    )

    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationId: user.organizationId,
        role: user.role,
      },
      token,
    })

    res.cookies.set({
      name: 'DEKES_SESSION',
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return res
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    const message = error instanceof Error ? error.message : String(error)
    console.error('Login error:', message)

    if (
      message.includes('Missing JWT_SECRET') ||
      message.includes('Missing SESSION_SECRET') ||
      message.includes('STRIPE_SECRET_KEY')
    ) {
      return NextResponse.json({ error: message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to log in' }, { status: 500 })
  }
}
