import { ActionCache } from '@convex-dev/action-cache'
import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { Octokit } from 'octokit'

import { components, internal } from '@/convex.generated/api'
import { action, internalAction } from '@/convex.generated/server'
import { getValidGithubAccessToken } from '@/convex/auth'

export const MAX_REPOSITORIES = 100

/**
 * 1 hour.
 */
export const CACHE_TIME_TO_LIVE = 1000 * 60 * 60 * 1

export const cachedIsAwesomeRepository = new ActionCache(
  components.actionCache,
  {
    action: internal.github.isAwesomeRepository,
    name: 'github.workflows',
    ttl: CACHE_TIME_TO_LIVE,
    log: false,
  },
)

export const isAwesomeRepository = internalAction({
  args: {
    token: v.string(),
    login: v.string(),
    name: v.string(),
  },
  handler: async (context, args) => {
    const application = new Octokit({
      auth: args.token,
    })

    try {
      const response = await application.rest.repos.getContent({
        owner: args.login,
        repo: args.name,
        path: '.github/workflows/deploy-awesome-website.yml',
      })
      return response.status === 200
    } catch (error) {
      return false
    }
  },
})

export const cachedListRepositories = new ActionCache(components.actionCache, {
  action: internal.github.listRepositories,
  name: 'github.repositories',
  ttl: CACHE_TIME_TO_LIVE,
  log: false,
})

export const listRepositories = internalAction({
  args: {
    token: v.string(),
    visibility: v.union(
      v.literal('all'),
      v.literal('public'),
      v.literal('private'),
    ),
  },
  handler: async (_, args) => {
    const application = new Octokit({
      auth: args.token,
    })

    const response = await application.rest.repos.listForAuthenticatedUser({
      per_page: MAX_REPOSITORIES,
      visibility: args.visibility,
      affiliation: 'owner,collaborator,organization_member',
    })

    if (response.status !== 200)
      throw new Error(`GitHub API error: ${Number(response.status)}`)

    const repositories = response.data

    return repositories
  },
})

export const repositories = action({
  args: {
    visibility: v.union(
      v.literal('all'),
      v.literal('public'),
      v.literal('private'),
    ),
    force: v.optional(v.boolean()),
  },
  handler: async (context, args) => {
    const userId = await getAuthUserId(context)

    if (!userId) throw new Error('User ID not found')

    const token = await getValidGithubAccessToken(context, userId)

    const repositories = await cachedListRepositories.fetch(
      context,
      {
        token: token,
        visibility: args.visibility,
      },
      {
        force: args.force,
      },
    )

    const repositoriesWithAwesomeCheck = await Promise.all(
      repositories.map(async (repository) => {
        const isAwesomeRepository = await cachedIsAwesomeRepository.fetch(
          context,
          {
            token: token,
            login: repository.owner.login,
            name: repository.name,
          },
          {
            force: args.force,
          },
        )

        return {
          id: repository.id,
          owner: repository.owner.login,
          name: repository.name,
          fullName: repository.full_name,
          private: repository.private,
          url: repository.html_url,
          canPush: repository.permissions?.push ?? false,
          isAwesomeRepository,
        }
      }),
    )

    return repositoriesWithAwesomeCheck
  },
})
