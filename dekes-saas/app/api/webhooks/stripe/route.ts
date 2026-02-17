import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')!

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const organizationId = session.metadata?.organizationId
        const plan = session.metadata?.plan

        if (organizationId && plan) {
          await prisma.organization.update({
            where: { id: organizationId },
            data: {
              stripeSubscriptionId: session.subscription as string,
              stripePriceId: session.line_items?.data[0]?.price?.id,
              plan: plan as any,
              status: 'ACTIVE',
            },
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const organization = await prisma.organization.findUnique({
          where: { stripeCustomerId: subscription.customer as string },
        })

        if (organization) {
          await prisma.organization.update({
            where: { id: organization.id },
            data: {
              status: subscription.status === 'active' ? 'ACTIVE' : 'PAST_DUE',
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const organization = await prisma.organization.findUnique({
          where: { stripeCustomerId: subscription.customer as string },
        })

        if (organization) {
          await prisma.organization.update({
            where: { id: organization.id },
            data: {
              plan: 'FREE',
              status: 'CANCELED',
              stripeSubscriptionId: null,
              stripePriceId: null,
            },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
