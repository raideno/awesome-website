import { internalConvexStripe } from '@raideno/convex-stripe/server'

export const { stripe, store, sync, setup } = internalConvexStripe({
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY!,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
})
