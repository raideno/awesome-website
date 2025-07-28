import React from 'react'

import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  IconButton,
  ScrollArea,
  Text,
  TextField,
} from '@radix-ui/themes'
import { Cross1Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'

import { useTagFilter } from '@/context/tag-filter'
import { useList } from '@/context/list'

export interface FilterModalProps {
  children: React.ReactNode
}

export const TagFilterModal: React.FC<FilterModalProps> = ({
  children: trigger,
}) => {
  const { selectedTags, addTag, removeTag, clearTags } = useTagFilter()

  const [value, setValue] = React.useState<string>('')

  const { allTags } = useList()

  const modalFilteredTags = allTags.filter((tag) =>
    tag.toLowerCase().includes(value.toLowerCase()),
  )

  return (
    <Dialog.Root>
      <Dialog.Trigger>{trigger}</Dialog.Trigger>
      <Dialog.Content aria-label="Select tags to filter">
        <Flex direction={'column'} gap={'4'}>
          <Flex direction={'column'} gap={'2'}>
            <Heading size={'4'} slot="title" className="text-lg font-bold mb-4">
              Select Tags
            </Heading>
            <TextField.Root
              className="w-full"
              placeholder="Search tags..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            >
              <TextField.Slot side="left">
                <MagnifyingGlassIcon height="16" width="16" />
              </TextField.Slot>
              {value && (
                <TextField.Slot side="right">
                  <IconButton variant="ghost" onClick={() => setValue('')}>
                    <Cross1Icon />
                  </IconButton>
                </TextField.Slot>
              )}
            </TextField.Root>
          </Flex>

          <Card className="!p-0">
            <ScrollArea scrollbars="vertical">
              <Flex className="max-h-60 flex flex-col gap-1">
                {modalFilteredTags.length === 0 && (
                  <Box p={'6'} className="text-center">
                    <Text as="p" color="gray">
                      No tags found
                    </Text>
                  </Box>
                )}
                {modalFilteredTags.map((tag) => (
                  <Box
                    key={tag}
                    py={'2'}
                    px={'4'}
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        removeTag(tag)
                      } else {
                        addTag(tag)
                      }
                    }}
                    className="w-full cursor-pointer hover:bg-[var(--accent-5)]"
                  >
                    <Flex
                      direction={'row'}
                      align={'center'}
                      justify={'between'}
                    >
                      <Text as="div" color="gray">
                        {tag}
                      </Text>
                      {selectedTags.includes(tag) && (
                        <Text
                          size={'1'}
                          color="blue"
                          className="ml-auto underline"
                        >
                          Selected
                        </Text>
                      )}
                    </Flex>
                  </Box>
                ))}
              </Flex>
            </ScrollArea>
          </Card>
          {selectedTags.length > 0 && (
            <Button
              variant="outline"
              onClick={() => clearTags()}
              className="!w-full"
            >
              Clear All Tags
            </Button>
          )}
          <Dialog.Close>
            <Button variant="classic" className="!w-full">
              Close
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
