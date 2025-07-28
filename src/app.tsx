import { Box, Flex, Heading } from '@radix-ui/themes'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { TagFilterModal } from '@/components/modules/filter/modal'
import { ResourceGrid } from '@/components/modules/resource/grid'
import { FilterModalTrigger } from '@/components/modules/filter/modal-trigger'
import { ViewModeController } from '@/components/modules/misc/view-mode-controller'
import { Settings } from '@/components/layout/settings'

export const App = () => {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 relative">
      <Header />

      <Box>
        <Flex direction={'row'} align={'center'} justify={'between'} mb={'3'}>
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

      <Settings />

      <Footer />
    </div>
  )
}
