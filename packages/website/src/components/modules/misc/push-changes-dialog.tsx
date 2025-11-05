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

import { useList } from '@/contexts/list'
import { useGitHubAuth } from '@/hooks/github-auth'
import { getWorkflowStatus } from '@/hooks/workflow-status'
import { GitHubService } from '@/lib/github'

interface PushChangesDialogProps {
  children?: React.ReactNode
  yamlContent: AwesomeList
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const PushChangesFormSchema = z.object({
  repository: z
    .string()
    .register(MetadataRegistry, { label: 'Repository*', disabled: true }),
  path: z
    .string()
    .register(MetadataRegistry, { label: 'YAML File Path*', disabled: true }),
  message: z
    .string()
    .min(1)
    .max(48)
    .register(MetadataRegistry, { label: 'Commit Message*', disabled: false }),
})

export const PushChangesDialog: React.FC<PushChangesDialogProps> = ({
  children,
  yamlContent,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const githubAuth = useGitHubAuth()
  const { clearChanges, syncRemoteList } = useList()

  const dialogOpen = controlledOpen !== undefined ? controlledOpen : isOpen
  const setDialogOpen = controlledOnOpenChange || setIsOpen

  const handleError = () => {
    toast.error('Something is wrong with your inputs.')
  }

  const handleSubmit = async (data: z.infer<typeof PushChangesFormSchema>) => {
    try {
      if (!githubAuth.isAuthenticated || !githubAuth.token) {
        toast.error('Authentication required', {
          description:
            'Please set your GitHub token in Settings (long-press the star button)',
        })
        return
      }

      const status = await getWorkflowStatus({ token: githubAuth.token })

      if (status.isWorkflowRunning) {
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

      setDialogOpen(false)

      // NOTE: optimistic update, set the new list as the base list and clear changes to disable update button until new changes are made
      syncRemoteList(yamlContent)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred'
      toast.error('Failed to push changes', {
        description: errorMessage,
      })
    }
  }

  const handleDiscardChanges = () => {
    clearChanges()
    setDialogOpen(false)
  }

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      {children && <Dialog.Trigger>{children}</Dialog.Trigger>}
      <Portal container={document.body}>
        <Dialog.Content>
          <AutoForm.Root
            defaultValues={{
              path: __YAML_FILE_PATH__,
              repository: `${__REPOSITORY_OWNER__}/${__REPOSITORY_NAME__}`,
              message: 'chore: update',
            }}
            schema={PushChangesFormSchema}
            onError={handleError}
            onSubmit={handleSubmit}
            onCancel={handleDiscardChanges}
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
                <Flex direction={'row'} align={'center'} justify={'between'}>
                  <Heading>Push Changes to Repository</Heading>
                  <Button
                    type="button"
                    onClick={() => setDialogOpen(false)}
                    variant="outline"
                  >
                    Close
                  </Button>
                </Flex>
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
              <AutoForm.Actions>
                <Flex direction={'column'} gap="3" justify="end">
                  <AutoForm.Action variant="soft" color="red" type="reset">
                    Discard Changes
                  </AutoForm.Action>
                  <AutoForm.Action variant="classic" type="submit">
                    Push Changes
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
