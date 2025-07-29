import { FileTextIcon } from '@radix-ui/react-icons'
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Table,
  Text,
} from '@radix-ui/themes'

import React from 'react'

import { useViewMode } from '@/context/view-mode'
import { useFilter } from '@/context/filter'

import { ResourceCard } from '@/components/modules/resource/card'
import { ResourceCardContextMenu } from '@/components/modules/resource/card-context-menu'
import { useList } from '@/context/list'

export interface ResourceGridProps {}

export const ResourceGrid: React.FC<ResourceGridProps> = () => {
  const { search, selectedTags, tagsFilterOperator, clearTags } = useFilter()

  const list = useList()

  const { mode } = useViewMode()

  const filteredElements = React.useMemo(() => {
    if (selectedTags.length === 0 && search === '') {
      return list.content.new.elements
    }

    const searchWords = search
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0)

    return list.content.new.elements
      .filter((element) =>
        tagsFilterOperator === 'and'
          ? selectedTags.every((tag) => element.tags.includes(tag))
          : selectedTags.some((tag) => element.tags.includes(tag)),
      )
      .filter((element) => {
        if (searchWords.length === 0) return true

        const searchable = [
          element.name.toLowerCase(),
          element.description.toLowerCase(),
          ...element.tags.map((tag) => tag.toLowerCase()),
        ]

        return searchWords.every((word) =>
          searchable.some((field) => field.includes(word)),
        )
      })
  }, [search, list.content.new.elements, selectedTags, tagsFilterOperator])

  return (
    <Box>
      {filteredElements.length > 0 &&
        (mode === 'table' ? (
          <Card className="!p-0">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Tags</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredElements.map((element) => (
                  <Table.Row key={element.name}>
                    <Table.Cell>{element.name}</Table.Cell>
                    <Table.Cell>{element.description}</Table.Cell>
                    <Table.Cell>
                      <Flex gap="1" wrap="wrap">
                        {element.tags.map((tag) => (
                          <Badge key={tag} size="1">
                            {tag}
                          </Badge>
                        ))}
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card>
        ) : (
          <Grid
            columns={{
              initial: '1',
              md: mode === 'minimal' ? '3' : '2',
              lg: mode === 'minimal' ? '4' : '3',
            }}
            gap={mode === 'minimal' ? '4' : '6'}
          >
            {filteredElements.map((element) => (
              <ResourceCardContextMenu key={element.name} element={element}>
                <ResourceCard element={element} />
              </ResourceCardContextMenu>
            ))}
          </Grid>
        ))}

      {filteredElements.length === 0 && selectedTags.length > 0 && (
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
              Try selecting different tags or clearing your current selection.
            </Text>
          </Flex>

          <Button variant="classic" onClick={() => clearTags()}>
            Clear filters
          </Button>
        </Flex>
      )}

      {filteredElements.length === 0 && selectedTags.length === 0 && (
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
