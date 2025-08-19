import React from 'react'

import { MagnifyingGlassIcon, Pencil1Icon } from '@radix-ui/react-icons'
import {
  Box,
  Card,
  Flex,
  Heading,
  IconButton,
  TextField,
} from '@radix-ui/themes'

import { useList } from '@/context/list'
import { useFilter } from '@/context/filter'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ChangesBanner } from '@/components/layout/changes-banner'
import { WorkflowStatusBanner } from '@/components/layout/workflow-status-banner'
import { TagFilterModal } from '@/components/modules/filter/modal'
import { ResourceGrid } from '@/components/modules/resource/grid'
import { FilterModalTrigger } from '@/components/modules/filter/modal-trigger'
import { ViewModeController } from '@/components/modules/misc/view-mode-controller'
import { ScrollToButton } from '@/components/layout/scroll-to-button'
import { ThemeSwitchButton } from '@/components/layout/theme-switch-button'
import { ListMetadataEditSheet } from '@/components/modules/misc/list-metadata-edit-sheet'

export interface AppProps {}

export const App: React.FC<AppProps> = () => {
  const [open, setOpen] = React.useState(false)
  const list = useList()
  const { search, setSearch } = useFilter()

  return (
    <>
      <WorkflowStatusBanner />
      <ChangesBanner />

      <div className="w-full min-h-screen max-w-6xl mx-auto p-6 relative">
        <div className="w-full min-h-screen grid grid-rows-[auto_1fr_auto]">
          <Header />

          <Box>
            <Flex
              direction={'row'}
              align={'center'}
              justify={{ initial: 'center', sm: 'end' }}
              bottom={{ initial: '4', sm: '8' }}
              right={{ initial: '0', sm: '8' }}
              position={'fixed'}
              className="w-full z-10"
            >
              <Card>
                <Flex direction={{ initial: 'row', sm: 'column' }} gap={'2'}>
                  <ScrollToButton to="top" />
                  <ScrollToButton to="bottom" />
                  <IconButton
                    variant="classic"
                    disabled={!list.canEdit}
                    onClick={() => setOpen(true)}
                  >
                    <Pencil1Icon />
                  </IconButton>
                  <ThemeSwitchButton />
                </Flex>
              </Card>
            </Flex>

            <Box>
              <Flex direction={'column'} gap={'2'} className="w-full mb-3">
                <Flex
                  className="w-full"
                  direction={'row'}
                  justify={'between'}
                  gap={'3'}
                >
                  <Heading size={{ initial: '5', sm: '6' }}>
                    Awesome List
                  </Heading>
                  <Box>
                    <ViewModeController />
                  </Box>
                </Flex>
                <Flex
                  className="w-full"
                  direction={'row'}
                  justify={'between'}
                  gap={'3'}
                >
                  <TextField.Root
                    className="w-full max-w-96"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search resources..."
                  >
                    <TextField.Slot side="left">
                      <MagnifyingGlassIcon />
                    </TextField.Slot>
                  </TextField.Root>
                  <Box>
                    <TagFilterModal>
                      <FilterModalTrigger />
                    </TagFilterModal>
                  </Box>
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
