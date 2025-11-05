import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import * as React from 'react'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { ProtectedAuthDialog } from '@/components/protected-auth-dialog'
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
        <Header />
        <div className="mx-auto max-w-3xl py-20 pt-24">
          <Outlet />
        </div>
        <Footer />
        <ProtectedAuthDialog />
      </React.Fragment>
    )
  },
})
