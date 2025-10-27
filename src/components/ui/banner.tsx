import React from 'react'

import { Box, Flex } from '@radix-ui/themes'

import type { BoxProps } from '@radix-ui/themes'

import { cn } from '@/lib/utils'

export type BannerColor = 'blue' | 'green' | 'red' | 'orange' | 'amber' | 'gray'

export type BannerProps = BoxProps & {
  left: React.ReactNode
  right: React.ReactNode
  color: BannerColor
  onDismiss?: () => void
}

const getColorClass = (color: BannerColor): string => {
  switch (color) {
    case 'blue':
      return 'bg-[var(--blue-5)]'
    case 'green':
      return 'bg-[var(--green-5)]'
    case 'red':
      return 'bg-[var(--red-5)]'
    case 'orange':
      return 'bg-[var(--orange-5)]'
    case 'amber':
      return 'bg-[var(--amber-5)]'
    case 'gray':
      return 'bg-[var(--gray-5)]'
    default:
      return 'bg-[var(--gray-5)]'
  }
}

export const Banner: React.FC<BannerProps> = ({
  color,
  left,
  right,
  className,
}) => {
  return (
    <Box
      className={cn(className)}
      style={{
        borderBottom: '1px solid var(--gray-7)',
        // boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Flex
        direction={'row'}
        justify={'between'}
        align={'center'}
        py={'2'}
        px={'6'}
        className={cn(getColorClass(color))}
      >
        <Flex justify="between" align="center" style={{ width: '100%' }}>
          <Flex align={'center'} justify={'center'} gap={'2'}>
            {left}
          </Flex>
          <Flex gap="2" align="center">
            {right}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}
