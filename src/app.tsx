import React from 'react'

import { Pencil1Icon } from '@radix-ui/react-icons'
import { Box, Card, Flex, Heading, IconButton } from '@radix-ui/themes'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { TagFilterModal } from '@/components/modules/filter/modal'
import { ResourceGrid } from '@/components/modules/resource/grid'
import { FilterModalTrigger } from '@/components/modules/filter/modal-trigger'
import { ViewModeController } from '@/components/modules/misc/view-mode-controller'
import { SettingsButton } from '@/components/layout/settings-button'
import { ScrollToButton } from '@/components/layout/scroll-to-button'
import { ThemeSwitchButton } from '@/components/layout/theme-switch-button'
import { ListMetadataEditSheet } from '@/components/modules/misc/list-metadata-edit-sheet'

export interface AppProps {}

export const App: React.FC<AppProps> = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <div className="w-full min-h-screen max-w-6xl mx-auto p-6 relative">
        <div className="w-full min-h-screen grid grid-rows-[auto_1fr_auto]">
          <Header />

          <Box>
            <Flex
              direction={'row'}
              align={'center'}
              justify={{ initial: 'center', sm: 'end' }}
              className="w-full fixed bottom-8 right-8 z-10"
            >
              <Card>
                <Flex direction={{ initial: 'row', sm: 'column' }} gap={'2'}>
                  <ScrollToButton to="top" />
                  <ScrollToButton to="bottom" />
                  <SettingsButton />
                  <IconButton variant="classic" onClick={() => setOpen(true)}>
                    <Pencil1Icon />
                  </IconButton>
                  <ThemeSwitchButton />
                </Flex>
              </Card>
            </Flex>

            <Box>
              <Flex
                direction={'row'}
                align={'center'}
                justify={'between'}
                mb={'3'}
              >
                <Heading size="6">Awesome List</Heading>
                <Flex align={'center'} gap={'2'}>
                  <ViewModeController />
                  <TagFilterModal>
                    <FilterModalTrigger />
                  </TagFilterModal>
                </Flex>
              </Flex>

              <ResourceGrid />
            </Box>
          </Box>

          <Footer />
        </div>
      </div>
      <ListMetadataEditSheet state={{ open: open, onOpenChange: setOpen }} />
    </>
  )
}
