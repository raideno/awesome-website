import { Theme } from '@radix-ui/themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

import type React from 'react'

import { EditingProvider } from '@/context/editing'
import { FilterProvider } from '@/context/filter'
import { ListProvider } from '@/context/list'
import { useTheme } from '@/context/theme'
import { ViewModeProvider } from '@/context/view-mode'

import { Toaster } from '@/components/ui/sooner'
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
            <EditingProvider>
              <ListProvider>
                <ViewModeProvider>
                  <FilterProvider>
                    <Toaster />
                    <>{children}</>
                  </FilterProvider>
                </ViewModeProvider>
              </ListProvider>
            </EditingProvider>
          </AlertDialogProvider>
        </QueryClientProvider>
      </Theme>
    </>
  )
}
