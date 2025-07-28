import React, { createContext, useContext } from 'react'

// @ts-ignore: allow custom accentColor value
import list_ from 'virtual:awesome-list'

import type { ViewMode } from '@/types/view-mode'

import { useLocalStorageState } from '@/hooks/local-storage-state'

const DEFAULT_MODE: ViewMode = 'detailed'

interface ViewModeContextType {
  mode: ViewMode
  setMode: (mode: ViewMode) => void
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(
  undefined,
)

export const useViewMode = () => {
  const context = useContext(ViewModeContext)
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider')
  }
  return context
}

export const ViewModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useLocalStorageState<ViewMode>(
    'display.mode',
    DEFAULT_MODE,
  )

  return (
    <ViewModeContext.Provider
      value={{
        mode,
        setMode,
      }}
    >
      {children}
    </ViewModeContext.Provider>
  )
}
