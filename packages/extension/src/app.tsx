import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from '@tanstack/react-router'

import { routeTree } from '@/routeTree.gen'

const router = createRouter({
  routeTree,
  history: createHashHistory(),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export const App = () => {
  return <RouterProvider router={router} />
}

export default App
