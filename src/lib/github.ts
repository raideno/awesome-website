import { Octokit } from '@octokit/rest'

import * as yaml from 'js-yaml'

import type { AwesomeList } from '@/types/awesome-list'

export interface GitHubConfig {
  token?: string
  owner: string
  repo: string
  branch?: string
}

export class GitHubService {
  private octokit: Octokit
  private config: GitHubConfig

  constructor(config: GitHubConfig) {
    this.config = {
      branch: 'main',
      ...config,
    }
    this.octokit = new Octokit({
      auth: this.config.token,
    })
  }

  async getYamlFile(
    path: string,
  ): Promise<{ content: Record<string, any>; sha: string }> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        ref: this.config.branch,
      })

      if ('content' in response.data && !Array.isArray(response.data)) {
        const content = yaml.load(
          decodeURIComponent(escape(atob(response.data.content))),
        ) as Record<string, any>

        return {
          content: content,
          sha: response.data.sha,
        }
      }

      throw new Error('File not found or is a directory')
    } catch (error) {
      throw new Error(
        `Failed to get file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async updateYamlFile(
    path: string,
    content: AwesomeList,
    commitMessage: string,
    sha?: string,
  ): Promise<void> {
    try {
      const yamlContent = yaml.dump(content, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      let fileSha = sha
      if (!fileSha) {
        const fileInfo = await this.getYamlFile(path)
        fileSha = fileInfo.sha
      }

      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        message: commitMessage,
        content: btoa(unescape(encodeURIComponent(yamlContent))),
        sha: fileSha,
        branch: this.config.branch,
      })
    } catch (error) {
      throw new Error(
        `Failed to update file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async createPullRequest(
    title: string,
    body: string,
    headBranch: string,
    baseBranch: string = 'main',
  ): Promise<{ number: number; url: string }> {
    try {
      const response = await this.octokit.rest.pulls.create({
        owner: this.config.owner,
        repo: this.config.repo,
        title,
        body,
        head: headBranch,
        base: baseBranch,
      })

      return {
        number: response.data.number,
        url: response.data.html_url,
      }
    } catch (error) {
      throw new Error(
        `Failed to create pull request: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async createBranch(
    branchName: string,
    fromBranch: string = 'main',
  ): Promise<void> {
    try {
      const refResponse = await this.octokit.rest.git.getRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${fromBranch}`,
      })

      await this.octokit.rest.git.createRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `refs/heads/${branchName}`,
        sha: refResponse.data.object.sha,
      })
    } catch (error) {
      throw new Error(
        `Failed to create branch: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async getWorkflowRuns(): Promise<{
    isRunning: boolean
    latestRun?: {
      id: number
      status: string
      conclusion: string | null
      html_url: string
      created_at: string
    }
  }> {
    try {
      const response = await this.octokit.rest.actions.listWorkflowRunsForRepo({
        owner: this.config.owner,
        repo: this.config.repo,
        per_page: 10,
      })

      const runs = response.data.workflow_runs

      if (runs.length === 0) {
        return { isRunning: false }
      }

      const latestRun = runs[0]
      const isRunning =
        latestRun.status === 'in_progress' || latestRun.status === 'queued'

      return {
        isRunning,
        latestRun: {
          id: latestRun.id,
          status: latestRun.status || 'unknown',
          conclusion: latestRun.conclusion,
          html_url: latestRun.html_url,
          created_at: latestRun.created_at,
        },
      }
    } catch (error) {
      console.warn('Failed to get workflow runs:', error)
      return { isRunning: false }
    }
  }

  async getDeploymentWorkflowRuns(): Promise<{
    isRunning: boolean
    latestRun?: {
      id: number
      status: string
      conclusion: string | null
      html_url: string
      created_at: string
      workflow_name: string
    }
  }> {
    try {
      const response = await this.octokit.rest.actions.listWorkflowRunsForRepo({
        owner: this.config.owner,
        repo: this.config.repo,
        per_page: 20,
      })

      const deploymentRuns = response.data.workflow_runs.filter((run) => {
        const workflowName = run.name?.toLowerCase() || ''
        return (
          workflowName.includes('pages') ||
          workflowName.includes('deploy') ||
          workflowName.includes('build') ||
          workflowName.includes('awesome') ||
          run.head_branch === this.config.branch
        )
      })

      if (deploymentRuns.length === 0) {
        return { isRunning: false }
      }

      const latestRun = deploymentRuns[0]
      const isRunning =
        latestRun.status === 'in_progress' || latestRun.status === 'queued'

      return {
        isRunning,
        latestRun: {
          id: latestRun.id,
          status: latestRun.status || 'unknown',
          conclusion: latestRun.conclusion,
          html_url: latestRun.html_url,
          created_at: latestRun.created_at,
          workflow_name: latestRun.name || 'Deployment',
        },
      }
    } catch (error) {
      console.warn('Failed to get deployment workflow runs:', error)
      return { isRunning: false }
    }
  }
}
