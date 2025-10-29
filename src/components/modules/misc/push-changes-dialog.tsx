import { Portal } from '@radix-ui/react-dialog'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Callout,
  Dialog,
  Flex,
  Heading,
  Text,
} from '@radix-ui/themes'
import { MetadataRegistry } from '@raideno/auto-form/registry'
import { AutoForm } from '@raideno/auto-form/ui'
import React, { useState } from 'react'
import { z } from 'zod/v4'

import { toast } from 'sonner'

import type { AwesomeList } from '@/types/awesome-list'

import { useList } from '@/context/list'
import { useGitHubAuth } from '@/hooks/github-auth'
import { useWorkflowStatus } from '@/hooks/workflow-status'
import { GitHubService } from '@/lib/github'

interface PushChangesDialogProps {
  children?: React.ReactNode
  yamlContent: AwesomeList
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onWorkflowTriggered?: () => void
}

const PushChangesFormSchema = z.object({
  repository: z
    .string()
    .register(MetadataRegistry, { label: 'Repository*', disabled: true }),
  path: z
    .string()
    .register(MetadataRegistry, { label: 'YAML File Path*', disabled: true }),
  // TODO: encode something into the message title & description to know the commit origin
  message: z
    .string()
    .register(MetadataRegistry, { label: 'Commit Message*', disabled: true }),
})

export const PushChangesDialog: React.FC<PushChangesDialogProps> = ({
  children,
  yamlContent,
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onWorkflowTriggered,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const githubAuth = useGitHubAuth()
  const { clearChanges } = useList()

  const { isWorkflowRunning, checkWorkflowStatus } = useWorkflowStatus()

  const dialogOpen = controlledOpen !== undefined ? controlledOpen : isOpen
  const setDialogOpen = controlledOnOpenChange || setIsOpen

  const handleSubmit = async (data: z.infer<typeof PushChangesFormSchema>) => {
    try {
      if (!githubAuth.isAuthenticated || !githubAuth.token) {
        toast.error('Authentication required', {
          description:
            'Please set your GitHub token in Settings (long-press the star button)',
        })
        return
      }

      await checkWorkflowStatus()
      if (isWorkflowRunning) {
        toast.error('Build in progress', {
          description:
            'Cannot push changes while website is being updated. Please wait for the build to complete.',
        })
        return
      }

      const github = new GitHubService({
        token: githubAuth.token,
        owner: __REPOSITORY_OWNER__,
        repo: __REPOSITORY_NAME__,
      })

      await github.updateYamlFile(data.path, yamlContent, data.message)

      toast.success('Changes pushed successfully!', {
        description: 'The repository has been updated',
      })

      onWorkflowTriggered?.()

      setTimeout(() => {
        setDialogOpen(false)
        onSuccess?.()
        // NOTE: refresh the page to load the latest changes
        window.location.reload()
      }, 2000)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred'
      toast.error('Failed to push changes', {
        description: errorMessage,
      })
    }
  }

  const handleCancellation = () => {
    setDialogOpen(false)
  }

  const handleDiscardChanges = () => {
    clearChanges()
    setDialogOpen(false)
  }

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      {children && <Dialog.Trigger>{children}</Dialog.Trigger>}
      <Portal container={document.body}>
        <Dialog.Content style={{ maxWidth: '500px' }}>
          <AutoForm.Root
            defaultValues={{
              path: __YAML_FILE_PATH__,
              repository: `${__REPOSITORY_OWNER__}/${__REPOSITORY_NAME__}`,
              message: 'chore: update',
            }}
            schema={PushChangesFormSchema}
            onSubmit={handleSubmit}
            // TODO: add some handlers to show sonner toasts if any error.
            onError={undefined}
            onCancel={handleCancellation}
          >
            <Flex direction="column" gap="4">
              <Box>
                <>
                  <Dialog.Title className="sr-only">
                    Push Changes to Repository
                  </Dialog.Title>
                  <Dialog.Description className="sr-only">
                    Review and confirm pushing your changes to the repository.
                  </Dialog.Description>
                </>
                <Heading>Push Changes to Repository</Heading>
                <Text>
                  Review and confirm pushing your changes to the repository.
                </Text>
              </Box>

              {!githubAuth.isAuthenticated && (
                <Callout.Root color="red">
                  <Callout.Icon>
                    <ExclamationTriangleIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    You are not authenticated. Please set your GitHub token in
                    Settings (long-press the star button).
                  </Callout.Text>
                </Callout.Root>
              )}

              <AutoForm.Content />

              {isWorkflowRunning && (
                <Callout.Root color="amber">
                  <Callout.Icon>
                    <ExclamationTriangleIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    Cannot push changes while website is being updated. Please
                    wait for the build to complete.
                  </Callout.Text>
                </Callout.Root>
              )}

              <AutoForm.Actions>
                <Flex direction={'column'} gap="3" justify="end">
                  <Button
                    variant="soft"
                    color="red"
                    onClick={handleDiscardChanges}
                  >
                    Discard Changes
                  </Button>
                  <AutoForm.Action variant="soft" color="gray" type="reset">
                    Cancel
                  </AutoForm.Action>
                  <AutoForm.Action variant="classic" type="submit">
                    {isWorkflowRunning
                      ? 'Build in Progress...'
                      : 'Push Changes'}
                  </AutoForm.Action>
                </Flex>
              </AutoForm.Actions>
            </Flex>
          </AutoForm.Root>
        </Dialog.Content>
      </Portal>
    </Dialog.Root>
  )
}
