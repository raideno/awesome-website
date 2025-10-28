import React from 'react'

import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Box, TextField } from '@radix-ui/themes'

import { useFilter } from '@/context/filter'

import { ChangesBanner } from '@/components/layout/changes-banner'
import { FloatingActionBar } from '@/components/layout/floating-action-bar'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { NewVersionBanner } from '@/components/layout/new-version-banner'
import { WorkflowStatusBanner } from '@/components/layout/workflow-status-banner'
import { TagFilterModal } from '@/components/modules/filter/modal'
import { FilterModalTrigger } from '@/components/modules/filter/modal-trigger'
import { ViewModeController } from '@/components/modules/misc/view-mode-controller'
import { ResourceGrid } from '@/components/modules/resource/grid'

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
              <style>
                {`
                  .controls {
                    display: grid;
                    grid-template-columns: 1fr;
                    grid-template-areas: "search 1fr filter viewmode";
                    gap: 0.5rem;
                    align-items: center;
                  }

                  .controls__search {
                    grid-area: search;
                  }

                  .controls__viewmode {
                    grid-area: viewmode;
                  }

                  .controls__filter {
                    grid-area: filter;
                  }

                  @media (max-width: 600px) {
                    .controls {
                      grid-template-columns: 1fr;
                      grid-template-areas:
                        "search search"
                        "filter viewmode";
                      gap: 0.5rem;
                    }
                  }
                `}
              </style>
              <div className="controls mb-4">
                <Box className="controls__search">
                  <TextField.Root
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search resources..."
                  >
                    <TextField.Slot side="left">
                      <MagnifyingGlassIcon />
                    </TextField.Slot>
                  </TextField.Root>
                </Box>
                <Box className="controls__filter">
                  <TagFilterModal>
                    <FilterModalTrigger className="w-full" />
                  </TagFilterModal>
                </Box>
                <Box className="controls__viewmode">
                  <ViewModeController />
                </Box>
              </div>

              <ResourceGrid />
            </Box>
          </Box>

          <Footer />
        </div>
      </div>
    </>
  )
}
