import { useAuthActions } from '@convex-dev/auth/react'
import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { Box, Button, Dialog, Heading, Text } from '@radix-ui/themes'

export interface AuthDialogProps {
  children: React.ReactNode
}

export const AuthDialog: React.FC<AuthDialogProps> = ({
  children: trigger,
}) => {
  const { signIn } = useAuthActions()

  const handleGithubSignIn = () => {
    signIn('github')
      .then(() => {
        console.log('github sign-in successful')
      })
      .catch((error) => {
        console.error('[error]: github sign-in failed', error)
      })
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger>{trigger}</Dialog.Trigger>
      <Dialog.Content size="3">
        <Box>
          <>
            <Dialog.Title className="sr-only">Welcome</Dialog.Title>
            <Dialog.Description className="sr-only">
              Sign in with GitHub to continue.
            </Dialog.Description>
          </>
          <Heading>Welcome</Heading>
          <Text>Sign in with GitHub to save your awesome lists.</Text>
        </Box>

        <Box my="4">
          <Button
            className="!w-full"
            size={'3'}
            variant="classic"
            onClick={handleGithubSignIn}
          >
            <GitHubLogoIcon />
            Login with GitHub
          </Button>
        </Box>

        <Text size="1" color="gray">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </Dialog.Content>
    </Dialog.Root>
  )
}
