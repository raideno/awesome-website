import React from 'react'
import { Badge, Box, Card, Flex, Text } from '@radix-ui/themes'
import type { AwesomeList, AwesomeListElement } from '@/types/awesome-list'

interface ChangesViewProps {
  oldData: AwesomeList
  newData: AwesomeList
}

interface ElementChange {
  type: 'added' | 'removed' | 'modified'
  element: AwesomeListElement
  oldElement?: AwesomeListElement
  changes?: Array<string>
}

interface MetadataChange {
  field: string
  oldValue: any
  newValue: any
}

const ChangesView: React.FC<ChangesViewProps> = ({ oldData, newData }) => {
  const metadataChanges = React.useMemo((): Array<MetadataChange> => {
    const changes: Array<MetadataChange> = []
    const metadataFields = [
      'title',
      'description',
      'author',
      'thumbnail',
      'links',
    ]

    metadataFields.forEach((field) => {
      const oldValue = oldData[field as keyof AwesomeList]
      const newValue = newData[field as keyof AwesomeList]

      if (field === 'links') {
        const oldLinks = oldValue
        const newLinks = newValue
        if (JSON.stringify(oldLinks) !== JSON.stringify(newLinks)) {
          changes.push({ field, oldValue: oldLinks, newValue: newLinks })
        }
      } else if (oldValue !== newValue) {
        changes.push({ field, oldValue, newValue })
      }
    })

    return changes
  }, [oldData, newData])

  const elementChanges = React.useMemo((): Array<ElementChange> => {
    const changes: Array<ElementChange> = []
    const oldElements = oldData.elements
    const newElements = newData.elements

    const oldElementsMap = new Map(oldElements.map((el) => [el.name, el]))
    const newElementsMap = new Map(newElements.map((el) => [el.name, el]))

    newElements.forEach((newEl) => {
      if (!oldElementsMap.has(newEl.name)) {
        changes.push({ type: 'added', element: newEl })
      }
    })

    oldElements.forEach((oldEl) => {
      if (!newElementsMap.has(oldEl.name)) {
        changes.push({ type: 'removed', element: oldEl })
      }
    })

    oldElements.forEach((oldEl) => {
      const newEl = newElementsMap.get(oldEl.name)
      if (newEl) {
        const fieldChanges: Array<string> = []

        if (oldEl.description !== newEl.description) {
          fieldChanges.push('description')
        }
        if (JSON.stringify(oldEl.urls) !== JSON.stringify(newEl.urls)) {
          fieldChanges.push('urls')
        }
        if (JSON.stringify(oldEl.tags) !== JSON.stringify(newEl.tags)) {
          fieldChanges.push('tags')
        }

        if (fieldChanges.length > 0) {
          changes.push({
            type: 'modified',
            element: newEl,
            oldElement: oldEl,
            changes: fieldChanges,
          })
        }
      }
    })

    return changes
  }, [oldData.elements, newData.elements])

  const renderArrayDiff = (
    oldArray: Array<string>,
    newArray: Array<string>,
    label: string,
  ) => {
    const added = newArray.filter((item) => !oldArray.includes(item))
    const removed = oldArray.filter((item) => !newArray.includes(item))

    return (
      <Box>
        {added.length > 0 && (
          <Flex gap="1" align="center" wrap="wrap" mb="1">
            <Text size="1" color="green">
              Added {label}:
            </Text>
            {added.map((item, idx) => (
              <Badge key={idx} color="green" size="1">
                {item}
              </Badge>
            ))}
          </Flex>
        )}
        {removed.length > 0 && (
          <Flex gap="1" align="center" wrap="wrap">
            <Text size="1" color="red">
              Removed {label}:
            </Text>
            {removed.map((item, idx) => (
              <Badge key={idx} color="red" size="1">
                {item}
              </Badge>
            ))}
          </Flex>
        )}
      </Box>
    )
  }

  if (metadataChanges.length === 0 && elementChanges.length === 0) {
    return (
      <Box p="4">
        <Text color="gray">No changes detected</Text>
      </Box>
    )
  }

  return (
    <Box>
      {metadataChanges.length > 0 && (
        <Box mb="4">
          <Text weight="bold" mb="2">
            Metadata Changes
          </Text>
          {metadataChanges.map((change, idx) => (
            <Card key={idx}>
              <Flex direction={'column'}>
                <Text weight="medium" mb="1">
                  {change.field}
                </Text>
                {change.field === 'links' ? (
                  renderArrayDiff(
                    change.oldValue || [],
                    change.newValue || [],
                    'links',
                  )
                ) : (
                  <Box>
                    <Text size="1" color="red">
                      - {change.oldValue || '(empty)'}
                    </Text>
                    <Text size="1" color="green">
                      + {change.newValue || '(empty)'}
                    </Text>
                  </Box>
                )}
              </Flex>
            </Card>
          ))}
        </Box>
      )}

      {elementChanges.length > 0 && (
        <Flex direction="column" gap="2">
          <Text weight="bold">Element Changes</Text>
          {elementChanges.map((change, idx) => (
            <Card key={idx}>
              <Box>
                <Flex direction={'column'} gap="2">
                  <Box>
                    <Badge
                      color={
                        change.type === 'added'
                          ? 'green'
                          : change.type === 'removed'
                            ? 'red'
                            : 'blue'
                      }
                    >
                      {change.type}
                    </Badge>
                  </Box>
                  <Text weight="medium">{change.element.name}</Text>
                </Flex>

                {change.type === 'modified' &&
                  change.changes &&
                  change.oldElement && (
                    <Box>
                      {change.changes.includes('description') && (
                        <Box mb="2">
                          <Text size="1" weight="medium">
                            Description:
                          </Text>
                          <Text size="1" color="red">
                            - {change.oldElement.description}
                          </Text>
                          <Text size="1" color="green">
                            + {change.element.description}
                          </Text>
                        </Box>
                      )}
                      {change.changes.includes('urls') && (
                        <Box mb="2">
                          <Text size="1" weight="medium">
                            URLs:
                          </Text>
                          {renderArrayDiff(
                            change.oldElement.urls,
                            change.element.urls,
                            'URLs',
                          )}
                        </Box>
                      )}
                      {change.changes.includes('tags') && (
                        <Box mb="2">
                          <Text size="1" weight="medium">
                            Tags:
                          </Text>
                          {renderArrayDiff(
                            change.oldElement.tags,
                            change.element.tags,
                            'tags',
                          )}
                        </Box>
                      )}
                    </Box>
                  )}

                {change.type === 'added' && (
                  <Box>
                    <Text size="1">{change.element.description}</Text>
                    {change.element.tags.length > 0 && (
                      <Flex gap="1" mt="1" wrap="wrap">
                        {change.element.tags.map((tag, tagIdx) => (
                          <Badge key={tagIdx} color="green" size="1">
                            {tag}
                          </Badge>
                        ))}
                      </Flex>
                    )}
                  </Box>
                )}

                {change.type === 'removed' && (
                  <Box>
                    <Text size="1" color="gray">
                      {change.element.description}
                    </Text>
                    {change.element.tags.length > 0 && (
                      <Flex gap="1" mt="1" wrap="wrap">
                        {change.element.tags.map((tag, tagIdx) => (
                          <Badge key={tagIdx} color="red" size="1">
                            {tag}
                          </Badge>
                        ))}
                      </Flex>
                    )}
                  </Box>
                )}
              </Box>
            </Card>
          ))}
        </Flex>
      )}
    </Box>
  )
}

export default ChangesView
