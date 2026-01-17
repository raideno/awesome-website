import { RouterProvider, createRouter } from '@tanstack/react-router'

import { routeTree } from '@/routeTree.gen'
import { useAuthentication } from './contexts/authentication'
import { useSubscription } from './contexts/subscription'

const router = createRouter({
  basepath: '/awesome/registry',
  routeTree,
  context: {
    authentication: undefined!,
    subscription: undefined!,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export const App = () => {
  const authentication = useAuthentication()
  const subscription = useSubscription()

  return (
    <RouterProvider
      router={router}
      context={{ authentication, subscription }}
    />
  )
}
