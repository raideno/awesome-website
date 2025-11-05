import React, { createContext, useContext } from 'react'

import { useLocalStorageState } from '@/hooks/local-storage-state'

type Theme = 'dark' | 'light'

const DEFAULT_THEME: Theme = 'light'

export interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useLocalStorageState<Theme>('theme', DEFAULT_THEME)

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
