import '@/components/ui/toggle-group.css'

import * as RadixToggleGroup from '@radix-ui/react-toggle-group'

import type React from 'react'

import { cn } from '@/lib/utils'

const ToggleGroupRoot: React.FC<
  React.ComponentProps<typeof RadixToggleGroup.Root>
> = ({ className, ...props }) => (
  <RadixToggleGroup.Root className={cn('ToggleGroup', className)} {...props} />
)

const ToggleGroupItem: React.FC<
  React.ComponentProps<typeof RadixToggleGroup.Item>
> = ({ className, ...props }) => (
  <RadixToggleGroup.Item
    className={cn('ToggleGroupItem', className)}
    {...props}
  />
)

export const ToggleGroup = {
  Root: ToggleGroupRoot,
  Item: ToggleGroupItem,
}

export type ToggleGroupRootProps = React.ComponentProps<
  typeof RadixToggleGroup.Root
>
export type ToggleGroupItemProps = React.ComponentProps<
  typeof RadixToggleGroup.Item
>
