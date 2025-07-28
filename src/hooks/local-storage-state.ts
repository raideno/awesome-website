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

  const getStoredValue = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? deserialize(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }, [key, initialValue, deserialize])

  const [state, setState] = useState<T>(getStoredValue)

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(state) : value

        setState(valueToStore)

        window.localStorage.setItem(key, serialize(valueToStore))

        window.dispatchEvent(
          new CustomEvent('localStorage-update', {
            detail: { key, value: valueToStore },
          }),
        )
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, serialize, state],
  )

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ('key' in e && e.key === key) {
        if (e.newValue !== null) {
          try {
            const newValue = deserialize(e.newValue)
            setState(newValue)
          } catch (error) {
            console.warn(
              `Error deserializing localStorage key "${key}":`,
              error,
            )
          }
        }
      } else if ('detail' in e && e.detail?.key === key) {
        setState(e.detail.value)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    window.addEventListener(
      'localStorage-update',
      handleStorageChange as EventListener,
    )

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(
        'localStorage-update',
        handleStorageChange as EventListener,
      )
    }
  }, [key, deserialize])

  const clearValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setState(initialValue)

      window.dispatchEvent(
        new CustomEvent('localStorage-update', {
          detail: { key, value: initialValue },
        }),
      )
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [state, setValue, clearValue] as const
}
