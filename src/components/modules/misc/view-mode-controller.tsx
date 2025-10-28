import { GroupIcon, ViewGridIcon } from '@radix-ui/react-icons'

import type React from 'react'
import type { ToggleGroupRootProps } from '@/components/ui/toggle-group'

import { useViewMode } from '@/context/view-mode'

import { ToggleGroup } from '@/components/ui/toggle-group'

export type ViewModeControllerProps = Omit<
  ToggleGroupRootProps,
  'type' | 'value' | 'onValueChange' | 'defaultValue'
> & {}

export const ViewModeController: React.FC<ViewModeControllerProps> = ({
  ...props
}) => {
  const { mode, setMode } = useViewMode()
  return (
    <ToggleGroup.Root
      {...props}
      type={'single'}
      value={mode}
      onValueChange={(value) => value && setMode(value as 'detailed' | 'group')}
    >
      <ToggleGroup.Item value="detailed" aria-label="Detailed cards">
        <ViewGridIcon width="16" height="16" />
      </ToggleGroup.Item>

      <ToggleGroup.Item value="group" aria-label="Grouped view">
        <GroupIcon width="16" height="16" />
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  )
}
