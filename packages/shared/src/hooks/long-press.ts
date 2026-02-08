import { useCallback, useRef } from 'react'

interface UseLongPressOptions {
  onLongPress: () => void
  onClick?: () => void
  thresholdInMilliseconds?: number
}

export function useLongPress({
  onLongPress,
  onClick,
  thresholdInMilliseconds = 500,
}: UseLongPressOptions) {
  const isLongPress = useRef(false)
  const timerId = useRef<NodeJS.Timeout | null>(null)

  const start = useCallback(() => {
    isLongPress.current = false
    timerId.current = setTimeout(() => {
      isLongPress.current = true
      onLongPress()
    }, thresholdInMilliseconds)
  }, [onLongPress, thresholdInMilliseconds])

  const clear = useCallback(() => {
    if (timerId.current) {
      clearTimeout(timerId.current)
      timerId.current = null
    }
  }, [])

  const clickHandler = useCallback(() => {
    if (isLongPress.current) {
      return
    }
    onClick?.()
  }, [onClick])

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
    onClick: clickHandler,
  }
}
