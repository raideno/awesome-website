import 'katex/dist/katex.min.css'

import React, { useState } from 'react'

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
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import { AutoForm } from '@raideno/auto-form/ui'
import type { z } from 'zod/v4'

import type { AwesomeListElement } from '@/types/awesome-list'
import { AwesomeListElementSchema } from '@/types/awesome-list'
import { useList } from '@/context/list'
import { AdminOnly } from '@/components/utils/admin-only'

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
  const [isEditMode, setIsEditMode] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)

  const isOpen = state?.open ?? internalOpen
  const setOpen = state?.onOpenChange ?? setInternalOpen

  const handleSubmit = async (
    data: z.infer<typeof AwesomeListElementSchema>,
  ) => {
    try {
      await list.updateList({
        elements: list.content.new.elements.map((el) =>
          el.name === element.name ? { ...el, ...data } : el,
        ),
      })
      setIsEditMode(false)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save changes')
    }
  }

  const handleCancel = () => {
    setIsEditMode(false)
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
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
          {isEditMode ? (
            <AutoForm.Root
              schema={AwesomeListElementSchema}
              defaultValues={{
                ...element,
              }}
              onCancel={handleCancel}
              onSubmit={handleSubmit}
              onError={() => console.log('error!')}
              className="h-full"
            >
              {/* <Flex direction="column" p="6" gap="4"> */}
              <Flex direction="column" p="0" gap="4">
                <Flex
                  direction={'row'}
                  gap={'4'}
                  justify={'between'}
                  align={'center'}
                >
                  <Dialog.Title size="8" weight="bold" className="!m-0">
                    Edit
                  </Dialog.Title>
                  <Flex direction={'row'} gap={'2'} align={'center'}>
                    <AutoForm.Action type="reset" variant="outline">
                      Cancel
                    </AutoForm.Action>
                    <AutoForm.Action type="submit" variant="classic">
                      Save
                    </AutoForm.Action>
                  </Flex>
                </Flex>

                <AutoForm.Content />
              </Flex>
            </AutoForm.Root>
          ) : (
            // <Flex direction="column" p="6" gap="4">
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
                    <AdminOnly>
                      <Button
                        variant="soft"
                        disabled={!list.canEdit}
                        onClick={() => setIsEditMode(true)}
                      >
                        Edit
                      </Button>
                    </AdminOnly>
                    <Dialog.Close>
                      <Button variant="outline">Close</Button>
                    </Dialog.Close>
                  </Flex>
                </Flex>
                {element.description && (
                  <Text size="4" className="markdown-content leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {element.description}
                    </ReactMarkdown>
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

              {element.notes && (
                <Flex direction="column" gap="2">
                  <Heading size="5" weight="medium">
                    Notes
                  </Heading>
                  <Text size="4" className="markdown-content leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {element.notes}
                    </ReactMarkdown>
                  </Text>
                </Flex>
              )}
            </Flex>
          )}
        </ScrollArea>
      </Dialog.Content>
    </Dialog.Root>
  )
}
