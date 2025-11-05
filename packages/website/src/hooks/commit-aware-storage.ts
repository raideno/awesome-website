import { useCallback, useEffect, useMemo } from 'react'
import { useLocalStorageState } from './local-storage-state'

interface CommitAwareData<T> {
  commitHash: string
  changes: T
  timestamp: string
}

/**
 * A hook that persists data in localStorage with commit hash awareness.
 * Data is only restored if the commit hash matches the current one.
 *
 * @param key - The localStorage key
 * @param commitHash - The current commit hash to associate with the data
 * @param initialValue - The initial value if no valid persisted data exists
 */
export function useCommitAwareStorage<T>(
  key: string,
  commitHash: string,
  initialValue: T,
) {
  const [persistedData, setPersistedData, clearPersistedData] =
    useLocalStorageState<CommitAwareData<T> | null>(key, null)

  const isValidForCurrentCommit = useMemo(() => {
    if (!persistedData || !commitHash) return false
    return persistedData.commitHash === commitHash
  }, [persistedData, commitHash])

  const data = useMemo(() => {
    if (isValidForCurrentCommit && persistedData) {
      return persistedData.changes
    }
    return initialValue
  }, [isValidForCurrentCommit, persistedData, initialValue])

  const setData = useCallback(
    (value: T | ((prev: T) => T)) => {
      const newValue = value instanceof Function ? value(data) : value

      setPersistedData({
        commitHash,
        changes: newValue,
        timestamp: new Date().toISOString(),
      })
    },
    [commitHash, data, setPersistedData],
  )

  const clearData = useCallback(() => {
    clearPersistedData()
  }, [clearPersistedData])

  useEffect(() => {
    if (persistedData && !isValidForCurrentCommit) {
      console.warn(
        `Persisted data for key "${key}" is from a different commit (${persistedData.commitHash} vs ${commitHash}). Clearing stale data.`,
      )
      clearPersistedData()
    }
  }, [
    persistedData,
    isValidForCurrentCommit,
    commitHash,
    key,
    clearPersistedData,
  ])

  return {
    data,
    setData,
    clearData,
    hasData: isValidForCurrentCommit && persistedData !== null,
    isStale: !isValidForCurrentCommit && persistedData !== null,
    staleCommitHash: persistedData?.commitHash,
  }
}
