import type React from 'react'
import type { z } from 'zod/v4'
import type { Element } from '@/types/awesome-list'

import { ElementSchema } from '@/types/awesome-list'

import { Sheet } from '@/components/ui/sheet'
import { AutoForm } from '@/components/modules/form/auto'
import { useList } from '@/context/list'

export interface ResourceEditSheetProps {
  children?: React.ReactNode
  element: Element
  state?: { open: boolean; onOpenChange: (open: boolean) => void }
}

export const ResourceEditSheet: React.FC<ResourceEditSheetProps> = ({
  children,
  element,
  state,
}) => {
  const list = useList()

  const handleSubmit = (data: z.infer<typeof ElementSchema>) => {
    list.updateList({
      elements: list.content.new.elements.map((el) =>
        el.name === element.name ? { ...el, ...data } : el,
      ),
    })
    state?.onOpenChange(false)
  }

  return (
    <Sheet.Root open={state?.open} onOpenChange={state?.onOpenChange}>
      {children && <Sheet.Trigger>{children}</Sheet.Trigger>}
      <Sheet.Content portal={false} side="right">
        <AutoForm.Root
          schema={ElementSchema}
          defaultValues={{
            ...element,
          }}
          onSubmit={handleSubmit}
          onError={() => console.log('errror!')}
          className="h-full grid grid-rows-[auto_1fr_auto] gap-4"
        >
          <Sheet.Header>
            <Sheet.Title>Edit Resource</Sheet.Title>
            <Sheet.Description>
              Edit the resource details below. Make changes and click "Save" to
              apply, or "Cancel" to discard.
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
                Save
              </AutoForm.Action>
            </AutoForm.Actions>
          </Sheet.Footer>
        </AutoForm.Root>
      </Sheet.Content>
    </Sheet.Root>
  )
}
