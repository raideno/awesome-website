import { PlusIcon } from '@radix-ui/react-icons'
import { Button } from '@radix-ui/themes'
import * as React from 'react'

interface ImportRepositoryButtonProps {
  onClick: () => void
}

export const ImportRepositoryButton: React.FC<ImportRepositoryButtonProps> = ({
  onClick,
}) => {
  return (
    <Button
      aria-description=""
      className="!w-full"
      variant="classic"
      onClick={onClick}
    >
      <PlusIcon />
      Import Repository
    </Button>
  )
}
