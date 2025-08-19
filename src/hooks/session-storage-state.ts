import { useCallback, useEffect, useState } from 'react'

export function useSessionStorageState<T>(
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
      const item = window.sessionStorage.getItem(key)
      return item ? deserialize(item) : initialValue
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error)
      return initialValue
    }
  }, [key, initialValue, deserialize])

  const [state, setState] = useState<T>(getStoredValue)

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(state) : value

        setState(valueToStore)

        window.sessionStorage.setItem(key, serialize(valueToStore))

        window.dispatchEvent(
          new CustomEvent('sessionStorage-update', {
            detail: { key, value: valueToStore },
          }),
        )
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error)
      }
    },
    [key, serialize, state],
  )

  useEffect(() => {
    const handleStorageChange = (e: CustomEvent) => {
      if ('detail' in e && e.detail?.key === key) {
        setState(e.detail.value)
      }
    }

    window.addEventListener(
      'sessionStorage-update',
      handleStorageChange as EventListener,
    )

    return () => {
      window.removeEventListener(
        'sessionStorage-update',
        handleStorageChange as EventListener,
      )
    }
  }, [key, deserialize])

  const clearValue = useCallback(() => {
    try {
      window.sessionStorage.removeItem(key)
      setState(initialValue)

      window.dispatchEvent(
        new CustomEvent('sessionStorage-update', {
          detail: { key, value: initialValue },
        }),
      )
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [state, setValue, clearValue] as const
}
