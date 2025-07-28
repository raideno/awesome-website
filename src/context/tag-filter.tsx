import React, { createContext, useContext } from 'react'
import { useLocalStorageState } from '@/hooks/local-storage-state'

interface TagFilterContextType {
  selectedTags: Array<string>
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  clearTags: () => void
}

const TagFilterContext = createContext<TagFilterContextType | undefined>(
  undefined,
)

export const useTagFilter = () => {
  const context = useContext(TagFilterContext)
  if (!context) {
    throw new Error('useTagFilter must be used within a TagFilterProvider')
  }
  return context
}

export const TagFilterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedTags, setSelectedTags] = useLocalStorageState<Array<string>>(
    'filtering.tags',
    [],
  )

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag])
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }

  const clearTags = () => {
    setSelectedTags([])
  }

  return (
    <TagFilterContext.Provider
      value={{
        selectedTags,
        addTag,
        removeTag,
        clearTags,
      }}
    >
      {children}
    </TagFilterContext.Provider>
  )
}
