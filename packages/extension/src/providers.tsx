import { Theme } from '@radix-ui/themes'
import { useTheme } from 'shared/contexts/theme'

import type React from 'react'

export interface ProvidersProps {
  children: React.ReactNode
}

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
            <>{children}</>
      </Theme>
    </>
  )
}
