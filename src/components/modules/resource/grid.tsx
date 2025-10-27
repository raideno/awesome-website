import { FileTextIcon } from '@radix-ui/react-icons'
import { Box, Button, Flex, Grid, Heading, Text } from '@radix-ui/themes'

import React from 'react'

import { useViewMode } from '@/context/view-mode'
import { useFilter } from '@/context/filter'

import { ResourceCard } from '@/components/modules/resource/card'
import { ResourceCardContextMenu } from '@/components/modules/resource/card-context-menu'
import { GroupedResourceGrid } from '@/components/modules/resource/grouped-grid'
import { useList } from '@/context/list'

export interface ResourceGridProps {}

export const ResourceGrid: React.FC<ResourceGridProps> = () => {
  const { search, selectedTags, tagsFilterOperator, clearTags } = useFilter()

  const list = useList()

  const { mode } = useViewMode()

  // If mode is 'group', use the grouped grid component
  if (mode === 'group') {
    return <GroupedResourceGrid />
  }

  const filteredElements = React.useMemo(() => {
    let elements = list.content.new.elements

    if (selectedTags.length > 0) {
      elements = elements.filter((element) =>
        tagsFilterOperator === 'and'
          ? selectedTags.every((tag) => element.tags.includes(tag))
          : selectedTags.some((tag) => element.tags.includes(tag)),
      )
    }

    if (search.trim() !== '') {
      const searchWords = search
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 0)

      elements = elements.filter((element) => {
        const searchable = [
          element.name.toLowerCase(),
          element.description.toLowerCase(),
          ...element.tags.map((tag) => tag.toLowerCase()),
        ]

        return searchWords.every((word) =>
          searchable.some((field) => field.includes(word)),
        )
      })
    }

    return elements
  }, [search, list.content.new.elements, selectedTags, tagsFilterOperator])

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
