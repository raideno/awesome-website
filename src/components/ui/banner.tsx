import React from 'react'

import { Box, Button, Flex, Text } from '@radix-ui/themes'

import type { BoxProps } from '@radix-ui/themes'

import { cn } from '@/lib/utils'

export type BannerColor = 'blue' | 'green' | 'red' | 'orange' | 'amber' | 'gray'

export type BannerProps = BoxProps & {
  text: React.ReactNode
  action:
    | {
        text: string
        onClick: () => void
      }
    | {
        component: React.ReactNode
      }
  color: BannerColor
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
  text,
  action,
  className,
  ...props
}) => {
  return (
    <Box
      className={cn(className)}
      style={{
        borderBottom: '1px solid var(--gray-7)',
        // boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
      {...props}
    >
      <Flex
        direction={'row'}
        justify={'between'}
        align={'center'}
        py={'2'}
        px={'2'}
        className={cn(getColorClass(color))}
      >
        <Flex
          className="w-full"
          direction={{ initial: 'column', lg: 'row' }}
          justify="between"
          align={'center'}
        >
          <Flex align={'center'} justify={{ initial: 'start' }} gap={'2'}>
            <Text>{text}</Text>
          </Flex>
          {'component' in action ? (
            action.component
          ) : (
            <Button variant="outline" onClick={action.onClick}>
              {action.text}
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}
