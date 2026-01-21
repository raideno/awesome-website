import React, { createContext, useContext } from 'react'
import { useLocalStorageStateFactory } from 'shared/hooks/local-storage-state'

export type MarkerBehavior = 'hide' | 'cross' | 'highlight' | 'none'

export interface MarkerRule {
  tag: string
  behavior: MarkerBehavior
}

export interface MarkersContextType {
  rules: Array<MarkerRule>
  addRule: (tag: string, behavior: MarkerBehavior) => void
  removeRule: (tag: string) => void
  updateRule: (tag: string, behavior: MarkerBehavior) => void
  clearRules: () => void
  getElementBehavior: (tags: Array<string>) => MarkerBehavior
}

const MarkersContext = createContext<MarkersContextType | undefined>(undefined)

export const useMarkers = () => {
  const context = useContext(MarkersContext)
  if (!context) {
    throw new Error('useMarkers must be used within a MarkersProvider')
  }
  return context
}

export const MarkersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [rules, setRules] = useLocalStorageStateFactory(
    __REPOSITORY_OWNER__,
    __REPOSITORY_NAME__,
  )<Array<MarkerRule>>('markers.rules', [])

  const addRule = (tag: string, behavior: MarkerBehavior) => {
    setRules((prev) => {
      const existing = prev.find((rule) => rule.tag === tag)
      if (existing) {
        return prev.map((rule) =>
          rule.tag === tag ? { ...rule, behavior } : rule,
        )
      }
      return [...prev, { tag, behavior }]
    })
  }

  const removeRule = (tag: string) => {
    setRules((prev) => prev.filter((rule) => rule.tag !== tag))
  }

  const updateRule = (tag: string, behavior: MarkerBehavior) => {
    setRules((prev) =>
      prev.map((rule) => (rule.tag === tag ? { ...rule, behavior } : rule)),
    )
  }

  const clearRules = () => {
    setRules([])
  }

  const getElementBehavior = (tags: Array<string>): MarkerBehavior => {
    // NOTE: priority = hide > cross > highlight > none
    const behaviors = rules
      .filter((rule) => tags.includes(rule.tag))
      .map((rule) => rule.behavior)

    if (behaviors.includes('hide')) return 'hide'
    if (behaviors.includes('cross')) return 'cross'
    if (behaviors.includes('highlight')) return 'highlight'

    return 'none'
  }

  return (
    <MarkersContext.Provider
      value={{
        rules,
        addRule,
        removeRule,
        updateRule,
        clearRules,
        getElementBehavior,
      }}
    >
      {children}
    </MarkersContext.Provider>
  )
}
