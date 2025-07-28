import React from 'react'

import { Badge, Card, Flex, Heading, Link, Text } from '@radix-ui/themes'
import type { CardProps } from '@radix-ui/themes'

import type { Element } from '@/types/awesome-list'

import { cn } from '@/lib/utils'
import { useViewMode } from '@/context/view-mode'

export interface ResourceCardProps extends CardProps {
  element: Element
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  element,
  className,
  role = 'region',
  tabIndex = 0,
  'aria-label': ariaLabel = element.name,
  ...props
}) => {
  const { mode } = useViewMode()

  return (
    <Card className={cn('group h-full transition-all', className)} {...props}>
      <Flex
        className="h-full"
        direction={'column'}
        justify={'between'}
        gap={'3'}
      >
        <Flex direction={'column'} gap={'2'}>
          <Heading
            size={'5'}
            weight={'bold'}
            className={cn('group-hover:text-test-100')}
          >
            {element.name}
          </Heading>
          {mode !== 'minimal' && (
            <Text className="leading-relaxed flex-grow">
              {element.description}
            </Text>
          )}
          <div className="flex flex-wrap gap-2">
            {element.tags.slice(0, 4).map((tag) => (
              <Badge size={'1'} key={tag} tabIndex={0} role="button">
                {tag}
              </Badge>
            ))}
            {element.tags.length > 4 && (
              <Badge>+{element.tags.length - 4} more</Badge>
            )}
          </div>
        </Flex>
        <Flex direction={'row'} wrap={'wrap'} gap={'3'}>
          {element.urls.map((url, index) => (
            <Link
              key={index + url}
              href={url}
              className="!underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {url}
            </Link>
          ))}
        </Flex>
      </Flex>
    </Card>
  )
}
