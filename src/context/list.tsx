// @ts-ignore: allow custom accentColor value
import list_ from 'virtual:awesome-list'

import React, { createContext, useContext, useMemo } from 'react'

import type { AwesomeList } from '@/types/awesome-list'

import { useLocalStorageState } from '@/hooks/local-storage-state'

interface ListContextType {
  content: {
    old: AwesomeList
    new: AwesomeList
  }
  allTags: Array<string>
  updateList: (updates: Partial<AwesomeList>) => void
  clearChanges: () => void
  hasUnsavedChanges: boolean
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
  const [changes, setChanges, clearStoredChanges] = useLocalStorageState<
    Partial<AwesomeList>
  >('awesome-list-changes', {})

  const list = useMemo<AwesomeList>(() => {
    return { ...list_, ...changes }
  }, [changes])

  const allTags = useMemo(() => {
    return [...new Set(list.elements.flatMap((element) => element.tags))].sort()
  }, [list])

  const updateList = (updates: Partial<AwesomeList>) => {
    setChanges((prev) => ({ ...prev, ...updates }))
  }

  const clearChanges = () => {
    clearStoredChanges()
  }

  const hasUnsavedChanges = Object.keys(changes).length > 0

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
      }}
    >
      {children}
    </ListContext.Provider>
  )
}
