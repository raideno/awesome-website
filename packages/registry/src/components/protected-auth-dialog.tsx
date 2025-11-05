import { useAuthActions } from '@convex-dev/auth/react'
import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { Box, Button, Code, Dialog, Heading, Text } from '@radix-ui/themes'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import React from 'react'

export const ProtectedAuthDialog: React.FC = () => {
  const navigate = useNavigate()
  const search = useSearch({ strict: false })
  const { signIn } = useAuthActions()

  const requireAuth = (search as any)?.requireAuth === true
  const redirectPath = (search as any)?.redirect as string | undefined

  const [open, setOpen] = React.useState(requireAuth)

  React.useEffect(() => {
    if (requireAuth) {
      setOpen(true)
    }
  }, [requireAuth])

  const handleGithubSignIn = async () => {
    try {
      await signIn(
        'github',
        redirectPath ? { redirectTo: redirectPath } : undefined,
      )
    } catch (error) {
      console.error('[error]: github sign-in failed', error)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)

    // Clean up the URL parameters when closing
    if (!newOpen && requireAuth) {
      const newSearch = { ...search }
      delete (newSearch as any).requireAuth
      delete (newSearch as any).redirect

      // void navigate({
      //   search: newSearch as any,
      //   replace: true,
      // })
    }
  }

  if (!requireAuth) {
    return null
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Content size="3">
        <Box>
          <>
            <Dialog.Title className="sr-only">
              Authentication Required
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              This is a protected route. Please sign in with GitHub to continue.
            </Dialog.Description>
          </>
          <Heading>Authentication Required</Heading>
          <Text>
            This is a protected route. Please sign in with GitHub to continue.
          </Text>

          {redirectPath && (
            <Box mt="3">
              <Text color="gray" size="2">
                After signing in, you will be redirected to:{' '}
                <Code>{redirectPath}</Code>
              </Text>
            </Box>
          )}
        </Box>

        <Box my="4">
          <Button
            className="!w-full"
            size={'3'}
            variant="classic"
            onClick={() => void handleGithubSignIn()}
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
