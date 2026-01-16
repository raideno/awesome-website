import { httpRouter } from 'convex/server'

import { auth } from '@/convex/auth'
import { stripe } from '@/convex/stripe'

const http = httpRouter()

auth.addHttpRoutes(http)
stripe.addHttpRoutes(http)

export default http
