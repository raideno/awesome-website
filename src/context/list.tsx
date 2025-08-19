// @ts-ignore: allow custom accentColor value
import list_ from 'virtual:awesome-list'

import React, { createContext, useContext, useMemo } from 'react'

import type { AwesomeList } from '@/types/awesome-list'

import { useSessionStorageState } from '@/hooks/session-storage-state'
import { useBeforeUnload } from '@/hooks/before-unload'
import { useDocumentTitle } from '@/hooks/document-title'
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
  const [changes, setChanges, clearStoredChanges] = useSessionStorageState<
    Partial<AwesomeList>
  >('awesome-list-changes', {})

  const { isWorkflowRunning, checkWorkflowStatus } = useWorkflowStatus()

  // NOTE: migration, cleanup old local storage data
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const oldData = localStorage.getItem('awesome-list-changes')
      if (oldData) {
        localStorage.removeItem('awesome-list-changes')
        console.log(
          'Migrated from localStorage to sessionStorage - old data cleared',
        )
      }
    }
  }, [])

  const list = useMemo<AwesomeList>(() => {
    return { ...list_, ...changes }
  }, [changes])

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
    clearStoredChanges()
  }

  const hasUnsavedChanges = Object.keys(changes).length > 0
  const canEdit = !isWorkflowRunning

  useBeforeUnload(
    hasUnsavedChanges,
    'You have unsaved changes to your awesome list. Are you sure you want to leave?',
  )

  useDocumentTitle(hasUnsavedChanges)

  return (
    <ListContext.Provider
      value={{
        content: {
          old: list_,
          new: list,
        },
        allTags,
        updateList,
        clearChanges,
        hasUnsavedChanges,
        isWorkflowRunning,
        canEdit,
      }}
    >
      {children}
    </ListContext.Provider>
  )
}
