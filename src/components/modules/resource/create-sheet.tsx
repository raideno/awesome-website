import { useState } from 'react'

import { AutoForm } from '@raideno/auto-form/ui'

import type React from 'react'
import type { z } from 'zod/v4'

import { AwesomeListElementSchema } from '@/types/awesome-list'

import { Sheet } from '@/components/ui/sheet'

import { useList } from '@/context/list'

export interface ResourceCreateSheetProps {
  children?: React.ReactNode
  state?: { open: boolean; onOpenChange: (open: boolean) => void }
}

export const ResourceCreateSheet: React.FC<ResourceCreateSheetProps> = ({
  children,
  state,
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

  return (
    <Sheet.Root open={isOpen && list.canEdit} onOpenChange={setOpen}>
      {children && (
        <Sheet.Trigger disabled={!list.canEdit}>{children}</Sheet.Trigger>
      )}
      <Sheet.Content portal={false} side="right">
        <AutoForm.Root
          schema={AwesomeListElementSchema}
          defaultValues={{
            name: '',
            description: '',
            notes: '',
            links: [],
            tags: [],
          }}
          onSubmit={handleSubmit}
          onError={() => console.log('error!')}
          className="h-full grid grid-rows-[auto_1fr_auto] gap-4"
        >
          <Sheet.Header>
            <Sheet.Title>Create Resource</Sheet.Title>
            <Sheet.Description>
              Create a new resource. Fill in the details below and click
              "Create" to add it to your awesome list, or "Cancel" to discard.
            </Sheet.Description>
          </Sheet.Header>
          <Sheet.Body>
            <AutoForm.Content />
          </Sheet.Body>
          <Sheet.Footer>
            <AutoForm.Actions className="flex flex-col w-full items-center">
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
