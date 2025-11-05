export const REQUIRE_AUTH_URL_SEARCH_KEY = 'requireAuth'
export const REQUIRE_SUBSCRIPTION_URL_SEARCH_KEY = 'requireSubscription'
export const REDIRECT_URL_SEARCH_KEY = 'redirect'
export const ALREADY_SUBSCRIBED_URL_SEARCH_KEY = 'alreadySubscribed'

export interface myKey {
  [ALREADY_SUBSCRIBED_URL_SEARCH_KEY]: boolean
}

// TODO: pass a validateSearch thing to tanstackQuery routes to make sure it is only one of the defined things above
//       and validate its content as well by defining in here zod validators for it
