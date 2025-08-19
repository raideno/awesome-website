import { useState } from 'react'
import { Theme } from '@radix-ui/themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

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

  const [queryClient] = useState(() => new QueryClient())

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
        <QueryClientProvider client={queryClient}>
          <AlertDialogProvider>
            <ListProvider>
              <ViewModeProvider>
                <FilterProvider>{children}</FilterProvider>
              </ViewModeProvider>
            </ListProvider>
          </AlertDialogProvider>
        </QueryClientProvider>
      </Theme>
    </>
  )
}
