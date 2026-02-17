import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, validatePassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/jwt'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
  organizationName: z.string().min(1).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = signupSchema.parse(body)

    // Validate password strength
    const passwordCheck = validatePassword(data.password)
    if (!passwordCheck.valid) {
      return NextResponse.json({ error: passwordCheck.error }, { status: 400 })
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Hash password
    const passwordHash = await hashPassword(data.password)

    // Create organization and user atomically
    const organization = await prisma.organization.create({
      data: {
        name: data.organizationName || `${data.email}'s Organization`,
        slug: `org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        owner: {
          create: {
            email: data.email,
            passwordHash,
            name: data.name,
            role: 'ADMIN',
            emailVerified: false,
          },
        },
        plan: 'FREE',
        status: 'TRIAL',
        monthlyLeadQuota: 100,
      },
      include: { owner: true },
    })

    // Update user with organization ID
    await prisma.user.update({
      where: { id: organization.owner.id },
      data: { organizationId: organization.id },
    })

    // Create session
    const token = await createSession(
      organization.owner.id,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({
      user: {
        id: organization.owner.id,
        email: organization.owner.email,
        name: organization.owner.name,
        organizationId: organization.id,
      },
      token,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
