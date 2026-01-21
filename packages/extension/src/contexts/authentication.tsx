import { useAuthActions } from '@convex-dev/auth/react'
import { useQuery } from 'convex/react'
import React from 'react'
import { api } from 'backend/api'

import type { FunctionReturnType } from 'convex/server'

/**
 * undefined is set as a loading state meaning we do not know yet.
 */
export interface AuthenticationContextType {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  user: FunctionReturnType<typeof api.auth.self> | null | undefined

  isAuthenticated: boolean

  isLoading: boolean

  signOut: () => Promise<void>
  signIn: (params: { redirect?: string } | undefined) => Promise<void>
}

export const AuthenticationContext = React.createContext<
  AuthenticationContextType | undefined
>(undefined)

export const useAuthentication = () => {
  const context = React.useContext(AuthenticationContext)

  if (!context)
    throw new Error(
      'useAuthentication must be used within a AuthenticationContext',
    )

  return context
}

export const AuthenticationContextProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const user = useQuery(api.auth.self)

  const isAuthenticated = Boolean(user)

  const isLoading = user === undefined

  const { signIn: signIn_, signOut: signOut_ } = useAuthActions()

  const signIn: AuthenticationContextType['signIn'] = async (params) => {
    await signIn_(
      'github',
      params && params.redirect
        ? {
            redirectTo: params.redirect,
          }
        : undefined,
    )
  }

  const signOut = async () => {
    await signOut_()
  }

  return (
    <AuthenticationContext.Provider
      value={{
        user,

        isAuthenticated,
        isLoading,

        signIn,
        signOut,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  )
}
