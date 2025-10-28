import React from 'react'
import { useEditing } from '@/context/editing'

export interface AdminOnlyProps {
  children?: React.ReactNode
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({ children }) => {
  // TODO: Replace with real admin check
  const { isAdmin } = { isAdmin: true }
  const { editingEnabled } = useEditing()

  if (!isAdmin) return null

  if (!editingEnabled) return null

  return <>{children}</>
}
