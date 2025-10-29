import { ReloadIcon } from '@radix-ui/react-icons'
import { Badge, Flex, Tooltip } from '@radix-ui/themes'

import { useState } from 'react'

import { toast } from 'sonner'

import type React from 'react'

import { UpdateCheckDialog } from '@/components/modules/misc/update-check-dialog'
import { useEditing } from '@/context/editing'
import { useGitHubAuth } from '@/hooks/github-auth'
import { GitHubService } from '@/lib/github'

export interface VersionBadgeProps {}

export const VersionBadge: React.FC<VersionBadgeProps> = () => {
  const buildCommitHash = __AWESOME_WEBSITE_BUILD_COMMIT_HASH__
  const shortHash = buildCommitHash ? buildCommitHash.slice(0, 7) : 'dev'

  const { editingEnabled } = useEditing()
  const { isAuthenticated, token } = useGitHubAuth()

  const [isChecking, setIsChecking] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [latestCommitHash, setLatestCommitHash] = useState<string | null>(null)

  const isClickable = editingEnabled && isAuthenticated && buildCommitHash

  const handleBadgeClick = async () => {
    if (!isClickable || !token) return

    setIsChecking(true)

    try {
      const github = new GitHubService({
        token,
        owner: __REPOSITORY_OWNER__,
        repo: __REPOSITORY_NAME__,
      })

      const latestCommit = await github.getLatestCommit('main')

      if (latestCommit.sha === buildCommitHash) {
        toast.success('Up to date', {
          description: 'You are running the latest version',
        })
      } else {
        setLatestCommitHash(latestCommit.sha)
        setUpdateDialogOpen(true)
      }
    } catch (error) {
      console.error('Failed to check for updates:', error)
      toast.error('Failed to check for updates', {
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
      })
    } finally {
      setIsChecking(false)
    }
  }

  const handleUpdateTriggered = () => {
    toast.success('Update triggered!', {
      description: 'Website deployment has been initiated',
    })
  }

  const getBadgeContent = () => {
    if (isChecking) {
      return (
        <Flex align="center" gap="1">
          <ReloadIcon width={12} height={12} className="animate-spin" />
          Checking...
        </Flex>
      )
    }
    return shortHash
  }

  const getTooltipContent = () => {
    if (isClickable) {
      return `Build: ${buildCommitHash || 'development'} (Click to check for updates)`
    }
    return `Build: ${buildCommitHash || 'development'}`
  }

  return (
    <>
      <Tooltip content={getTooltipContent()}>
        <Badge
          color="gray"
          variant="soft"
          size="1"
          onClick={isClickable ? handleBadgeClick : undefined}
          style={{
            cursor: isClickable ? 'pointer' : 'default',
            userSelect: 'none',
          }}
        >
          {getBadgeContent()}
        </Badge>
      </Tooltip>

      {latestCommitHash && token && (
        <UpdateCheckDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          currentCommitHash={buildCommitHash || ''}
          latestCommitHash={latestCommitHash}
          githubToken={token}
          onUpdateTriggered={handleUpdateTriggered}
        />
      )}
    </>
  )
}
