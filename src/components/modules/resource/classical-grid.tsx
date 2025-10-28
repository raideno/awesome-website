import { FileTextIcon } from '@radix-ui/react-icons'
import { Box, Button, Flex, Grid, Heading, Text } from '@radix-ui/themes'

import React from 'react'

import type { AwesomeListElement } from '@/types/awesome-list'

import { useFilter } from '@/context/filter'

import { ResourceCard } from '@/components/modules/resource/card'
import { ResourceCardContextMenu } from '@/components/modules/resource/card-context-menu'

export interface ClassicalResourceGridProps {
  filteredElements: Array<AwesomeListElement>
}

export const ClassicalResourceGrid: React.FC<ClassicalResourceGridProps> = ({
  filteredElements,
}) => {
  const { search, selectedTags, clearTags } = useFilter()

  return (
    <Box>
      {filteredElements.length > 0 && (
        <Grid
          columns={{
            initial: '1',
            md: '2',
            lg: '3',
          }}
          gap="6"
        >
          {filteredElements.map((element) => (
            <ResourceCardContextMenu key={element.name} element={element}>
              <ResourceCard element={element} />
            </ResourceCardContextMenu>
          ))}
        </Grid>
      )}

      {filteredElements.length === 0 &&
        (selectedTags.length > 0 || search !== '') && (
          <Flex
            direction={'column'}
            align={'center'}
            justify={'center'}
            gap={'4'}
            py={'12'}
          >
            <FileTextIcon height="48" width="48" />

            <Flex direction="column" align="center" gap="2">
              <Heading>No resource found</Heading>

              <Text as="p" color="gray">
                {selectedTags.length > 0 && search !== ''
                  ? 'No resources match your search and selected tags.'
                  : selectedTags.length > 0
                    ? 'Try selecting different tags or clearing your current selection.'
                    : 'No resources match your search query. Try different keywords.'}
              </Text>
            </Flex>

            {selectedTags.length > 0 && (
              <Button variant="classic" onClick={() => clearTags()}>
                Clear filters
              </Button>
            )}
          </Flex>
        )}

      {filteredElements.length === 0 &&
        selectedTags.length === 0 &&
        search === '' && (
          <Flex
            direction={'column'}
            align={'center'}
            justify={'center'}
            gap={'4'}
            py={'12'}
          >
            <FileTextIcon height="48" width="48" />

            <Flex direction="column" align="center" gap="2">
              <Heading>No resource uploaded</Heading>

              <Text as="p" color="gray">
                The awesome list's owner haven't uploaded any elements yet.
              </Text>
            </Flex>
          </Flex>
        )}
    </Box>
  )
}
