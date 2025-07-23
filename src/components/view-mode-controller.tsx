import '@/components/view-mode-controller.css'

import { RowsIcon, TableIcon, ViewGridIcon } from '@radix-ui/react-icons'
import * as ToggleGroup from '@radix-ui/react-toggle-group'

import type React from 'react'

import { useViewMode } from '@/context/view-mode'

export interface ViewModeControllerProps {}

export const ViewModeController: React.FC<ViewModeControllerProps> = () => {
  const { mode, setMode } = useViewMode()

  return (
    <ToggleGroup.Root
      type="single"
      className="ToggleGroup"
      value={mode}
      onValueChange={(value) =>
        value && setMode(value as 'detailed' | 'minimal' | 'table')
      }
    >
      <ToggleGroup.Item
        value="detailed"
        aria-label="Detailed cards"
        className="ToggleGroupItem"
      >
        <ViewGridIcon width="16" height="16" />
      </ToggleGroup.Item>

      <ToggleGroup.Item
        value="table"
        aria-label="Table view"
        className="ToggleGroupItem"
      >
        <TableIcon width="16" height="16" />
      </ToggleGroup.Item>

      <ToggleGroup.Item
        value="minimal"
        aria-label="Minimal cards"
        className="ToggleGroupItem"
      >
        <RowsIcon width="16" height="16" />
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  )
}
