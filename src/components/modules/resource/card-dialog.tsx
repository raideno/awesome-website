import './card-dialog.css'

import '@uiw/react-markdown-preview/markdown.css'
import '@uiw/react-md-editor/markdown-editor.css'
import 'katex/dist/katex.min.css'

import React, { useEffect, useState } from 'react'

import { EyeOpenIcon, Half1Icon, Pencil1Icon } from '@radix-ui/react-icons'
import {
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  Heading,
  Link,
  ScrollArea,
  Text,
} from '@radix-ui/themes'
import MDEditor from '@uiw/react-md-editor'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

import type { AwesomeListElement } from '@/types/awesome-list'

import { ToggleGroup } from '@/components/ui/toggle-group'
import { useEditing } from '@/context/editing'
import { useList } from '@/context/list'

type ViewMode = 'edit' | 'live' | 'preview'

export interface ResourceCardDialogProps {
  children?: React.ReactNode
  element: AwesomeListElement
  state?: { open: boolean; onOpenChange: (open: boolean) => void }
}

export const ResourceCardDialog: React.FC<ResourceCardDialogProps> = ({
  children,
  element,
  state,
}) => {
  const list = useList()
  const { editingEnabled } = useEditing()
  const [internalOpen, setInternalOpen] = useState(false)
  const [editedNotes, setEditedNotes] = useState(element.notes || '')
  const [viewMode, setViewMode] = useState<ViewMode>('live')

  const isOpen = state?.open ?? internalOpen
  const setOpen = state?.onOpenChange ?? setInternalOpen
  const canEdit = list.canEdit && editingEnabled

  useEffect(() => {
    setEditedNotes(element.notes || '')
  }, [element.notes])

  const handleOpenChange = async (open: boolean) => {
    if (!open && canEdit && editedNotes !== element.notes) {
      try {
        await list.updateList({
          elements: list.content.new.elements.map((el) =>
            el.name === element.name ? { ...el, notes: editedNotes } : el,
          ),
        })
      } catch (error) {
        console.error('Failed to save notes:', error)
      }
    }
    setOpen(open)
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      {children && <Dialog.Trigger>{children}</Dialog.Trigger>}
      <style>
        {`
        .rt-BaseDialogScrollPadding {
          padding: 0 !important;
        }
      `}
      </style>
      <Dialog.Content
        align="start"
        size="4"
        className="!p-4 !top-0 !left-0 !right-0 !m-0 !w-screen !h-screen !max-w-none !max-h-none"
      >
        <ScrollArea
          style={{ height: '100%' }}
          className="max-w-5xl pt-8 mx-auto"
        >
          <Flex direction="column" p="0" gap="4">
            <Box>
              <Flex
                direction={'row'}
                gap={'4'}
                justify={'between'}
                align={'center'}
              >
                <Box>
                  <Dialog.Title size="8" weight="bold" className="!m-0">
                    {element.name}
                  </Dialog.Title>
                </Box>
                <Flex direction={'row'} gap={'2'} align={'center'}>
                  <Dialog.Close>
                    <Button variant="outline">Close</Button>
                  </Dialog.Close>
                </Flex>
              </Flex>
              {element.description && (
                <Text size="4" className="markdown-content leading-relaxed">
                  {element.description}
                </Text>
              )}
            </Box>

            {element.links && element.links.length > 0 && (
              <Flex direction="column" gap="2">
                <Heading size="5" weight="medium">
                  Links
                </Heading>
                <Flex direction="column" gap="2">
                  {element.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="!underline"
                    >
                      {link}
                    </Link>
                  ))}
                </Flex>
              </Flex>
            )}

            {element.tags.length > 0 && (
              <Flex direction="column" gap="2">
                <Heading size="5" weight="medium">
                  Tags
                </Heading>
                <Flex direction="row" wrap="wrap" gap="2">
                  {element.tags.map((tag) => (
                    <Badge key={tag} size="2">
                      {tag}
                    </Badge>
                  ))}
                </Flex>
              </Flex>
            )}

            <Flex direction="column" gap="0">
              <Flex
                direction="row"
                justify="between"
                align="center"
                // className="mb-2"
              >
                <Heading size="5" weight="medium" className="!mb-0">
                  Notes
                </Heading>
                {canEdit && (
                  <ToggleGroup.Root
                    type="single"
                    value={viewMode}
                    onValueChange={(value) => {
                      if (value) setViewMode(value as ViewMode)
                    }}
                  >
                    <ToggleGroup.Item value="edit" aria-label="Edit only">
                      <Pencil1Icon />
                    </ToggleGroup.Item>
                    <ToggleGroup.Item value="live" aria-label="Split view">
                      <Half1Icon />
                    </ToggleGroup.Item>
                    <ToggleGroup.Item value="preview" aria-label="Preview only">
                      <EyeOpenIcon />
                    </ToggleGroup.Item>
                  </ToggleGroup.Root>
                )}
              </Flex>
              {!canEdit && !editedNotes ? (
                <Text color="gray" size="3">
                  No notes available.
                </Text>
              ) : (
                <Box data-color-mode="light">
                  <style>{`
                    .w-md-editor-text-input,
                    .w-md-editor-text-pre .code-line {
                      font-size: 1rem !important;
                      line-height: 1rem !important;
                    }

                    .w-md-editor-text-pre .code-line {
                      display: block;
                    }
                  `}</style>
                  <MDEditor
                    textareaProps={{
                      placeholder: 'Add your notes here...',
                    }}
                    hideToolbar
                    value={editedNotes}
                    onChange={(value) => {
                      setEditedNotes(value || '')
                    }}
                    preview={canEdit ? viewMode : 'preview'}
                    height={400}
                    visibleDragbar={false}
                    className="!bg-transparent !border-none !shadow-none !p-0"
                    previewOptions={{
                      remarkPlugins: [remarkMath],
                      rehypePlugins: [rehypeKatex],
                    }}
                  />
                </Box>
              )}
            </Flex>
          </Flex>
        </ScrollArea>
      </Dialog.Content>
    </Dialog.Root>
  )
}
