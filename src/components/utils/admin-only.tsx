export interface AdminOnlyProps {
  children?: React.ReactNode
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({ children }) => {
  const { isAdmin } = { isAdmin: true }

  if (!isAdmin) return null

  return <>{children}</>
}
