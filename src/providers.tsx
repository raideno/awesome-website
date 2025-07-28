import { Theme } from '@radix-ui/themes'

import type React from 'react'

import { ListProvider } from '@/context/list'
import { ViewModeProvider } from '@/context/view-mode'
import { TagFilterProvider } from '@/context/tag-filter'

import { AlertDialogProvider } from '@/components/utils/alert-dialog'

export interface ProvidersProps {
  children: React.ReactNode
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <>
      <Theme
        // @ts-ignore: allow custom accentColor value
        accentColor="black"
        hasBackground={false}
        radius="none"
        appearance="light"
        panelBackground="solid"
        scaling="100%"
      >
        <AlertDialogProvider>
          <ListProvider>
            <ViewModeProvider>
              <TagFilterProvider>{children}</TagFilterProvider>
            </ViewModeProvider>
          </ListProvider>
        </AlertDialogProvider>
      </Theme>
    </>
  )
}
