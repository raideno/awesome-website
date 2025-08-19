import React, { useState } from 'react'
import { z } from 'zod/v4'
import { Box, Callout, Dialog, Flex } from '@radix-ui/themes'
import { Portal } from '@radix-ui/react-dialog'
import { ExclamationTriangleIcon, InfoCircledIcon } from '@radix-ui/react-icons'

import type { AwesomeList } from '@/types/awesome-list'

import { AutoForm } from '@/components/modules/auto-form'
import { MetadataRegistry } from '@/components/modules/auto-form/registry'

import { GitHubService } from '@/lib/github'
import { useGitHubAuth } from '@/hooks/github-auth'
import { useWorkflowStatus } from '@/hooks/workflow-status'

interface PushChangesDialogProps {
  children?: React.ReactNode
  yamlContent: AwesomeList
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onWorkflowTriggered?: () => void
}

const PushChangesFormSchema = z.object({
  token: z.string().register(MetadataRegistry, {
    type: 'password',
    placeholder: 'ghp_xxxxxxxxxxxx',
    label: 'Github Token*',
  }),
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

  const { isWorkflowRunning, checkWorkflowStatus } = useWorkflowStatus()

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const dialogOpen = controlledOpen !== undefined ? controlledOpen : isOpen
  const setDialogOpen = controlledOnOpenChange || setIsOpen

  const handleSubmit = async (data: z.infer<typeof PushChangesFormSchema>) => {
    setError(null)
    setSuccess(null)

    try {
      await checkWorkflowStatus()
      if (isWorkflowRunning) {
        throw new Error(
          'Cannot push changes while website is being updated. Please wait for the build to complete.',
        )
      }

      const github = new GitHubService({
        token: data.token.trim(),
        owner: __REPOSITORY_OWNER__,
        repo: __REPOSITORY_NAME__,
      })

      await github.updateYamlFile(data.path, yamlContent, data.message)

      githubAuth.setToken(data.token.trim())

      setSuccess(
        'Changes pushed successfully! The repository has been updated.',
      )

      onWorkflowTriggered?.()

      setTimeout(() => {
        setDialogOpen(false)
        setError(null)
        setSuccess(null)
        onSuccess?.()
      }, 2000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred',
      )
    } finally {
    }
  }

  const handleCancellation = () => {
    setDialogOpen(false)
    setError(null)
    setSuccess(null)
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
              token: githubAuth.token || '',
              message: 'chore: update',
            }}
            schema={PushChangesFormSchema}
            onSubmit={handleSubmit}
            onCancel={handleCancellation}
          >
            <Flex direction="column" gap="4">
              <Box>
                <Dialog.Title>Push Changes to Repository</Dialog.Title>
                <Dialog.Description>
                  Enter your GitHub personal access token and repository details
                  to push the changes.
                </Dialog.Description>
              </Box>

              <Callout.Root>
                <Callout.Icon>
                  <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text>
                  You'll need a GitHub personal access token with repository
                  write permissions.{' '}
                  <a
                    href="https://github.com/settings/personal-access-tokens/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline' }}
                  >
                    Create one here
                  </a>
                </Callout.Text>
              </Callout.Root>

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

              {error && (
                <Callout.Root color="red">
                  <Callout.Icon>
                    <ExclamationTriangleIcon />
                  </Callout.Icon>
                  <Callout.Text>{error}</Callout.Text>
                </Callout.Root>
              )}

              {success && (
                <Callout.Root color="green">
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>{success}</Callout.Text>
                </Callout.Root>
              )}

              <AutoForm.Actions>
                <Flex gap="3" justify="end">
                  <AutoForm.Action variant="soft" color="gray" type="reset">
                    Cancel
                  </AutoForm.Action>
                  <AutoForm.Action type="submit">
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
