import { getAuthUserId } from '@convex-dev/auth/server'
import { internalConvexStripe } from '@raideno/convex-stripe/server'
import { v } from 'convex/values'

import { action, query } from './_generated/server'

import stripeConfig from './stripe.config'

export const { stripe, store, sync, setup } = internalConvexStripe(stripeConfig)

export const products = query({
  args: {},
  handler: async (context) => {
    const prices = await context.db.query('stripePrices').collect()
    const prods = await context.db.query('stripeProducts').collect()

    return prods.map((product) => ({
      ...product,
      prices: prices.filter(
        (price) => price.stripe.productId === product.productId,
      ),
    }))
  },
})

export const subscription = query({
  args: {},
  handler: async (context) => {
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

    const sub = await context.db
      .query('stripeSubscriptions')
      .withIndex('byCustomerId', (q) => q.eq('customerId', customer.customerId))
      .unique()

    if (!sub) {
      console.warn(
        '[error]:',
        'user',
        userId,
        'exists but with no subscription record associated.',
      )
      return null
    }

    // TODO: do not send everything, filter to send only strictly necessary things.
    return sub
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

    const checkout = await stripe.subscribe(context, {
      entityId: userId,
      priceId: args.priceId,
      mode: 'subscription',
      success_url: args.successRedirectUrl,
      cancel_url: args.cancelRedirectUrl,
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

    return await stripe.portal(context, {
      entityId: userId,
      return_url: args.returnRedirectUrl,
    })
  },
})
