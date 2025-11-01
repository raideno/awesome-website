import GitHub from '@auth/core/providers/github'
import { convexAuth } from '@convex-dev/auth/server'

import { internal } from './_generated/api'

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [GitHub],
  callbacks: {
    afterUserCreatedOrUpdated: async (context, args) => {
      await context.scheduler.runAfter(0, internal.stripe.setup, {
        entityId: args.userId,
        email: args.profile.email,
      })
    },
  },
})
