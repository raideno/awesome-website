import { authTables } from '@convex-dev/auth/server'
import { stripeTables } from '@raideno/convex-stripe/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  ...stripeTables,
  numbers: defineTable({
    value: v.number(),
  }),
})
