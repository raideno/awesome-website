import { Box, Flex, Heading } from '@radix-ui/themes'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { TagFilterModal } from '@/components/filter-modal'
import { ResourceGrid } from '@/components/resource-grid'
import { FilterModalTrigger } from '@/components/filter-modal-trigger'
import { ViewModeController } from '@/components/view-mode-controller'

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

      <Footer />
    </div>
  )
}
