import React from 'react'

import { Banner } from '@/components/ui/banner'
import { useVersionCheck } from '@/hooks/version-check'

export const NewVersionBanner: React.FC = () => {
  const { hasNewVersion, latestCommit, dismissNewVersion } = useVersionCheck()

  if (!hasNewVersion || !latestCommit) {
    return null
  }

  return (
    <Banner
      color="orange"
      text={
        'A new template version is available! Re-run the workflow to get the latest update.'
      }
      action={{ text: 'Dismiss', onClick: dismissNewVersion }}
    />
  )
}
