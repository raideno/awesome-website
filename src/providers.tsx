import { Theme } from '@radix-ui/themes'

import type React from 'react'

import { useTheme } from '@/context/theme'
import { ListProvider } from '@/context/list'
import { FilterProvider } from '@/context/filter'
import { ViewModeProvider } from '@/context/view-mode'

import { AlertDialogProvider } from '@/components/utils/alert-dialog'

export interface ProvidersProps {
  children: React.ReactNode
}

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
        <AlertDialogProvider>
          <ListProvider>
            <ViewModeProvider>
              <FilterProvider>{children}</FilterProvider>
            </ViewModeProvider>
          </ListProvider>
        </AlertDialogProvider>
      </Theme>
    </>
  )
}
