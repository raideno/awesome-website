import { authTables } from '@convex-dev/auth/server'
import { stripeTables } from '@raideno/convex-stripe/server'
import {
  DataModelFromSchemaDefinition,
  defineSchema,
  defineTable,
} from 'convex/server'
import { v } from 'convex/values'

export const usersTable = {
  id: v.optional(v.string()),
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.union(v.number(), v.null())),
  phone: v.optional(v.union(v.string(), v.null())),
  phoneVerificationTime: v.optional(v.union(v.number(), v.null())),
  isAnonymous: v.optional(v.boolean()),
}

export const schema = defineSchema({
  ...authTables,
  ...stripeTables,
  users: defineTable({
    ...usersTable,
    credentials: v.optional(
      v.union(
        v.null(),
        v.object({
          access: v.object({
            token: v.string(),
            expiresAt: v.optional(v.number()),
          }),
          refresh: v.optional(
            v.object({
              token: v.string(),
              expiresAt: v.number(),
            }),
          ),
        }),
      ),
    ),
  })
    .index('email', ['email'])
    .index('phone', ['phone']),
  lists: defineTable({
    ownerId: v.id('users'),
    repository: v.object({
      id: v.string(),
      login: v.string(),
      name: v.string(),
      privacy: v.union(v.literal('public'), v.literal('private')),
    }),
    version: v.string(),
  }).index('by_ownerId', ['ownerId']),
})

export type DataModel = DataModelFromSchemaDefinition<typeof schema>

export default schema
