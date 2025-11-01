import { useLocalStorageState } from './local-storage-state'

const LOCAL_STORAGE_KEY = 'github-token'

export interface UseGitHubAuth {
  token: string | null
  setToken: (value: string) => void
  clearToken: () => void
  isAuthenticated: boolean
}

export function useGitHubAuth(): UseGitHubAuth {
  const [token, setToken, clearToken] = useLocalStorageState<string>(
    LOCAL_STORAGE_KEY,
    '',
  )

  return {
    token,
    setToken,
    clearToken,
    isAuthenticated: Boolean(token),
  }
}
