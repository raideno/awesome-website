import { FileTextIcon, Pencil1Icon, PlusIcon } from '@radix-ui/react-icons'
import {
  AlertDialog,
  Box,
  Button,
  Card,
  ContextMenu,
  Flex,
  Grid,
  Heading,
  Text,
} from '@radix-ui/themes'
import { AutoForm } from '@raideno/auto-form/ui'

import React from 'react'
import { toast } from 'sonner'
import { z } from 'zod/v4'

import type { AwesomeListElement } from '@/types/awesome-list'

import { useFilter } from '@/contexts/filter'
import { useEditing } from '@/contexts/editing'
import { useList } from '@/contexts/list'

import { ResourceCard } from '@/components/modules/resource/card'
import { ResourceCardContextMenu } from '@/components/modules/resource/card-context-menu'
import { ResourceCreateSheet } from '@/components/modules/resource/create-sheet'
import { AdminOnly } from '@/components/utils/admin-only'

export interface GroupedResourceGridProps {
  filteredElements: Array<AwesomeListElement>
}

const RenameSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(64),
})

const GroupContainer: React.FC<{
  groupName: string
  elements: Array<AwesomeListElement>
  color: string
}> = ({ groupName, elements, color }) => {
  const [createSheetOpen, setCreateSheetOpen] = React.useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = React.useState(false)
  const { editingEnabled } = useEditing()
  const list = useList()

  const handleRenameGroup = async (data: z.infer<typeof RenameSchema>) => {
    if (data.name === groupName) {
      setRenameDialogOpen(false)
      return
    }

    try {
      await list.updateList({
        elements: list.content.new.elements.map((el) => {
          const elementGroup = el.group || 'Ungrouped'
          const belongsToGroup = elementGroup === groupName

          return belongsToGroup ? { ...el, group: data.name } : el
        }),
      })
      setRenameDialogOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to rename group',
      )
    }
  }

  const handleRenameError = () => {
    toast.error('Please fix the errors in the form before submitting.')
  }

  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger disabled={!editingEnabled}>
          <Card
            className="transition-all contain-none"
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
                </Flex>
              </Flex>

              <Grid
                columns={{
                  initial: '1',
                  md: '2',
                  lg: '3',
                }}
                gap="4"
              >
                {elements.map((element) => (
                  <ResourceCardContextMenu key={element.name} element={element}>
                    <ResourceCard element={element} groupColor={color} />
                  </ResourceCardContextMenu>
                ))}
              </Grid>
            </Flex>
          </Card>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          {editingEnabled && (
            <AdminOnly>
              <ContextMenu.Item onClick={() => setCreateSheetOpen(true)}>
                <Flex align="center" gap="2">
                  <PlusIcon />
                  Create Item
                </Flex>
              </ContextMenu.Item>
              <ContextMenu.Item onClick={() => setRenameDialogOpen(true)}>
                <Flex align="center" gap="2">
                  <Pencil1Icon />
                  Rename Group
                </Flex>
              </ContextMenu.Item>
            </AdminOnly>
          )}
        </ContextMenu.Content>
      </ContextMenu.Root>

      {editingEnabled && (
        <>
          <ResourceCreateSheet
            state={{ open: createSheetOpen, onOpenChange: setCreateSheetOpen }}
            defaults={
              groupName !== 'Ungrouped' ? { group: groupName } : undefined
            }
          />

          <AlertDialog.Root
            open={renameDialogOpen}
            onOpenChange={setRenameDialogOpen}
          >
            <AlertDialog.Content>
              <AutoForm.Root
                schema={RenameSchema}
                defaultValues={{ name: groupName }}
                onSubmit={handleRenameGroup}
                onError={handleRenameError}
              >
                <>
                  <AlertDialog.Title className="sr-only">
                    Rename Group
                  </AlertDialog.Title>
                  <AlertDialog.Description className="sr-only">
                    Enter a new name for the group "{groupName}". All{' '}
                    {elements.length} item{elements.length !== 1 ? 's' : ''} in
                    this group will be updated.
                  </AlertDialog.Description>
                </>
                <Heading>Rename Group</Heading>
                <Text>
                  Enter a new name for the group "{groupName}". All{' '}
                  {elements.length} item{elements.length !== 1 ? 's' : ''} in
                  this group will be updated.
                </Text>

                <Flex direction="column" gap="3" mt="4">
                  <AutoForm.Content fields={['name']} />
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                  <AlertDialog.Cancel>
                    <Button variant="soft" color="gray" type="button">
                      Cancel
                    </Button>
                  </AlertDialog.Cancel>
                  <AutoForm.Action type="submit" variant="classic">
                    Rename
                  </AutoForm.Action>
                </Flex>
              </AutoForm.Root>
            </AlertDialog.Content>
          </AlertDialog.Root>
        </>
      )}
    </>
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

export const GroupedResourceGrid: React.FC<GroupedResourceGridProps> = ({
  filteredElements,
}) => {
  const { search, selectedTags, clearTags } = useFilter()

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
      // Sort "Ungrouped" to the start
      if (a[0] === 'Ungrouped') return -1
      if (b[0] === 'Ungrouped') return 1
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
