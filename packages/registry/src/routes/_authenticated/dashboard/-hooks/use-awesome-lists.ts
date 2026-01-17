import { useQuery } from 'convex/react'
import * as React from 'react'

import { AwesomeListRepository } from '@/types/awesome-list-repository'

import { api } from '@/convex.generated/api'

export const useAwesomeLists = () => {
  const convexListsQuery = useQuery(api.lists.get)

  const existingLists = React.useMemo(() => {
    if (!convexListsQuery) return []
    return Array.isArray(convexListsQuery) ? convexListsQuery : []
  }, [convexListsQuery])

  const lists: AwesomeListRepository[] = React.useMemo(() => {
    return existingLists.map((list: any) => ({
      id: String(list.repository.id),
      repositoryName: list.repository.name,
      repositoryOwner: list.repository.login,
      createdAt: new Date(list._creationTime),
      lastUpdated: new Date(list._creationTime),
      version: list.version,
      status: 'active' as const,
    }))
  }, [existingLists])

  return {
    lists,
    existingLists,
    isLoading: convexListsQuery === undefined,
  }
}
