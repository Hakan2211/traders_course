import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { stripe } from './stripe-client'
import { getSession } from './session'
import { prisma } from '@/db'

const CreateCheckoutSchema = z.object({
  priceId: z.string(),
})

export const createCheckoutSessionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid input')
    }
    return CreateCheckoutSchema.parse(data)
  })
  .handler(async ({ data }) => {
    const session = await getSession()

    if (!session || !session.user) {
      throw new Error('Unauthorized')
    }

    const userId = session.user.id
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Determine the absolute URL for success/cancel
    // In production this should be the actual domain
    const origin = process.env.VITE_PUBLIC_APP_URL || 'http://localhost:3000'

    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || user.username,
        metadata: {
          userId: user.id,
        },
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: data.priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/course?success=true`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        userId: userId,
      },
    })

    if (!checkoutSession.url) {
      throw new Error('Failed to create checkout session')
    }

    return { url: checkoutSession.url }
  })
