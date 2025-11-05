import { Theme } from '@radix-ui/themes'

import type React from 'react'

import { useTheme } from '@/contexts/theme'

import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConvexReactClient } from 'convex/react'
import { AlertDialogProvider } from './components/confirmation-dialog'
import { AuthenticationContextProvider } from './contexts/authentication'
import { SubscriptionContextProvider } from './contexts/subscription'

export interface ProvidersProps {
  children: React.ReactNode
}

// export const client = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL)

export const convex = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL as string,
)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const { theme } = useTheme()

  return (
    <>
      <Theme
        // @ts-expect-error: allow custom accentColor value
        accentColor="black"
        hasBackground={false}
        radius="none"
        appearance={theme}
        panelBackground="solid"
        scaling="100%"
      >
        <QueryClientProvider client={queryClient}>
          <AlertDialogProvider>
            <ConvexAuthProvider client={convex}>
              <AuthenticationContextProvider blocking>
                <SubscriptionContextProvider blocking>
                  <>{children}</>
                </SubscriptionContextProvider>
              </AuthenticationContextProvider>
            </ConvexAuthProvider>
          </AlertDialogProvider>
        </QueryClientProvider>
      </Theme>
    </>
  )
}
