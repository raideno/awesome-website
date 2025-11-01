import {
  Box,
  Button,
  Dialog,
  Flex,
  Heading,
  Link,
  Text,
} from '@radix-ui/themes'
import { ExternalLinkIcon, ReloadIcon } from '@radix-ui/react-icons'
import React, { useState } from 'react'

import { toast } from 'sonner'

import { GitHubService } from '@/lib/github'

interface UpdateCheckDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentCommitHash: string
  latestCommitHash: string
  githubToken: string
  onUpdateTriggered?: () => void
}

export const UpdateCheckDialog: React.FC<UpdateCheckDialogProps> = ({
  open,
  onOpenChange,
  currentCommitHash,
  latestCommitHash,
  githubToken,
  onUpdateTriggered,
}) => {
  const [isUpdating, setIsUpdating] = useState(false)

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
          <Text size="2">A new version of the website is available.</Text>
          <Text size="2">
            Current version:{' '}
            <Link
              href={`https://github.com/raideno/awesome-website/commit/${currentCommitHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex gap-1 items-center"
            >
              {currentCommitHash.slice(0, 7)} <ExternalLinkIcon />
            </Link>
            .
          </Text>
          <Text size="2">
            New version:{' '}
            <Link
              href={`https://github.com/raideno/awesome-website/commit/${latestCommitHash}`}
              target="_blank"
              className="inline-flex gap-1 items-center"
              rel="noopener noreferrer"
            >
              {latestCommitHash.slice(0, 7)} <ExternalLinkIcon />
            </Link>
            .
          </Text>
          <Text size="2" color="gray">
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
