import { ReloadIcon } from '@radix-ui/react-icons'
import { Badge, Flex, Tooltip } from '@radix-ui/themes'

import { useState } from 'react'

import { toast } from 'sonner'

import type React from 'react'

import { UpdateCheckDialog } from '@/components/modules/misc/update-check-dialog'
import { useEditing } from '@/contexts/editing'
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
  const [currentCommitMessage, setCurrentCommitMessage] = useState<
    string | undefined
  >(undefined)
  const [latestCommitMessage, setLatestCommitMessage] = useState<
    string | undefined
  >(undefined)
  const [commitsBetween, setCommitsBetween] = useState<
    Array<{
      sha: string
      message: string
      author: { name: string; date: string }
      html_url: string
    }>
  >([])
  const [commitCount, setCommitCount] = useState(0)

  const isClickable =
    editingEnabled && isAuthenticated && buildCommitHash && !import.meta.env.DEV

  const handleBadgeClick = async () => {
    if (!isClickable || !token) return

    setIsChecking(true)

    try {
      const github = new GitHubService({
        token,
        owner: 'raideno',
        repo: 'awesome-website',
      })

      if (__GITHUB_WORKFLOW_FILE_NAME__) {
        const workflowStatus = await github.getDeploymentWorkflowRuns(
          __GITHUB_WORKFLOW_FILE_NAME__,
        )

        if (workflowStatus.isRunning) {
          const workflowUrl = workflowStatus.latestRun?.html_url
          toast.info('Update in progress', {
            description: workflowUrl ? (
              <span>
                A deployment workflow is already running.{' '}
                <a
                  href={workflowUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline', fontWeight: 'bold' }}
                >
                  View workflow
                </a>
              </span>
            ) : (
              'A deployment workflow is already running. Please wait for it to complete.'
            ),
          })
          setIsChecking(false)
          return
        }
      }

      const latestCommit = await github.getLatestCommit('main')

      if (latestCommit.sha === buildCommitHash) {
        toast.success('Up to date', {
          description: 'You are running the latest version',
        })
      } else {
        setLatestCommitHash(latestCommit.sha)
        setLatestCommitMessage(latestCommit.commit.message)

        // Fetch current commit message
        try {
          const currentCommit = await github.getLatestCommit(buildCommitHash)
          setCurrentCommitMessage(currentCommit.commit.message)
        } catch (error) {
          console.warn('Failed to fetch current commit message:', error)
        }

        // Fetch commits between current and latest
        try {
          const commitsData = await github.getCommitsBetween(
            buildCommitHash,
            latestCommit.sha,
          )
          setCommitsBetween(commitsData.commits)
          setCommitCount(commitsData.totalCount)
        } catch (error) {
          console.warn('Failed to fetch commits between:', error)
        }

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
          currentCommitMessage={currentCommitMessage}
          latestCommitMessage={latestCommitMessage}
          commitsBetween={commitsBetween}
          commitCount={commitCount}
        />
      )}
    </>
  )
}
