import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Grid,
  Heading,
  Text,
} from '@radix-ui/themes'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAction, useQuery } from 'convex/react'
import React from 'react'

import { PageHeader } from '@/components/page-header'

import { ALREADY_SUBSCRIBED_URL_SEARCH_KEY } from '@/constants'

import { useSubscription } from '@/contexts/subscription'
import { api } from 'backend/api'

const CURRENCY_CODE_TO_SYMBOL: Record<string, string> = {
  eur: '€',
}

export const Route = createFileRoute('/_authenticated/dashboard/payment/')({
  beforeLoad: async ({ context }) => {
    console.log(
      '[context.subscription.isSubscribed]:',
      context.subscription.isSubscribed,
    )
    if (context.subscription.isSubscribed)
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: '/dashboard',
        search: {
          [ALREADY_SUBSCRIBED_URL_SEARCH_KEY]: true,
        },
      })
  },
  component: () => {
    const { subscription } = useSubscription()
    const search = Route.useSearch()

    const products = useQuery(api.stripe.products)
    const subscribe = useAction(api.stripe.subscribe)

    const [isLoading, setIsLoading] = React.useState<string | null>(null)
    const requireSubscription = (search as any)?.requireSubscription === true

    const handleSubscribe = async (stripePriceId: string) => {
      try {
        setIsLoading(stripePriceId)

        const baseUrl = window.location.origin
        const successUrl = `${baseUrl}/dashboard?payment-status=success`
        const cancelUrl = `${baseUrl}/dashboard/payment?payment-status=cancelled`

        const response = await subscribe({
          priceId: stripePriceId,
          successRedirectUrl: successUrl,
          cancelRedirectUrl: cancelUrl,
        })

        const redirectUrl = response.url

        if (!redirectUrl) throw new Error('no redirect url provided.')

        window.location.assign(redirectUrl)
      } catch (error) {
        console.error('[error]:', 'subscription failed')
        console.error(error)
      } finally {
        setIsLoading(null)
      }
    }

    if (subscription === undefined || products === undefined) {
      return (
        <div>
          <div>Loading...</div>
        </div>
      )
    }

    return (
      <div>
        <Flex className="w-full" direction="column" align="center" gap={'5'}>
          <Box className="w-full">
            <PageHeader
              title="Payment"
              body="The product is totally free. It is optional to support it!"
            />
          </Box>

          {requireSubscription && (
            <Box className="w-full">
              <Callout.Root color="blue">
                <Callout.Icon>ℹ️</Callout.Icon>
                <Callout.Text>
                  A subscription is required to access the dashboard. Please
                  subscribe to continue.
                </Callout.Text>
              </Callout.Root>
            </Box>
          )}

          {/* <div>products: {JSON.stringify(products)}</div> */}
          <Grid
            className="w-full"
            gap={'8'}
            columns={{ initial: '1', lg: '2' }}
            rows={{ initial: '2', lg: '1' }}
          >
            {products
              .filter((product) => product.prices.length === 1)
              .filter((product) => product.prices[0].stripe.recurring !== null)
              .filter(
                (product) => product.prices[0].stripe.unit_amount !== null,
              )
              .map((product) => {
                const price = product.prices[0]
                const currency = CURRENCY_CODE_TO_SYMBOL[price.stripe.currency]
                const recurring = price.stripe.recurring!
                const amount = price.stripe.unit_amount! / 100

                return (
                  <Card key={product._id}>
                    <Flex direction={'column'} gap={'4'}>
                      <Box>
                        <Badge>
                          {recurring.interval_count} {recurring.interval}
                        </Badge>
                      </Box>
                      <Box>
                        <Heading>{product.stripe.name}</Heading>
                        <Text>{product.stripe.description}</Text>
                      </Box>
                      <Heading>
                        {amount} {currency}
                      </Heading>
                      <Box>
                        <Flex direction={'column'} gap={'1'} align={'start'}>
                          {product.stripe.marketing_features
                            .filter((feature) => feature.name)
                            .map((feature, index) => {
                              return <Text key={index}>- {feature.name}</Text>
                            })}
                        </Flex>
                      </Box>
                      <Button
                        loading={isLoading === price._id}
                        disabled={isLoading !== null && isLoading !== price._id}
                        onClick={() => void handleSubscribe(price.stripe.id)}
                        className="!w-full"
                        variant="classic"
                      >
                        Subscribe
                      </Button>
                    </Flex>
                  </Card>
                )
              })}
          </Grid>
        </Flex>
      </div>
    )
  },
})
