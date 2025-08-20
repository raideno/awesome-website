import React from 'react'

import { Pencil1Icon, PlusIcon } from '@radix-ui/react-icons'
import { Box, Card, Flex, IconButton } from '@radix-ui/themes'

import { useList } from '@/context/list'

import { ScrollToButton } from '@/components/layout/scroll-to-button'
import { ThemeSwitchButton } from '@/components/layout/theme-switch-button'
import { ResourceCreateSheet } from '@/components/modules/resource/create-sheet'
import { ListMetadataEditSheet } from '@/components/modules/misc/list-metadata-edit-sheet'

export interface FloatingActionBarProps {}

export const FloatingActionBar: React.FC<FloatingActionBarProps> = () => {
  const [editMetadataOpen, setEditMetadataOpen] = React.useState(false)
  const [createResourceOpen, setCreateResourceOpen] = React.useState(false)

  const list = useList()

  return (
    <>
      <Box>
        <Flex
          direction={'row'}
          align={'center'}
          justify={{ initial: 'center', sm: 'end' }}
          bottom={{ initial: '4', sm: '8' }}
          right={{ initial: '0', sm: '8' }}
          position={'fixed'}
          className="w-full z-10"
        >
          <Card>
            <Flex direction={{ initial: 'row', sm: 'column' }} gap={'2'}>
              <ScrollToButton to="top" />
              <ScrollToButton to="bottom" />
              <IconButton
                variant="classic"
                disabled={!list.canEdit}
                onClick={() => setCreateResourceOpen(true)}
              >
                <PlusIcon />
              </IconButton>
              <IconButton
                variant="classic"
                disabled={!list.canEdit}
                onClick={() => setEditMetadataOpen(true)}
              >
                <Pencil1Icon />
              </IconButton>
              <ThemeSwitchButton />
            </Flex>
          </Card>
        </Flex>
      </Box>

      <ListMetadataEditSheet
        state={{ open: editMetadataOpen, onOpenChange: setEditMetadataOpen }}
      />
      <ResourceCreateSheet
        state={{
          open: createResourceOpen,
          onOpenChange: setCreateResourceOpen,
        }}
      />
    </>
  )
}
