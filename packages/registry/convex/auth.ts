import GitHub from '@auth/core/providers/github'
import { convexAuth, getAuthUserId } from '@convex-dev/auth/server'
import { OAuthApp } from '@octokit/oauth-app'
import { v } from 'convex/values'

import { Id } from '@/convex//dataModel'
import { internal } from './_generated/api'
import {
  ActionCtx,
  internalMutation,
  internalQuery,
  MutationCtx,
  query,
} from '@/convex/server'

import { DataModel } from './schema'

type Profile = Omit<DataModel['users']['document'], '_id' | '_creationTime'>

type GithubCredentials = {
  access: {
    token: string
    expiresAt: number
  }
  refresh: {
    token: string
    expiresAt: number
  }
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub({
      authorization: {
        params: {
          scope: 'read:user repo user:email',
        },
      },
      profile: async (githubProfile, tokens) => {
        console.log(String(githubProfile.id))
        const user: Profile = {
          id: String(githubProfile.id),
          name: githubProfile.name!,
          image: githubProfile.picture as string,
          email: githubProfile.email!,
          emailVerificationTime: null,
          phone: null,
          phoneVerificationTime: null,
          isAnonymous: false,
          credentials: {
            access: {
              token: tokens.access_token!,
              expiresAt: tokens.expires_at,
            },
            refresh: tokens.refresh_token
              ? {
                  token: tokens.refresh_token,
                  expiresAt: -1,
                }
              : undefined,
          },
        }

        return user
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(context: MutationCtx, args) {
      await context.scheduler.runAfter(0, internal.stripe.setup, {
        entityId: args.userId,
        email: args.profile.email,
      })
    },
  },
})

export const self = query({
  args: {},
  handler: async (context) => {
    const userId = await getAuthUserId(context)

    if (userId === null) return null

    const user = await context.db.get(userId)

    if (!user) return null

    return {
      _id: user._id,
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    }
  },
})

export const getGithubCredentials = internalQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    return user?.credentials ?? null
  },
})

export const updateGithubCredentials = internalMutation({
  args: {
    userId: v.id('users'),
    credentials: v.object({
      access: v.object({
        token: v.string(),
        expiresAt: v.number(),
      }),
      refresh: v.object({
        token: v.string(),
        expiresAt: v.number(),
      }),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      credentials: args.credentials,
    })
  },
})

export async function getValidGithubAccessToken(
  context: ActionCtx,
  userId: Id<'users'>,
): Promise<string> {
  const credentials = await context.runQuery(
    internal.auth.getGithubCredentials,
    {
      userId,
    },
  )

  if (!credentials) {
    throw new Error('GitHub credentials not linked')
  }

  const now = Date.now()
  const expiryBuffer = 5 * 60 * 1000
  const isAccessTokenExpired = credentials.access.expiresAt - now < expiryBuffer

  if (!isAccessTokenExpired) {
    return credentials.access.token
  }

  // Token expired - refresh it
  if (!credentials.refresh.token) {
    throw new Error(
      'Access token expired and no refresh token available. Please re-authenticate with GitHub.',
    )
  }

  const oAuthApp = new OAuthApp({
    clientType: 'oauth-app',
    clientId: process.env.AUTH_GITHUB_ID!,
    clientSecret: process.env.AUTH_GITHUB_SECRET!,
  })

  try {
    const response = await oAuthApp.refreshToken({
      refreshToken: credentials.refresh.token,
    })

    if (response.status !== 200) {
      throw new Error(`Failed to refresh token: ${response.status}`)
    }

    const newCredentials: GithubCredentials = {
      access: {
        token: response.data.access_token,
        expiresAt: response.data.expires_in,
      },
      refresh: {
        token: response.data.refresh_token || credentials.refresh.token,
        expiresAt: response.data.refresh_token_expires_in,
      },
    }

    await context.runMutation(internal.auth.updateGithubCredentials, {
      userId,
      credentials: newCredentials,
    })

    return newCredentials.access.token
  } catch (error) {
    console.error('Error refreshing GitHub token:', error)
    throw new Error(
      'Failed to refresh GitHub token. Please re-authenticate with GitHub.',
    )
  }
}
