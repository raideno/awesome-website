import { useQuery } from 'convex/react'
import { FunctionReturnType } from 'convex/server'
import React from 'react'

import { api } from '@/convex.generated/api'

/**
 * undefined is set as a loading state meaning we do not know yet.
 */
export interface SubscriptionContextType {
  subscription: // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  FunctionReturnType<typeof api.stripe.subscription> | null | undefined

  isSubscribed: boolean

  isLoading: boolean

  // TODO: add subscription related functions
  // TODO: expose more derived states from subscription
}

export const SubscriptionContext = React.createContext<
  SubscriptionContextType | undefined
>(undefined)

export const useSubscription = () => {
  const context = React.useContext(SubscriptionContext)

  if (!context)
    throw new Error('useSubscription must be used within a SubscriptionContext')

  return context
}

export const SubscriptionContextProvider: React.FC<{
  children: React.ReactNode
  blocking?: boolean
}> = ({ children, blocking = false }) => {
  const subscription = useQuery(api.stripe.subscription)

  const isSubscribed =
    subscription === undefined
      ? undefined
      : subscription &&
        subscription.stripe &&
        subscription.stripe.status === 'active'

  const isLoading = subscription === undefined

  if (blocking && isLoading) return <div>{/* <div>Loading...</div> */}</div>

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,

        isSubscribed,
        isLoading,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}
