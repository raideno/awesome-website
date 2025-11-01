import React from 'react'

import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Box, Callout, Dialog, Flex, Heading, Text } from '@radix-ui/themes'
import { MetadataRegistry } from '@raideno/auto-form/registry'
import { AutoForm } from '@raideno/auto-form/ui'
import { z } from 'zod/v4'

import { useGitHubAuth } from '@/hooks/github-auth'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SettingsFormSchema = z.object({
  token: z.string().register(MetadataRegistry, {
    type: 'password',
    placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxx',
    label: 'GitHub Personal Access Token',
    description:
      'Required for editing and pushing changes. Token is automatically saved.',
  }),
})

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const githubAuth = useGitHubAuth()

  const handleSubmit = (data: z.infer<typeof SettingsFormSchema>) => {
    githubAuth.setToken(data.token.trim())
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <AutoForm.Root
          defaultValues={{
            token: githubAuth.token || 'empty',
          }}
          schema={SettingsFormSchema}
          onSubmit={handleSubmit}
        >
          <Flex direction="column" gap="4">
            <Box>
              <>
                <Dialog.Title className="sr-only">Settings</Dialog.Title>
                <Dialog.Description className="sr-only">
                  Manage your GitHub authentication and preferences
                </Dialog.Description>
              </>
              <Heading>Settings</Heading>
              <Text>Manage your GitHub authentication and preferences</Text>
            </Box>

            <AutoForm.Content />

            <Callout.Root color="blue" variant="soft">
              <Callout.Icon>
                <InfoCircledIcon />
              </Callout.Icon>
              <Callout.Text>
                You'll need a GitHub personal access token with repository write
                permissions.{' '}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline' }}
                >
                  Create one here
                </a>
                .
              </Callout.Text>
            </Callout.Root>
            <AutoForm.Actions>
              <AutoForm.Action
                className="w-full"
                variant="classic"
                type="submit"
              >
                Save
              </AutoForm.Action>
            </AutoForm.Actions>
          </Flex>
        </AutoForm.Root>
      </Dialog.Content>
    </Dialog.Root>
  )
}
