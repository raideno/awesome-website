import type { InputConfiguration as StripeConfiguration } from '@raideno/convex-stripe/server'

export default {
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY!,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
} as StripeConfiguration
