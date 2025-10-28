import { useQuery } from '@tanstack/react-query'

import { GitHubService } from '@/lib/github'

import { useGitHubAuth } from '@/hooks/github-auth'
import { useLocalStorageState } from '@/hooks/local-storage-state'

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  html_url: string
}

export const useVersionCheck = () => {
  const [dismissedVersion, setDismissedVersion] = useLocalStorageState<
    string | null
  >('dismissedVersionHash', null)
  const { token } = useGitHubAuth()

  const buildCommitHash = __BUILD_COMMIT_HASH__
  const repositoryOwner = __REPOSITORY_OWNER__
  const repositoryName = __REPOSITORY_NAME__

  const {
    data: latestCommit,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['latest-commit', repositoryOwner, repositoryName],
    queryFn: async () => {
      const githubService = new GitHubService({
        token: token || undefined,
        owner: repositoryOwner,
        repo: repositoryName,
      })
      return githubService.getLatestCommit('main')
    },
    enabled: Boolean(
      token && repositoryOwner && repositoryName && buildCommitHash,
    ),
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  })

  const hasNewVersion = Boolean(
    latestCommit &&
      buildCommitHash &&
      latestCommit.sha !== buildCommitHash &&
      dismissedVersion !== latestCommit.sha,
  )

  const dismissNewVersion = () => {
    if (latestCommit) {
      setDismissedVersion(latestCommit.sha)
    }
  }

  return {
    hasNewVersion,
    latestCommit,
    buildCommitHash,
    isLoading,
    error,
    dismissNewVersion,
  }
}
