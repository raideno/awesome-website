import React, { createContext, useContext, useState } from 'react'
import type { AwesomeList } from '@/data/awesome-list-schema'

import { getList } from '@/data/awesome-list'

interface ViewModeContextType {
  mode: AwesomeList['mode']
  setMode: (mode: AwesomeList['mode']) => void
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
  const list = getList()

  const [mode, setMode] = useState<AwesomeList['mode']>(list.mode)

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
