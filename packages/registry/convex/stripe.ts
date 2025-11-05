import { convexAuth, getAuthUserId } from '@convex-dev/auth/server'
import { internalConvexStripe } from '@raideno/convex-stripe/server'

import { action, query } from './_generated/server'
import { v } from 'convex/values'

export const { stripe, store, sync, setup } = internalConvexStripe({
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY!,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
})

export const products = query({
  args: {},
  handler: async (context) => {
    const prices = await context.db.query('stripePrices').collect()
    const products = await context.db.query('stripeProducts').collect()

    return products.map((product) => ({
      ...product,
      prices: prices.filter(
        (price) => price.stripe.productId === product.productId,
      ),
    }))
  },
})

export const subscription = query({
  args: {},
  handler: async (context, args) => {
    const userId = await getAuthUserId(context)

    if (!userId) return null

    const customer = await context.db
      .query('stripeCustomers')
      .withIndex('byEntityId', (q) => q.eq('entityId', userId))
      .unique()

    if (!customer) {
      console.warn(
        '[error]:',
        'user',
        userId,
        'exists but with stripe customer associated.',
      )
      return null
    }

    const subscription = await context.db
      .query('stripeSubscriptions')
      .withIndex('byCustomerId', (q) => q.eq('customerId', customer.customerId))
      .unique()

    if (!subscription) {
      console.warn(
        '[error]:',
        'user',
        userId,
        'exists but with no subscription record associated.',
      )
      return null
    }

    // TODO: do not send everything, filter to send only strictly necessary things.
    return subscription
  },
})

export const subscribe = action({
  args: {
    priceId: v.string(),
    successRedirectUrl: v.string(),
    cancelRedirectUrl: v.string(),
  },
  handler: async (
    context,
    args,
  ): Promise<{
    url: string | null
  }> => {
    const userId = await getAuthUserId(context)

    if (!userId) throw new Error('Unauthorized')

    const checkout = await stripe.subscribe(context as any, {
      entityId: userId,
      priceId: args.priceId,
      success: { url: args.successRedirectUrl },
      cancel: { url: args.cancelRedirectUrl },
    })

    return checkout
  },
})

export const portal = action({
  args: {
    returnRedirectUrl: v.string(),
  },
  handler: async (context, args) => {
    const userId = await getAuthUserId(context)

    if (!userId) throw new Error('Unauthorized')

    const portal = await stripe.portal(context as any, {
      entityId: userId,
      return: { url: args.returnRedirectUrl },
    })

    return portal
  },
})
