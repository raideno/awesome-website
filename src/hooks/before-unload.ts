import { useEffect } from 'react'

export function useBeforeUnload(hasUnsavedChanges: boolean, message?: string) {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        const confirmationMessage =
          message || 'You have unsaved changes. Are you sure you want to leave?'

        // NOTE: for modern browsers
        event.preventDefault()
        event.returnValue = confirmationMessage

        // NOTE: for older browsers
        return confirmationMessage
      }
    }

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges, message])
}
