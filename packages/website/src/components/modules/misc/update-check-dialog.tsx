import {
  Box,
  Button,
  Callout,
  Dialog,
  Flex,
  Heading,
  Link,
  Text,
} from '@radix-ui/themes'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  ExternalLinkIcon,
  InfoCircledIcon,
  ReloadIcon,
} from '@radix-ui/react-icons'
import React, { useEffect, useState } from 'react'

import { toast } from 'sonner'

import { GitHubService } from '@/lib/github'

interface CommitInfo {
  sha: string
  message: string
  author: {
    name: string
    date: string
  }
  html_url: string
}

interface UpdateCheckDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentCommitHash: string
  latestCommitHash: string
  githubToken: string
  onUpdateTriggered?: () => void
  currentCommitMessage?: string
  latestCommitMessage?: string
  commitsBetween?: CommitInfo[]
  commitCount?: number
}

const getCommitFirstLine = (message: string) => message.split('\n')[0]

const pluralizeCommit = (count: number) =>
  `${count} commit${count !== 1 ? 's' : ''}`

export const UpdateCheckDialog: React.FC<UpdateCheckDialogProps> = ({
  open,
  onOpenChange,
  currentCommitHash,
  latestCommitHash,
  githubToken,
  onUpdateTriggered,
  currentCommitMessage,
  latestCommitMessage,
  commitsBetween = [],
  commitCount = 0,
}) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [runningWorkflow, setRunningWorkflow] = useState<{
    url: string
    name: string
  } | null>(null)
  const [isCached, setIsCached] = useState(false)

  // Check for running workflow and caching when dialog opens
  useEffect(() => {
    if (!open || !__GITHUB_WORKFLOW_FILE_NAME__) {
      setRunningWorkflow(null)
      setIsCached(false)
      return
    }

    const checkWorkflowStatus = async () => {
      try {
        const github = new GitHubService({
          token: githubToken,
          owner: __REPOSITORY_OWNER__,
          repo: __REPOSITORY_NAME__,
        })

        const workflowStatus = await github.getDeploymentWorkflowRuns(
          __GITHUB_WORKFLOW_FILE_NAME__,
        )

        if (workflowStatus.isRunning && workflowStatus.latestRun) {
          setRunningWorkflow({
            url: workflowStatus.latestRun.html_url,
            name: workflowStatus.latestRun.workflow_name,
          })
        } else {
          setRunningWorkflow(null)
        }

        // Check if latest successful workflow already deployed the target commit
        if (
          !workflowStatus.isRunning &&
          workflowStatus.latestRun &&
          workflowStatus.latestRun.conclusion === 'success' &&
          workflowStatus.latestRun.head_sha === latestCommitHash
        ) {
          setIsCached(true)
        } else {
          setIsCached(false)
        }
      } catch (error) {
        console.warn('Failed to check workflow status:', error)
        setRunningWorkflow(null)
        setIsCached(false)
      }
    }

    checkWorkflowStatus()
  }, [open, githubToken, latestCommitHash])

  const handleUpdate = async () => {
    setIsUpdating(true)

    try {
      const github = new GitHubService({
        token: githubToken,
        owner: __REPOSITORY_OWNER__,
        repo: __REPOSITORY_NAME__,
      })

      if (!__GITHUB_WORKFLOW_FILE_NAME__) {
        throw new Error(
          'Workflow filename not available in build configuration',
        )
      }

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
        onOpenChange(false)
        return
      }

      await github.triggerWorkflow(__GITHUB_WORKFLOW_FILE_NAME__, 'main')

      onUpdateTriggered?.()
      onOpenChange(false)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to trigger update'
      toast.error('Update failed', {
        description: errorMessage,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Box>
          <>
            <Dialog.Title className="sr-only">Update Available</Dialog.Title>
            <Dialog.Description className="sr-only">
              A new version of awesome website is available.
            </Dialog.Description>
          </>
          <Heading>Update Available</Heading>
        </Box>

        <Flex direction="column" gap="2" mt="3">
          <Text size="2">
            A new version of the website is available.{' '}
            {commitCount > 0 && (
              <Text weight="bold" color="blue">
                {pluralizeCommit(commitCount)} ahead
              </Text>
            )}
          </Text>

          {runningWorkflow && (
            <Callout.Root color="amber" size="1" style={{ marginTop: '8px' }}>
              <Callout.Icon>
                <ExclamationTriangleIcon />
              </Callout.Icon>
              <Callout.Text>
                An update is already in progress.{' '}
                <Link
                  href={runningWorkflow.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontWeight: 'bold' }}
                >
                  View workflow
                </Link>{' '}
                to check if it's the update you're looking for before triggering a new one.
              </Callout.Text>
            </Callout.Root>
          )}

          {isCached && (
            <Callout.Root color="blue" size="1" style={{ marginTop: '8px' }}>
              <Callout.Icon>
                <InfoCircledIcon />
              </Callout.Icon>
              <Callout.Text>
                The latest version has already been deployed, but you may be seeing a cached version.
                Try clearing your browser cache or wait a few minutes for the cache to expire.
              </Callout.Text>
            </Callout.Root>
          )}

          <Box>
            <Text size="2" weight="medium">
              Current version:{' '}
            </Text>
            <Link
              href={`https://github.com/raideno/awesome/commit/${currentCommitHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex gap-1 items-center"
            >
              {currentCommitHash.slice(0, 7)} <ExternalLinkIcon />
            </Link>
            {currentCommitMessage && (
              <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                {getCommitFirstLine(currentCommitMessage)}
              </Text>
            )}
          </Box>

          <Box>
            <Text size="2" weight="medium">
              New version:{' '}
            </Text>
            <Link
              href={`https://github.com/raideno/awesome/commit/${latestCommitHash}`}
              target="_blank"
              className="inline-flex gap-1 items-center"
              rel="noopener noreferrer"
            >
              {latestCommitHash.slice(0, 7)} <ExternalLinkIcon />
            </Link>
            {latestCommitMessage && (
              <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                {getCommitFirstLine(latestCommitMessage)}
              </Text>
            )}
          </Box>

          {commitsBetween.length > 0 && (
            <Box mt="2">
              <Button
                variant="ghost"
                size="1"
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  padding: '8px',
                }}
              >
                <Text size="2" weight="medium">
                  View all {pluralizeCommit(commitCount)}
                </Text>
                {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </Button>

              {isExpanded && (
                <Box
                  mt="2"
                  p="3"
                  style={{
                    backgroundColor: 'var(--gray-a2)',
                    borderRadius: 'var(--radius-3)',
                    maxHeight: '300px',
                    overflowY: 'auto',
                  }}
                >
                  <Flex direction="column" gap="3">
                    {commitsBetween.map((commit) => (
                      <Box key={commit.sha}>
                        <Flex align="center" gap="2" mb="1">
                          <Link
                            href={commit.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex gap-1 items-center"
                          >
                            <Text size="1" style={{ fontFamily: 'monospace' }}>
                              {commit.sha.slice(0, 7)}
                            </Text>
                            <ExternalLinkIcon width={12} height={12} />
                          </Link>
                        </Flex>
                        <Text size="2" style={{ display: 'block' }}>
                          {getCommitFirstLine(commit.message)}
                        </Text>
                        <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                          {commit.author.name} •{' '}
                          {new Date(commit.author.date).toLocaleDateString()}
                        </Text>
                      </Box>
                    ))}
                  </Flex>
                </Box>
              )}
            </Box>
          )}

          <Text size="2" color="gray" mt="2">
            Updating will trigger a new deployment with the latest changes.
          </Text>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray" disabled={isUpdating}>
              Cancel
            </Button>
          </Dialog.Close>
          <Button
            variant="classic"
            onClick={handleUpdate}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <ReloadIcon className="animate-spin" />
                Updating...
              </>
            ) : (
              'Update Now'
            )}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
