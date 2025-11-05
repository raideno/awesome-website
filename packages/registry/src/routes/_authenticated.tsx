import { createFileRoute, redirect } from '@tanstack/react-router'

import {
  REDIRECT_URL_SEARCH_KEY,
  REQUIRE_AUTH_URL_SEARCH_KEY,
} from '@/constants'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    if (!context.authentication.isAuthenticated)
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: '/',
        search: {
          [REQUIRE_AUTH_URL_SEARCH_KEY]: true,
          [REDIRECT_URL_SEARCH_KEY]: '/dashboard',
        },
      })
  },
})
