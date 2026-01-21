import { Theme } from '@radix-ui/themes'
import { useTheme } from 'shared/contexts/theme'

import type React from 'react'

import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { ConvexReactClient } from 'convex/react'
import { AuthenticationContextProvider } from './contexts/authentication'

export interface ProvidersProps {
  children: React.ReactNode
}

export const convex = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL as string,
)

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
        <ConvexAuthProvider client={convex}>
          <AuthenticationContextProvider>
            <>{children}</>
          </AuthenticationContextProvider>
        </ConvexAuthProvider>
      </Theme>
    </>
  )
}
