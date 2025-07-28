import React from 'react'

import { ContextMenu } from '@radix-ui/themes'

import type { Element } from '@/types/awesome-list'

import { AdminOnly } from '@/components/utils/admin-only'
import { ResourceEditSheet } from '@/components/modules/resource/edit-sheet'
import { useConfirm } from '@/components/utils/alert-dialog'
import { useList } from '@/context/list'

export interface ResourceCardContextMenuProps {
  children?: React.ReactNode
  element: Element
}

export const ResourceCardContextMenu: React.FC<
  ResourceCardContextMenuProps
> = ({ children, element }) => {
  const [open, setOpen] = React.useState(false)

  const list = useList()
  const confirm = useConfirm()

  const handleDeleteButtonClick = async () => {
    const confirmation = await confirm({
      title: 'Delete Resource',
      body: `Are you sure you want to delete the resource "${element.name}"? This action cannot be undone.`,
    })

    if (confirmation) {
      list.updateList({
        elements: list.content.new.elements.filter(
          (el) => el.name !== element.name,
        ),
      })
    }
  }

  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item>Copy</ContextMenu.Item>
          <ContextMenu.Item>Share</ContextMenu.Item>
          <AdminOnly>
            <ContextMenu.Separator />
            <ContextMenu.Item onClick={() => setOpen(true)}>
              Modify
            </ContextMenu.Item>
            <ContextMenu.Item
              color="red"
              onClick={() => handleDeleteButtonClick()}
            >
              Delete
            </ContextMenu.Item>
          </AdminOnly>
        </ContextMenu.Content>
      </ContextMenu.Root>

      <ResourceEditSheet
        element={element}
        state={{ open, onOpenChange: setOpen }}
      />
    </>
  )
}
