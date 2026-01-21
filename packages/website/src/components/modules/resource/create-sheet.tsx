import { useState } from 'react'

import { Heading, ScrollArea, Text } from '@radix-ui/themes'
import { AutoForm } from '@raideno/auto-form/ui'
import { AwesomeListElementSchema } from 'shared/types/awesome-list'
import { toast } from 'sonner'

import type React from 'react'
import type { z } from 'zod/v4'

import { Sheet } from '@/components/ui/sheet'

import { useList } from '@/contexts/list'

const generateUniqueId = (existingIds: Array<string>): string => {
  const existingIdsSet = new Set(existingIds)

  for (let i = 0; i < 100; i++) {
    const id = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, '0')
    if (!existingIdsSet.has(id)) {
      return id
    }
  }

  let maxId = 0
  for (const id of existingIds) {
    const numId = parseInt(id, 10)
    if (!isNaN(numId) && numId > maxId) {
      maxId = numId
    }
  }
  return (maxId + 1).toString().padStart(8, '0')
}

export interface ResourceCreateSheetProps {
  children?: React.ReactNode
  state?: { open: boolean; onOpenChange: (open: boolean) => void }
  defaults?: Partial<Omit<z.infer<typeof AwesomeListElementSchema>, 'id'>>
}

export const ResourceCreateSheet: React.FC<ResourceCreateSheetProps> = ({
  children,
  state,
  defaults = {},
}) => {
  const list = useList()

  const [internalOpen, setInternalOpen] = useState(false)

  const isOpen = state?.open ?? internalOpen
  const setOpen = state?.onOpenChange ?? setInternalOpen

  const handleSubmit = async (
    data: z.infer<typeof AwesomeListElementSchema>,
  ) => {
    try {
      await list.updateList({
        elements: [...list.content.new.elements, data],
      })
      setOpen(false)
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'Failed to create resource',
      )
    }
  }

  const handleError = () => {
    toast.error('Please fix the errors in the form before submitting.')
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const existingIds = list.content.new.elements.map((el) => el.id)
  const generatedId = generateUniqueId(existingIds)

  return (
    <Sheet.Root open={isOpen && list.canEdit} onOpenChange={setOpen}>
      {children && (
        <Sheet.Trigger disabled={!list.canEdit}>{children}</Sheet.Trigger>
      )}
      <Sheet.Content portal={false} side="right">
        <AutoForm.Root
          schema={AwesomeListElementSchema}
          defaultValues={{
            id: generatedId,
            name: '',
            description: '',
            notes: '',
            link: '',
            tags: [],
            group: '',
            ...defaults,
          }}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          onError={handleError}
          className="h-full grid grid-rows-[auto_1fr_auto] gap-4"
        >
          <Sheet.Header>
            <>
              <Sheet.Title className="sr-only">Create Resource</Sheet.Title>
              <Sheet.Description className="sr-only">
                Create a new resource. Fill in the details below and click
                "Create" to add it to your awesome list, or "Cancel" to discard.
              </Sheet.Description>
            </>
            <Heading>Create Resource</Heading>
            <Text>
              Create a new resource. Fill in the details below and click
              "Create" to add it to your awesome list, or "Cancel" to discard.
            </Text>
          </Sheet.Header>
          <ScrollArea scrollbars="vertical">
            <Sheet.Body>
              <AutoForm.Content
                fields={['name', 'description', 'link', 'tags', 'group']}
              />
            </Sheet.Body>
          </ScrollArea>
          <Sheet.Footer>
            <AutoForm.Actions className="flex flex-col gap-4 w-full items-center">
              <Sheet.Close asChild className="!w-full">
                <AutoForm.Action
                  type="reset"
                  className="!w-full"
                  variant="outline"
                >
                  Cancel
                </AutoForm.Action>
              </Sheet.Close>
              <AutoForm.Action
                type="submit"
                className="!w-full"
                variant="classic"
              >
                Create
              </AutoForm.Action>
            </AutoForm.Actions>
          </Sheet.Footer>
        </AutoForm.Root>
      </Sheet.Content>
    </Sheet.Root>
  )
}
