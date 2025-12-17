import { createFileRoute } from '@tanstack/react-router'
import { stripe } from '@/server/stripe-client'
import { prisma } from '@/db'
import type { Stripe } from 'stripe'

export const Route = createFileRoute('/api/stripe/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text()
        const signature = request.headers.get('stripe-signature') as string

        let event: Stripe.Event

        try {
          if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not defined')
          }
          event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET,
          )
        } catch (err: any) {
          console.error(`Webhook signature verification failed: ${err.message}`)
          return new Response(`Webhook Error: ${err.message}`, { status: 400 })
        }

        try {
          switch (event.type) {
            case 'checkout.session.completed': {
              const session = event.data.object as Stripe.Checkout.Session
              const userId = session.metadata?.userId

              if (!userId) {
                console.error('Missing userId in session metadata')
                break
              }

              // For one-time payments, we just need to mark the user as having paid.
              await prisma.user.update({
                where: { id: userId },
                data: {
                  stripeCustomerId: session.customer as string,
                  stripeSubscriptionStatus: 'active', // Mark as active for lifetime access
                },
              })
              break
            }
            // Handle other events like invoice.payment_failed if needed
            default:
              console.log(`Unhandled event type ${event.type}`)
          }
        } catch (error) {
          console.error('Error processing webhook:', error)
          return new Response('Webhook handler failed', { status: 500 })
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
