import { useEffect } from 'react'

export function useDocumentTitle(
  hasUnsavedChanges: boolean,
  baseTitle?: string,
) {
  useEffect(() => {
    const title = baseTitle || document.title.replace(/^\*\s*/, '')

    if (hasUnsavedChanges) {
      document.title = `* ${title}`
    } else {
      document.title = title
    }

    return () => {
      document.title = title
    }
  }, [hasUnsavedChanges, baseTitle])
}
