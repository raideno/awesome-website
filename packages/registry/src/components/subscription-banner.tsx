import { Button, Text } from '@radix-ui/themes'
import { Link } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react'

import { useSubscription } from '@/contexts/subscription'

export const SubscriptionBanner = () => {
  const { isSubscribed, isLoading } = useSubscription()

  if (isSubscribed || isLoading) {
    return null
  }

  return (
    <div className="border-b border-[var(--gray-7)] bg-gradient-to-r from-[var(--orange-3)] to-[var(--amber-3)]">
      <div className="mx-auto max-w-3xl py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Sparkles
              width={20}
              height={20}
              className="text-[var(--orange-11)] flex-shrink-0"
            />
            <Text size={'2'} className="text-[var(--gray-12)]">
              <Text className="hidden sm:inline">
                Become a supporter of the project.{' '}
              </Text>
              <Text weight={'bold'}>Upgrade to Pro today!</Text>
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard/payment">
              <Button variant="classic" color="orange">
                Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
