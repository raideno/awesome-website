import React from 'react'

import { Button, Text } from '@radix-ui/themes'
import { InfoCircledIcon } from '@radix-ui/react-icons'

import { useList } from '@/context/list'

import { Banner } from '@/components/ui/banner'
import { PushChangesDialog } from '@/components/modules/misc/push-changes-dialog'

export const ChangesBanner: React.FC = () => {
  const { hasUnsavedChanges, content } = useList()

  if (!hasUnsavedChanges) return null

  return (
    <Banner
      color="blue"
      left={
        <>
          <InfoCircledIcon width={14} height={14} />
          <Text size="1">You have unsaved changes</Text>
        </>
      }
      right={
        <PushChangesDialog yamlContent={content.new}>
          <Button variant="soft" size="1">
            Push Changes
          </Button>
        </PushChangesDialog>
      }
    />
  )
}
