import React from 'react'

import { Badge, Box, Card, Flex, Heading, Link, Text } from '@radix-ui/themes'
import { ResourceCardDialog } from './card-dialog'

import type { AwesomeListElement } from '@/types/awesome-list'
import type { CardProps } from '@radix-ui/themes'

import { cn } from '@/lib/utils'

export interface ResourceCardProps extends CardProps {
  element: AwesomeListElement
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  element,
  className,
  role = 'region',
  tabIndex = 0,
  'aria-label': ariaLabel = element.name,
  ...props
}) => {
  return (
    <ResourceCardDialog element={element}>
      <Card
        className={cn('group h-full transition-all cursor-pointer', className)}
        {...props}
      >
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
            <Text className="leading-relaxed flex-grow markdown-content">
              {element.description}
            </Text>
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
          <Box>
            {element.link && (
              <Link
                href={element.link}
                className="!underline truncate block"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {element.link}
              </Link>
            )}
          </Box>
        </Flex>
      </Card>
    </ResourceCardDialog>
  )
}
