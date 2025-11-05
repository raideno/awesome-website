import { useAuthActions } from '@convex-dev/auth/react'
import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { Box, Button, Dialog, Heading, Text } from '@radix-ui/themes'
import { Link } from '@tanstack/react-router'

export interface AuthDialogProps {
  children: React.ReactNode
}

export const AuthDialog: React.FC<AuthDialogProps> = ({
  children: trigger,
}) => {
  const { signIn } = useAuthActions()

  const handleGithubSignIn = async () => {
    try {
      await signIn('github')
    } catch (error) {
      console.error('[error]: github sign-in failed', error)
    }
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
          <Text>Sign in with GitHub to continue.</Text>
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

        <Text color="gray">
          By continuing, you agree to our{' '}
          <Link
            to="/pages/terms-of-service"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            to="/pages/privacy-policy"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Privacy Policy
          </Link>
          .
        </Text>
      </Dialog.Content>
    </Dialog.Root>
  )
}
