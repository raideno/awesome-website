import { useCallback, useState } from 'react'

export interface UseGitHubAuth {
  token: string | null
  setToken: (token: string) => void
  clearToken: () => void
  isAuthenticated: boolean
}

export function useGitHubAuth(): UseGitHubAuth {
  const [token, setTokenState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('github-token')
    }
    return null
  })

  const setToken = useCallback((newToken: string) => {
    setTokenState(newToken)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('github-token', newToken)
    }
  }, [])

  const clearToken = useCallback(() => {
    setTokenState(null)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('github-token')
    }
  }, [])

  return {
    token,
    setToken,
    clearToken,
    // TODO: maybe validate the token rather than just checking its availability.
    isAuthenticated: Boolean(token),
  }
}
