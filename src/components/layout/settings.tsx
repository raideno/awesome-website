import { z } from 'zod/v4'
import { Pencil1Icon } from '@radix-ui/react-icons'
import { Box, Button, Dialog, Flex, IconButton } from '@radix-ui/themes'

import { AutoForm } from '@/components/modules/form/auto'
import { ListMetadataEditSheet } from '@/components/modules/misc/list-metadata-edit-sheet'

export interface SettingsProps {}

export const Settings: React.FC<SettingsProps> = () => {
  const AuthFormSchema = z.object({
    token: z.string().min(1, 'Token is required'),
  })

  const handleSubmit = async (data: z.infer<typeof AuthFormSchema>) => {
    try {
      console.log('Authenticating with token:', data.token)
    } catch (error) {
      console.error('Authentication failed:', error)
    }
  }

  return (
    <Box className="w-full" pt="8">
      <Flex
        className="w-full"
        direction="row"
        align="center"
        justify="end"
        gap="2"
      >
        <Dialog.Root>
          <Dialog.Trigger>
            <Button variant="classic">Login</Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Flex direction={'column'} gap={'4'}>
              <Box>
                <Dialog.Title>Login to Awesome Website</Dialog.Title>
                <Dialog.Description>
                  Please enter your GitHub Fine Grained Token to access website
                  modification the features.
                </Dialog.Description>
              </Box>

              <AutoForm.Root schema={AuthFormSchema} onSubmit={handleSubmit}>
                {/* TODO: input should be disabled by default if a token is already inserted; a button must be clicked to modify it. */}
                <AutoForm.Content />
                <AutoForm.Actions className="mt-4">
                  <AutoForm.Action
                    type="submit"
                    className="!w-full"
                    variant="classic"
                  >
                    Authenticate
                  </AutoForm.Action>
                </AutoForm.Actions>
              </AutoForm.Root>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
        <ListMetadataEditSheet>
          <IconButton variant="classic">
            <Pencil1Icon />
          </IconButton>
        </ListMetadataEditSheet>
      </Flex>
    </Box>
  )
}
