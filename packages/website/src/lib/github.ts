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

  async getDeploymentWorkflowRuns(workflowFileName: string): Promise<{
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
      const response = await this.octokit.rest.actions.listWorkflowRuns({
        owner: this.config.owner,
        repo: this.config.repo,
        workflow_id: workflowFileName,
        branch: 'main',
        per_page: 1,
      })

      if (response.data.workflow_runs.length === 0) {
        return { isRunning: false }
      }

      const latestRun = response.data.workflow_runs[0]
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
      console.warn('[error]: failed to get deployment workflow runs:', error)
      return { isRunning: false }
    }
  }

  async getLatestCommit(branch: string = 'main'): Promise<{
    sha: string
    commit: {
      message: string
      author: {
        name: string
        date: string
      }
    }
    html_url: string
  }> {
    try {
      const response = await this.octokit.rest.repos.getCommit({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: branch,
      })

      return {
        sha: response.data.sha,
        commit: {
          message: response.data.commit.message,
          author: {
            name: response.data.commit.author?.name || 'Unknown',
            date: response.data.commit.author?.date || '',
          },
        },
        html_url: response.data.html_url,
      }
    } catch (error) {
      throw new Error(
        `Failed to get latest commit: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async triggerWorkflow(
    workflowId: string | number,
    ref: string = 'main',
    inputs?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.octokit.rest.actions.createWorkflowDispatch({
        owner: this.config.owner,
        repo: this.config.repo,
        // NOTE: can be actual workflow_id retrieved from the rest api or just the filename
        // https://octokit.github.io/rest.js/v22/
        workflow_id: workflowId,
        ref,
        inputs,
      })
    } catch (error) {
      throw new Error(
        `Failed to trigger workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
