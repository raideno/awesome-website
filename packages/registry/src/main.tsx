import '@/css/global.css'
import '@/css/theme.dark.css'
import '@/css/theme.light.css'

import '@radix-ui/themes/styles.css'

import { RouterProvider, createRouter } from '@tanstack/react-router'
import React from 'react'
import ReactDOM from 'react-dom/client'

import { ThemeProvider } from '@/contexts/theme'
import { Providers } from '@/providers'
import { routeTree } from '@/routeTree.gen'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </ThemeProvider>
  </React.StrictMode>,
)
