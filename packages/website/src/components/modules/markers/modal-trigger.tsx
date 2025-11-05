import { Button } from '@radix-ui/themes'
import { BookmarkIcon } from '@radix-ui/react-icons'

import type React from 'react'
import type { ButtonProps } from '@radix-ui/themes'

import { useMarkers } from '@/contexts/markers'

export interface MarkersModalTriggerProps extends ButtonProps {}

export const MarkersModalTrigger: React.FC<MarkersModalTriggerProps> = ({
  variant = 'classic',
  ...props
}) => {
  const { rules } = useMarkers()

  return (
    <Button variant={variant} {...props}>
      <BookmarkIcon />
      Markers {rules.length > 0 && <>({rules.length} active)</>}
    </Button>
  )
}
