import React from 'react'

import { Button, Flex, Text } from '@radix-ui/themes'

import { useList } from '@/context/list'

import { PushChangesDialog } from '@/components/modules/misc/push-changes-dialog'
import { Banner } from '@/components/ui/banner'

export const ChangesBanner: React.FC = () => {
  const { hasUnsavedChanges, content, clearChanges } = useList()

  if (!hasUnsavedChanges) return null

  return (
    <Banner
      color="blue"
      left={
        <>
          {/* <InfoCircledIcon width={14} height={14} /> */}
          <Text size="1">You have unsaved changes</Text>
        </>
      }
      right={
        <Flex direction={'row'} align={'center'} gap={'2'}>
          <Button onClick={clearChanges} variant="soft" size="1">
            Discard Changes
          </Button>
          <PushChangesDialog yamlContent={content.new}>
            <Button variant="classic" size="1">
              Push Changes
            </Button>
          </PushChangesDialog>
        </Flex>
      }
    />
  )
}
