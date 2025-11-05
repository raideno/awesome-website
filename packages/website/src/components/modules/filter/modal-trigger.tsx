import { Button } from '@radix-ui/themes'
import { SliderIcon } from '@radix-ui/react-icons'

import type React from 'react'
import type { ButtonProps } from '@radix-ui/themes'

import { useFilter } from '@/contexts/filter'

export interface FilterModalTriggerProps extends ButtonProps {}

export const FilterModalTrigger: React.FC<FilterModalTriggerProps> = ({
  variant = 'classic',
  ...props
}) => {
  const { selectedTags } = useFilter()

  return (
    <Button variant={variant} {...props}>
      <SliderIcon />
      Filter {selectedTags.length > 0 && <>({selectedTags.length} active)</>}
    </Button>
  )
}
