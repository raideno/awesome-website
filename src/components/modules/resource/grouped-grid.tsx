import {
  ChevronDownIcon,
  ChevronUpIcon,
  FileTextIcon,
} from '@radix-ui/react-icons'
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Text,
} from '@radix-ui/themes'

import React from 'react'

import type { AwesomeListElement } from '@/types/awesome-list'

import { useFilter } from '@/context/filter'
import { useList } from '@/context/list'

import { ResourceCard } from '@/components/modules/resource/card'
import { ResourceCardContextMenu } from '@/components/modules/resource/card-context-menu'

export interface GroupedResourceGridProps {}

const GroupContainer: React.FC<{
  groupName: string
  elements: Array<AwesomeListElement>
  color: string
}> = ({ groupName, elements, color }) => {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const displayedElements = isExpanded ? elements : elements.slice(0, 2)
  const hasMore = elements.length > 2

  return (
    <Card
      className="transition-all"
      style={{
        borderLeft: `4px solid ${color}`,
        backgroundColor: `${color}08`,
      }}
    >
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Flex align="center" gap="2">
            <Box
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: color,
              }}
            />
            <Heading size="5" weight="bold">
              {groupName}
            </Heading>
            <Badge color="gray" size="1">
              {elements.length} {elements.length === 1 ? 'item' : 'items'}
            </Badge>
          </Flex>
          {hasMore && (
            <Button
              variant="ghost"
              size="2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUpIcon width="16" height="16" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDownIcon width="16" height="16" />
                  Show {elements.length - 2} more
                </>
              )}
            </Button>
          )}
        </Flex>

        <Grid
          columns={{
            initial: '1',
            md: '2',
            lg: '3',
          }}
          gap="4"
        >
          {displayedElements.map((element) => (
            <ResourceCardContextMenu key={element.name} element={element}>
              <ResourceCard element={element} />
            </ResourceCardContextMenu>
          ))}
        </Grid>
      </Flex>
    </Card>
  )
}

const getGroupColor = (index: number): string => {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ]
  return colors[index % colors.length]
}

export const GroupedResourceGrid: React.FC<GroupedResourceGridProps> = () => {
  const { search, selectedTags, tagsFilterOperator, clearTags } = useFilter()
  const list = useList()

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

  const groupedElements = React.useMemo(() => {
    const groups = new Map<string, Array<AwesomeListElement>>()

    filteredElements.forEach((element) => {
      const groupName = element.group || 'Ungrouped'
      if (!groups.has(groupName)) {
        groups.set(groupName, [])
      }
      groups.get(groupName)!.push(element)
    })

    return Array.from(groups.entries()).sort((a, b) => {
      // Sort "Ungrouped" to the end
      if (a[0] === 'Ungrouped') return 1
      if (b[0] === 'Ungrouped') return -1
      return a[0].localeCompare(b[0])
    })
  }, [filteredElements])

  return (
    <Box>
      {groupedElements.length > 0 ? (
        <Flex direction="column" gap="3">
          {groupedElements.map(([groupName, elements], index) => (
            <GroupContainer
              key={groupName}
              groupName={groupName}
              elements={elements}
              color={getGroupColor(index)}
            />
          ))}
        </Flex>
      ) : (
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="4"
          py="12"
        >
          <FileTextIcon height="48" width="48" />

          <Flex direction="column" align="center" gap="2">
            <Heading>
              {selectedTags.length > 0 || search !== ''
                ? 'No resource found'
                : 'No resource uploaded'}
            </Heading>

            <Text as="p" color="gray">
              {selectedTags.length > 0 && search !== ''
                ? 'No resources match your search and selected tags.'
                : selectedTags.length > 0
                  ? 'Try selecting different tags or clearing your current selection.'
                  : search !== ''
                    ? 'No resources match your search query. Try different keywords.'
                    : "The awesome list's owner haven't uploaded any elements yet."}
            </Text>
          </Flex>

          {selectedTags.length > 0 && (
            <Button variant="classic" onClick={() => clearTags()}>
              Clear filters
            </Button>
          )}
        </Flex>
      )}
    </Box>
  )
}
