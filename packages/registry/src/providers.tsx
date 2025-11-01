import { Theme } from '@radix-ui/themes'

import type React from 'react'

import { useTheme } from '@/contexts/theme'

import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { ConvexReactClient } from 'convex/react'

export interface ProvidersProps {
  children: React.ReactNode
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const { theme } = useTheme()

  return (
    <>
      <Theme
        // @ts-ignore: allow custom accentColor value
        accentColor="black"
        hasBackground={false}
        radius="none"
        appearance={theme}
        panelBackground="solid"
        scaling="100%"
      >
        <ConvexAuthProvider client={convex}>
          <>{children}</>
        </ConvexAuthProvider>
      </Theme>
    </>
  )
}
