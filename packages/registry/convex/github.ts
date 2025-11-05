'use node'

import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { Octokit } from 'octokit'

import { action } from '@/convex/server'

import { getValidGithubAccessToken } from './auth'

// TODO: make this faster by adding some caching and stuff

const MAX_REPOSITORIES = 100

export const listRepositories = action({
  args: {
    visibility: v.union(
      v.literal('all'),
      v.literal('public'),
      v.literal('private'),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)

    if (!userId) throw new Error('User ID not found')

    const token = await getValidGithubAccessToken(ctx, userId)

    const application = new Octokit({
      auth: token,
    })

    const response = await application.rest.repos.listForAuthenticatedUser({
      per_page: MAX_REPOSITORIES,
      visibility: args.visibility,
      affiliation: 'owner,collaborator,organization_member',
    })

    if (response.status !== 200)
      throw new Error(`GitHub API error: ${Number(response.status)}`)

    const repositories = response.data

    // Check each repository for awesome-website action usage in workflows
    const repositoriesWithAwesomeCheck = await Promise.all(
      repositories.map(async (repository) => {
        let isAwesomeRepository = false

        try {
          // Get the workflows directory contents
          const workflowsResponse = await application.rest.repos.getContent({
            owner: repository.owner.login,
            repo: repository.name,
            path: '.github/workflows',
          })

          // If workflows directory exists and contains files
          if (
            workflowsResponse.status === 200 &&
            Array.isArray(workflowsResponse.data)
          ) {
            // Check each workflow file
            for (const file of workflowsResponse.data) {
              if (
                file.type === 'file' &&
                (file.name.endsWith('.yml') || file.name.endsWith('.yaml'))
              ) {
                try {
                  // Get the workflow file content
                  const fileResponse = await application.rest.repos.getContent({
                    owner: repository.owner.login,
                    repo: repository.name,
                    path: file.path,
                  })

                  if (
                    fileResponse.status === 200 &&
                    'content' in fileResponse.data
                  ) {
                    // Decode the base64 content
                    const content = Buffer.from(
                      fileResponse.data.content,
                      'base64',
                    ).toString('utf-8')

                    // Check if the workflow uses the awesome-website action
                    // Pattern: raideno/awesome-website@<version>
                    if (/raideno\/awesome-website@/i.test(content)) {
                      isAwesomeRepository = true
                      break
                    }
                  }
                } catch (fileError) {
                  // Skip files that can't be read
                  console.warn(
                    `Could not read workflow file ${file.path}:`,
                    fileError,
                  )
                }
              }
            }
          }
        } catch {
          // Repository might not have .github/workflows directory or we don't have access
          // This is expected for many repositories, so we just mark as not awesome
        }

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
