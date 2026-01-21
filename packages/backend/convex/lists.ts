import { getAuthUserId } from '@convex-dev/auth/server'
import { ConvexError, v } from 'convex/values'

import { mutation, query } from './_generated/server'

export const get = query({
  args: {},
  handler: async (context) => {
    const userId = await getAuthUserId(context)

    if (!userId) throw new ConvexError('unauthenticated')

    return await context.db
      .query('lists')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', userId))
      .collect()
  },
})

export const register = mutation({
  args: {
    id: v.string(),
    login: v.string(),
    name: v.string(),
    privacy: v.union(v.literal('public'), v.literal('private')),
  },
  handler: async (context, args) => {
    const userId = await getAuthUserId(context)

    if (!userId) throw new ConvexError('unauthenticated')

    // TODO: check if repository is an awesome repository.
    // TODO: read workflow files and get latest version.
    // TODO: check if we have all required permissions to "delete" and "run workflows" on it.

    await context.db.insert('lists', {
      ownerId: userId,
      repository: {
        privacy: args.privacy,
        login: args.login,
        name: args.name,
        id: args.id,
      },
      version: 'unknown',
    })
  },
})

/**
 * Won't delete the repository at all. It'll simply remove it from the registry.
 */
export const unregister = mutation({
  args: {
    listId: v.id('lists'),
  },
  handler: async (context, args) => {
    const userId = await getAuthUserId(context)

    if (!userId) throw new ConvexError('unauthenticated')

    const list = await context.db.get(args.listId)

    if (!list) throw new Error('not_found')

    if (list.ownerId !== userId) throw new Error('unauthorized')

    return context.db.delete(args.listId)
  },
})
