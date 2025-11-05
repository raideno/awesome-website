/* eslint-disable @typescript-eslint/no-empty-object-type */

import { ExitIcon, PersonIcon } from '@radix-ui/react-icons'
import {
  Avatar,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  Spinner,
  Text,
} from '@radix-ui/themes'
import { Link } from '@tanstack/react-router'
import { useAction, useQuery } from 'convex/react'
import React from 'react'

import { useAuthentication } from '@/contexts/authentication'
import { api } from '../../convex/_generated/api'
import { useSubscription } from '@/contexts/subscription'

const ProfileLoadingState: React.FC = () => (
  <Flex align="center" justify="center" p="6">
    <Spinner size="3" />
  </Flex>
)

interface UserInfoProps {
  user:
    | {
        name?: string | null
        email?: string | null
        image?: string | null
      }
    | null
    | undefined
}

const UserInfo: React.FC<UserInfoProps> = ({ user }) => (
  <Flex align="center" gap="3">
    <Avatar
      size="3"
      src={user?.image ?? undefined}
      fallback={<PersonIcon className="size-4" />}
      radius="full"
    />
    <Flex direction="column">
      <Heading size="3">{user?.name || 'User'}</Heading>
      <Text size="2" color="gray">
        {user?.email || 'No email'}
      </Text>
    </Flex>
  </Flex>
)

const NoSubscription: React.FC = () => (
  <Card>
    <Flex direction="column" gap="4" align="center" py="4">
      <Box>
        <Heading size="4" align="center">
          No Active Subscription
        </Heading>
        <Text size="2" color="gray" align="center" mt="2">
          Subscribe to access premium features and unlock the full potential of
          your account.
        </Text>
      </Box>
      <Link to="/dashboard/payment">
        <Button size="3" variant="solid">
          Subscribe Now
        </Button>
      </Link>
    </Flex>
  </Card>
)

interface SubscriptionDetailsProps {
  productName: string
  productDescription: string | null
  nextBillingDate: Date
  amount: number
  onManageSubscription: () => void
  isPortalLoading: boolean
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({
  productName,
  productDescription,
  nextBillingDate,
  amount,
  onManageSubscription,
  isPortalLoading,
}) => {
  const onUpgradePlan = () => {
    return
  }

  return (
    <Card>
      <Flex direction="column" gap="4">
        <Box>
          <Heading size="4">{productName}</Heading>
          {productDescription && (
            <Text size="2" color="gray" mt="1">
              {productDescription}
            </Text>
          )}
        </Box>

        <Box>
          <Text size="2" color="gray">
            Next billing:{' '}
            <Text weight="bold">{nextBillingDate.toLocaleDateString()}</Text>
          </Text>
        </Box>

        <Flex direction="column" gap="2">
          <Button
            onClick={onManageSubscription}
            variant="soft"
            loading={isPortalLoading}
          >
            Manage Subscription
          </Button>
          {(!amount || amount === 0) && (
            <Button
              onClick={onUpgradePlan}
              variant="classic"
              color="orange"
              className="!w-full"
            >
              Upgrade Plan
            </Button>
          )}
        </Flex>
      </Flex>
    </Card>
  )
}

interface LogoutButtonProps {
  onLogout: () => void
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => (
  <Button
    variant="soft"
    color="red"
    className="justify-start"
    onClick={onLogout}
  >
    <ExitIcon className="size-4" />
    <span>Logout</span>
  </Button>
)

export type ProfileDialogTriggerProps = {
  image?: string
}

export const ProfileDialogTrigger: React.FC<ProfileDialogTriggerProps> = ({
  image,
}) => {
  return (
    <Avatar
      className="cursor-pointer hover:brightness-75 transition-all"
      size="2"
      src={image}
      fallback={<PersonIcon className="size-4" />}
      radius="full"
    />
  )
}

export interface ProfileDialogProps {
  children: React.ReactNode
}

export const ProfileDialog: React.FC<ProfileDialogProps> = ({
  children: trigger,
}) => {
  const { user, signOut } = useAuthentication()
  const { subscription } = useSubscription()

  const [isPortalLoading, setIsPortalLoading] = React.useState<boolean>(false)

  const products = useQuery(api.stripe.products)
  const portal = useAction(api.stripe.portal)

  const handleLogout = React.useCallback(() => {
    void signOut()
  }, [signOut])

  const handlePortal = React.useCallback(() => {
    void (async () => {
      try {
        setIsPortalLoading(true)

        const baseUrl = window.location.origin
        const returnUrl = `${baseUrl}/dashboard?return-from-portal=success`

        const response = await portal({
          returnRedirectUrl: returnUrl,
        })

        const redirectUrl = response.url

        window.location.assign(redirectUrl)
      } catch (error) {
        console.error(error)
        console.error('[error]:', 'portal redirect failed.')
      } finally {
        setIsPortalLoading(false)
      }
    })()
  }, [portal])

  // Loading states
  const isLoading = subscription === undefined || products === undefined

  if (isLoading) {
    return (
      <Dialog.Root>
        <Dialog.Trigger>{trigger}</Dialog.Trigger>
        <Dialog.Content>
          <ProfileLoadingState />
        </Dialog.Content>
      </Dialog.Root>
    )
  }

  // Prepare subscription details if subscription exists
  let subscriptionContent: React.ReactNode = null

  if (subscription === null) {
    subscriptionContent = <NoSubscription />
  } else {
    const product = products.find(
      (p) => p.productId === subscription.stripe.items.data[0].price.product,
    )

    if (!product) {
      subscriptionContent = (
        <Card>
          <Text color="red" align="center">
            Unable to load subscription details. Please try again later.
          </Text>
        </Card>
      )
    } else {
      const price = product.prices[0]
      const amount = price.stripe.unit_amount! / 100
      const nextBillingDate = new Date(
        subscription.stripe.items.data[0].current_period_end * 1000,
      )

      subscriptionContent = (
        <SubscriptionDetails
          productName={product.stripe.name}
          productDescription={product.stripe.description}
          nextBillingDate={nextBillingDate}
          amount={amount}
          onManageSubscription={handlePortal}
          isPortalLoading={isPortalLoading}
        />
      )
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger>{trigger}</Dialog.Trigger>
      <Dialog.Content>
        <Box>
          <>
            <Dialog.Title className="sr-only">Profile</Dialog.Title>
            <Dialog.Description className="sr-only">
              Manage your account settings and preferences.
            </Dialog.Description>
          </>
          <Heading>Profile</Heading>
          <Text color="gray" size="2">
            Manage your account settings and preferences.
          </Text>
        </Box>

        <Flex direction="column" gap="4" my="4">
          <UserInfo user={user} />

          {subscriptionContent}

          <Flex direction="column" gap="2">
            <LogoutButton onLogout={handleLogout} />
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export type ProfileDialogWithTriggerProps = {}

export const ProfileDialogWithTrigger: React.FC<
  ProfileDialogWithTriggerProps
> = () => {
  return (
    <ProfileDialog>
      <Box>
        <ProfileDialogTrigger />
      </Box>
    </ProfileDialog>
  )
}
