import React from 'react'

import { Button, Text } from '@radix-ui/themes'
import { Cross1Icon, ExternalLinkIcon, UpdateIcon } from '@radix-ui/react-icons'

import { Banner } from '@/components/ui/banner'
import { useVersionCheck } from '@/hooks/version-check'

export const NewVersionBanner: React.FC = () => {
  const { hasNewVersion, latestCommit, dismissNewVersion } = useVersionCheck()

  if (!hasNewVersion || !latestCommit) {
    return null
  }

  const repositoryUrl = __REPOSITORY_URL__

  return (
    <Banner
      color="orange"
      left={
        <>
          <UpdateIcon width={14} height={14} />
          <Text size="1">
            A new version is available! Please re-run the workflow to update to
            the latest version.
          </Text>
        </>
      }
      right={
        <>
          <Button
            variant="soft"
            size="1"
            color="gray"
            onClick={dismissNewVersion}
          >
            <Cross1Icon width={12} height={12} />
            Dismiss
          </Button>
          <Button
            variant="classic"
            size="1"
            onClick={() => window.open(`${repositoryUrl}/actions`, '_blank')}
          >
            <ExternalLinkIcon width={12} height={12} />
            Update Now
          </Button>
        </>
      }
    />
  )
}
