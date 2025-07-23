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

import { getList } from '@/data/awesome-list'
import { useTagFilter } from '@/context/tag-filter'
import { ResourceCard } from '@/components/resource-card'
import { useViewMode } from '@/context/view-mode'

export interface ResourceGridProps {}

export const ResourceGrid: React.FC<ResourceGridProps> = () => {
  const { selectedTags, clearTags } = useTagFilter()

  const list = getList()

  const { mode } = useViewMode()

  const filteredElements =
    selectedTags.length === 0
      ? list.elements
      : list.elements.filter((element) =>
          selectedTags.some((tag) => element.tags.includes(tag)),
        )

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
              <ResourceCard element={element} key={element.name} />
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
