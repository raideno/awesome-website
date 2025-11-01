import React from 'react'

import { ContextMenu } from '@radix-ui/themes'

import type { AwesomeListElement } from '@/types/awesome-list'

import { useList } from '@/contexts/list'
import { useEditing } from '@/contexts/editing'

import { AdminOnly } from '@/components/utils/admin-only'
import { useConfirm } from '@/components/utils/alert-dialog'
import { ResourceEditSheet } from '@/components/modules/resource/edit-sheet'

export interface ResourceCardContextMenuProps {
  children?: React.ReactNode
  element: AwesomeListElement
}

export const ResourceCardContextMenu: React.FC<
  ResourceCardContextMenuProps
> = ({ children, element }) => {
  const [open, setOpen] = React.useState(false)
  const list = useList()
  const confirm = useConfirm()
  const { editingEnabled } = useEditing()

  const handleDeleteButtonClick = async () => {
    if (!list.canEdit) {
      alert(
        'Cannot edit while website is being updated. Please wait for the build to complete.',
      )
      return
    }

    const confirmation = await confirm({
      title: 'Delete Resource',
      body: `Are you sure you want to delete the resource "${element.name}"? This action cannot be undone.`,
    })

    if (confirmation) {
      try {
        await list.updateList({
          elements: list.content.new.elements.filter(
            (el) => el.name !== element.name,
          ),
        })
      } catch (error) {
        alert(
          error instanceof Error ? error.message : 'Failed to delete resource',
        )
      }
    }
  }

  const handleCopyButtonClick = async () => {
    if (!element.link) {
      alert('No link available to copy')
      return
    }

    try {
      await navigator.clipboard.writeText(element.link)

      alert('Copied link to clipboard')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to copy link')
    }
  }

  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item onClick={() => handleCopyButtonClick()}>
            Copy
          </ContextMenu.Item>

          {/* Admin-only menu items are also gated by the editing toggle via AdminOnly */}
          {editingEnabled && (
            <AdminOnly>
              <ContextMenu.Separator />
              <ContextMenu.Item
                disabled={!list.canEdit}
                onClick={() => setOpen(true)}
              >
                Modify
              </ContextMenu.Item>
              <ContextMenu.Item
                color="red"
                disabled={!list.canEdit}
                onClick={() => handleDeleteButtonClick()}
              >
                Delete
              </ContextMenu.Item>
            </AdminOnly>
          )}
        </ContextMenu.Content>
      </ContextMenu.Root>

      {editingEnabled && (
        <ResourceEditSheet
          element={element}
          state={{ open, onOpenChange: setOpen }}
        />
      )}
    </>
  )
}
