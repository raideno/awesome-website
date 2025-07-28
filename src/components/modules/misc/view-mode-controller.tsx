import { RowsIcon, TableIcon, ViewGridIcon } from '@radix-ui/react-icons'

import type React from 'react'

import { useViewMode } from '@/context/view-mode'

import { ToggleGroup } from '@/components/ui/toggle-group'

export interface ViewModeControllerProps {}

export const ViewModeController: React.FC<ViewModeControllerProps> = () => {
  const { mode, setMode } = useViewMode()

  return (
    <ToggleGroup.Root
      type="single"
      value={mode}
      onValueChange={(value) =>
        value && setMode(value as 'detailed' | 'minimal' | 'table')
      }
    >
      <ToggleGroup.Item value="detailed" aria-label="Detailed cards">
        <ViewGridIcon width="16" height="16" />
      </ToggleGroup.Item>

      <ToggleGroup.Item value="table" aria-label="Table view">
        <TableIcon width="16" height="16" />
      </ToggleGroup.Item>

      <ToggleGroup.Item value="minimal" aria-label="Minimal cards">
        <RowsIcon width="16" height="16" />
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  )
}
