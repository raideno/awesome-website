import { Button } from '@radix-ui/themes'
import { SliderIcon } from '@radix-ui/react-icons'

import type React from 'react'
import type { ButtonProps } from '@radix-ui/themes'

import { useTagFilter } from '@/context/tag-filter'

export interface FilterModalTriggerProps extends ButtonProps {}

export const FilterModalTrigger: React.FC<FilterModalTriggerProps> = ({
  variant = 'classic',
  ...props
}) => {
  const { selectedTags } = useTagFilter()

  return (
    <Button variant={variant} {...props}>
      <SliderIcon />
      Filter {selectedTags.length > 0 && <>({selectedTags.length} active)</>}
    </Button>
  )
}
