import { useCallback, useEffect, useState } from 'react'

export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  options: {
    serialize?: (value: T) => string
    deserialize?: (value: string) => T
  } = {},
) {
  const { serialize = JSON.stringify, deserialize = JSON.parse } = options

  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      // TODO: be carful when deserializing, if localStorage is corrupted somehow or changed by a malicious author
      return item ? deserialize(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, serialize(state))
    } catch (error) {
      console.warn(`[error]: when setting localStorage key "${key}":`, error)
    }
  }, [key, state, serialize])

  const clearValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setState(initialValue)
    } catch (error) {
      console.warn(`[error]: when removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [state, setState, clearValue] as const
}
