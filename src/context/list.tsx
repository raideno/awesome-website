// @ts-ignore: idk
import list_ from 'virtual:awesome-list'

import { useQuery } from '@tanstack/react-query'
import React, { createContext, useContext, useMemo } from 'react'

import type { AwesomeList } from '@/types/awesome-list'

import { AwesomeListSchema } from '@/types/awesome-list'

import { GitHubService } from '@/lib/github'

import { useCommitAwareStorage } from '@/hooks/commit-aware-storage'
import { useDocumentTitle } from '@/hooks/document-title'
import { useGitHubAuth } from '@/hooks/github-auth'
import { useWorkflowStatus } from '@/hooks/workflow-status'

interface ListContextType {
  content: {
    old: AwesomeList
    new: AwesomeList
  }
  allTags: Array<string>
  updateList: (updates: Partial<AwesomeList>) => void
  clearChanges: () => void
  hasUnsavedChanges: boolean
  isWorkflowRunning: boolean
  canEdit: boolean
  isLoading: boolean
  error: string | null
}

const ListContext = createContext<ListContextType | undefined>(undefined)

export const useList = () => {
  const context = useContext(ListContext)
  if (!context) {
    throw new Error('useList must be used within a ListProvider')
  }
  return context
}

export const ListProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const githubAuth = useGitHubAuth()
  const { isWorkflowRunning, checkWorkflowStatus } = useWorkflowStatus()

  const {
    data: changes,
    setData: setChanges,
    clearData: clearPersistedChanges,
  } = useCommitAwareStorage<Partial<AwesomeList>>(
    'awesome-list-changes',
    __USER_REPOSITORY_COMMIT_HASH__,
    {},
  )

  const enabled = Boolean(
    githubAuth.isAuthenticated && githubAuth.token && !import.meta.env.DEV,
  )

  const {
    data: remoteList,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['awesome-list'],
    queryFn: async () => {
      try {
        const github = new GitHubService({
          token: githubAuth.token || undefined,
          owner: __REPOSITORY_OWNER__,
          repo: __REPOSITORY_NAME__,
        })
        const file = await github.getYamlFile(__YAML_FILE_PATH__)

        const parsing = AwesomeListSchema.safeParse(file.content)

        if (parsing.error) throw parsing.error

        return parsing.data
      } catch (err) {
        console.warn('Failed to fetch remote YAML, using preloaded data:', err)
        return list_
      }
    },
    enabled,
    initialData: list_,
    retry: (failureCount, _error) => failureCount < 3,
  })

  const baseList = remoteList || list_
  const list = useMemo<AwesomeList>(() => {
    return { ...baseList, ...changes }
  }, [baseList, changes])

  const allTags = useMemo(() => {
    return [...new Set(list.elements.flatMap((element) => element.tags))].sort()
  }, [list])

  const updateList = async (updates: Partial<AwesomeList>) => {
    await checkWorkflowStatus()
    if (isWorkflowRunning) {
      throw new Error(
        'Cannot edit while website is being updated. Please wait for the build to complete.',
      )
    }
    setChanges((prev: Partial<AwesomeList>) => ({ ...prev, ...updates }))
  }

  const clearChanges = () => {
    clearPersistedChanges()
  }

  const hasUnsavedChanges = Object.keys(changes).length > 0
  const canEdit = !isWorkflowRunning
  const error = queryError?.message || null

  useDocumentTitle(hasUnsavedChanges)

  return (
    <ListContext.Provider
      value={{
        content: {
          old: baseList,
          new: list,
        },
        allTags,
        updateList,
        clearChanges,
        hasUnsavedChanges,
        isWorkflowRunning,
        canEdit,
        isLoading,
        error,
      }}
    >
      {children}
    </ListContext.Provider>
  )
}
