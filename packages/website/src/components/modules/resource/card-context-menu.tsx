import React from 'react'

import {
  AlertDialog,
  Button,
  ContextMenu,
  Flex,
  Heading,
  Text,
} from '@radix-ui/themes'
import { AutoForm } from '@raideno/auto-form/ui'
import { toast } from 'sonner'
import { z } from 'zod/v4'

import type { AwesomeListElement } from '@/types/awesome-list'
import { MAX_TAGS } from '@/types/awesome-list'

import { useList } from '@/contexts/list'
import { useEditing } from '@/contexts/editing'

import { AdminOnly } from '@/components/utils/admin-only'
import { useConfirm } from '@/components/utils/alert-dialog'
import { ResourceEditSheet } from '@/components/modules/resource/edit-sheet'

const AddTagSchema = z.object({
  tag: z.string().min(1, 'Tag is required').max(32),
})

export interface ResourceCardContextMenuProps {
  children?: React.ReactNode
  element: AwesomeListElement
}

export const ResourceCardContextMenu: React.FC<
  ResourceCardContextMenuProps
> = ({ children, element }) => {
  const [open, setOpen] = React.useState(false)
  const [addTagDialogOpen, setAddTagDialogOpen] = React.useState(false)
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

  const handleAddTag = async (data: z.infer<typeof AddTagSchema>) => {
    const trimmedTag = data.tag.trim()

    if (element.tags.includes(trimmedTag)) {
      toast.error('This tag already exists on the resource')
      return
    }

    if (element.tags.length >= MAX_TAGS) {
      toast.error(`Cannot add more than ${MAX_TAGS} tags to a resource`)
      return
    }

    try {
      await list.updateList({
        elements: list.content.new.elements.map((el) =>
          el.name === element.name
            ? { ...el, tags: [...el.tags, trimmedTag] }
            : el,
        ),
      })
      setAddTagDialogOpen(false)
      toast.success('Tag added successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add tag')
    }
  }

  const handleAddTagError = () => {
    toast.error('Please fix the errors in the form before submitting.')
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
                disabled={!list.canEdit}
                onClick={() => setAddTagDialogOpen(true)}
              >
                Add Tag
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
        <>
          <ResourceEditSheet
            element={element}
            state={{ open, onOpenChange: setOpen }}
          />

          <AlertDialog.Root
            open={addTagDialogOpen}
            onOpenChange={setAddTagDialogOpen}
          >
            <AlertDialog.Content>
              <AutoForm.Root
                schema={AddTagSchema}
                defaultValues={{ tag: '' }}
                onSubmit={handleAddTag}
                onError={handleAddTagError}
              >
                <>
                  <AlertDialog.Title className="sr-only">
                    Add Tag
                  </AlertDialog.Title>
                  <AlertDialog.Description className="sr-only">
                    Add a new tag to the resource "{element.name}". Enter a tag
                    name below.
                  </AlertDialog.Description>
                </>
                <Heading>Add Tag</Heading>
                <Text>
                  Add a new tag to the resource "{element.name}". Enter a tag
                  name below.
                </Text>

                <Flex direction="column" gap="3" mt="4">
                  <AutoForm.Content fields={['tag']} />
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                  <AlertDialog.Cancel>
                    <Button variant="soft" color="gray" type="button">
                      Cancel
                    </Button>
                  </AlertDialog.Cancel>
                  <AutoForm.Action type="submit" variant="classic">
                    Add Tag
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
