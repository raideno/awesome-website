import React, { createContext, useContext } from 'react'
import { useLocalStorageState } from '@/hooks/local-storage-state'

export type TagsFilterOperator = 'or' | 'and'

export interface FilterContextType {
  search: string
  setSearch: (search: string) => void
  tagsFilterOperator: TagsFilterOperator
  setTagsFilterOperator: (operator: TagsFilterOperator) => void
  selectedTags: Array<string>
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  clearTags: () => void
}

const DEFAULT_TAGS_FILTER_OPERATOR: FilterContextType['tagsFilterOperator'] =
  'or'
const DEFAULT_SELECTED_TAGS: FilterContextType['selectedTags'] = []

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export const useFilter = () => {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider')
  }
  return context
}

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [search, setSearch] = useLocalStorageState<FilterContextType['search']>(
    'filtering.search',
    '',
  )
  const [selectedTags, setSelectedTags] = useLocalStorageState<
    FilterContextType['selectedTags']
  >('filtering.tags', DEFAULT_SELECTED_TAGS)
  const [tagsFilterOperator, setTagsFilterOperator] = useLocalStorageState<
    FilterContextType['tagsFilterOperator']
  >('filtering.operator', DEFAULT_TAGS_FILTER_OPERATOR)

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
    <FilterContext.Provider
      value={{
        search,
        setSearch,
        tagsFilterOperator,
        setTagsFilterOperator,
        selectedTags,
        addTag,
        removeTag,
        clearTags,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}
