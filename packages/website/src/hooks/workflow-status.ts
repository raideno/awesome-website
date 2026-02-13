import { useQuery } from "@tanstack/react-query";

import { GitHubService } from "@/lib/github";
import { useGitHubAuth } from "@/hooks/github-auth";

export interface Workflow {
  id: number;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  workflow_name: string;
}

export type WorkflowStatusData = {
  isWorkflowRunning: boolean;
  workflow: Workflow | null;
};

export const getWorkflowStatus = async ({
  token,
}: {
  token: string;
}): Promise<WorkflowStatusData> => {
  if (!__CONFIGURATION__.repository.workflow.name) {
    console.warn("Workflow filename not available");
    return { isWorkflowRunning: false, workflow: null };
  }

  const github = new GitHubService({
    token: token,
    owner: __CONFIGURATION__.repository.owner,
    repo: __CONFIGURATION__.repository.name,
  });

  const result = await github.getDeploymentWorkflowRuns(
    __CONFIGURATION__.repository.workflow.name,
  );

  return {
    isWorkflowRunning: result.isRunning,
    workflow: result.latestRun ?? null,
  };
};

export interface UseWorkflowStatus extends WorkflowStatusData {
  checkWorkflowStatus: () => Promise<WorkflowStatusData | undefined>;
}

export function useWorkflowStatus(): UseWorkflowStatus {
  const githubAuth = useGitHubAuth();

  const enabled = Boolean(githubAuth.isAuthenticated && githubAuth.token);

  const { data, refetch } = useQuery<WorkflowStatusData, Error>({
    queryKey: [
      "deployment-workflow-status",
      __CONFIGURATION__.repository.owner,
      __CONFIGURATION__.repository.name,
      githubAuth.token,
    ],
    queryFn: async () => {
      if (!enabled) return { isWorkflowRunning: false, workflow: null };

      return getWorkflowStatus({ token: githubAuth.token! });
    },
    // NOTE: disabled as too much unnecessary re-fetching
    enabled: false,
    retry: false,
    refetchInterval: 30 * 1000,
  });

  return {
    isWorkflowRunning: data?.isWorkflowRunning ?? false,
    workflow: data?.workflow ?? null,
    // @ts-ignore: idk
    checkWorkflowStatus: refetch,
  };
}
