import React from 'react'

import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Box, Flex, Heading, TextField } from '@radix-ui/themes'

import { useFilter } from '@/context/filter'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ResourceGrid } from '@/components/modules/resource/grid'
import { TagFilterModal } from '@/components/modules/filter/modal'
import { ChangesBanner } from '@/components/layout/changes-banner'
import { NewVersionBanner } from '@/components/layout/new-version-banner'
import { FloatingActionBar } from '@/components/layout/floating-action-bar'
import { FilterModalTrigger } from '@/components/modules/filter/modal-trigger'
import { WorkflowStatusBanner } from '@/components/layout/workflow-status-banner'
import { ViewModeController } from '@/components/modules/misc/view-mode-controller'

export interface AppProps {}

export const App: React.FC<AppProps> = () => {
  const { search, setSearch } = useFilter()

  return (
    <>
      <Box className="top-0 sticky z-50">
        <WorkflowStatusBanner />
        <NewVersionBanner />
        <ChangesBanner />
      </Box>

      <div className="min-h-screen max-w-6xl mx-auto relative px-4 sm:px-6 lg:px-8">
        <div className="w-full py-6 min-h-screen grid grid-rows-[auto_1fr_auto]">
          <Header />

          <Box>
            <FloatingActionBar />

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
    </>
  )
}
