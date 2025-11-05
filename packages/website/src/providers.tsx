import { Theme } from '@radix-ui/themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConvexHttpClient } from 'convex/browser'
import { useState } from 'react'

import type React from 'react'

import { EditingProvider } from '@/contexts/editing'
import { FilterProvider } from '@/contexts/filter'
import { ListProvider } from '@/contexts/list'
import { MarkersProvider } from '@/contexts/markers'
import { useTheme } from '@/contexts/theme'

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
                <FilterProvider>
                  <MarkersProvider>
                    <Toaster />
                    <>{children}</>
                  </MarkersProvider>
                </FilterProvider>
              </ListProvider>
            </EditingProvider>
          </AlertDialogProvider>
        </QueryClientProvider>
      </Theme>
    </>
  )
}
