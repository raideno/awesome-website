import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import * as React from 'react'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { ProtectedAuthDialog } from '@/components/protected-auth-dialog'
import { SubscriptionBanner } from '@/components/subscription-banner'
import { AuthenticationContextType } from '@/contexts/authentication'
import { SubscriptionContextType } from '@/contexts/subscription'

interface RouterContext {
  authentication: AuthenticationContextType
  subscription: SubscriptionContextType
}

// TODO: put a context on here so it can be used by the rest of the app
//       or maybe put it at the level of the dashboard only since it is mainly there were we do need
//       authentication and stuff
export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    return (
      <React.Fragment>
        <SubscriptionBanner />
        <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
          <Header />
          <div className="mx-auto w-full max-w-3xl py-8 pt-20 sm:py-12 sm:pt-24 px-4 sm:px-6 lg:px-0">
            <Outlet />
          </div>
          <Footer />
        </div>
        <ProtectedAuthDialog />
      </React.Fragment>
    )
  },
})
