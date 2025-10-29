import { useQuery } from '@tanstack/react-query'

import { GitHubService } from '@/lib/github'
import { useGitHubAuth } from '@/hooks/github-auth'

export interface Workflow {
  id: number
  status: string
  conclusion: string | null
  html_url: string
  created_at: string
  workflow_name: string
}

export type WorkflowStatusData = {
  isWorkflowRunning: boolean
  workflow: Workflow | null
}

export interface UseWorkflowStatus extends WorkflowStatusData {
  checkWorkflowStatus: () => Promise<WorkflowStatusData | undefined>
}

export function useWorkflowStatus(): UseWorkflowStatus {
  const githubAuth = useGitHubAuth()

  const enabled = Boolean(githubAuth.isAuthenticated && githubAuth.token)

  const { data, refetch } = useQuery<WorkflowStatusData, Error>({
    queryKey: [
      'deployment-workflow-status',
      __REPOSITORY_OWNER__,
      __REPOSITORY_NAME__,
      githubAuth.token,
    ],
    queryFn: async () => {
      if (!enabled) return { isWorkflowRunning: false, workflow: null }

      if (!__GITHUB_WORKFLOW_FILE_NAME__) {
        console.warn('Workflow filename not available')
        return { isWorkflowRunning: false, workflow: null }
      }

      const github = new GitHubService({
        token: githubAuth.token!,
        owner: __REPOSITORY_OWNER__,
        repo: __REPOSITORY_NAME__,
      })

      const result = await github.getDeploymentWorkflowRuns(
        __GITHUB_WORKFLOW_FILE_NAME__,
      )

      return {
        isWorkflowRunning: result.isRunning,
        workflow: result.latestRun ?? null,
      }
    },
    // NOTE: disabled as too much unnecessary re-fetching
    enabled: false,
    retry: false,
    refetchInterval: 30 * 1000,
  })

  return {
    isWorkflowRunning: data?.isWorkflowRunning ?? false,
    workflow: data?.workflow ?? null,
    // @ts-ignore: idk
    checkWorkflowStatus: refetch,
  }
}
