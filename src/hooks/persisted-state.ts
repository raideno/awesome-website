import { useMemo } from 'react'
import { useLocalStorageState } from './local-storage-state'

export function usePersistedState<T>(
  key: string,
  initialState: T,
  baseState?: T,
) {
  const [persistedChanges, setPersistedChanges, clearPersisted] =
    useLocalStorageState<Partial<T>>(key, {})

  const mergedState = useMemo(() => {
    const base = baseState || initialState
    return { ...base, ...persistedChanges }
  }, [baseState, initialState, persistedChanges])

  const updateState = (updates: Partial<T>) => {
    setPersistedChanges((prev) => ({ ...prev, ...updates }))
  }

  const clearChanges = () => {
    clearPersisted()
  }

  const hasChanges = Object.keys(persistedChanges).length > 0

  return {
    state: mergedState,
    changes: persistedChanges,
    updateState,
    clearChanges,
    hasChanges,
  }
}
