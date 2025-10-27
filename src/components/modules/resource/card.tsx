import React from 'react'

import 'katex/dist/katex.min.css'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

import { Badge, Box, Card, Flex, Heading, Link, Text } from '@radix-ui/themes'
import { ResourceCardDialog } from './card-dialog'

import type { AwesomeListElement } from '@/types/awesome-list'
import type { CardProps } from '@radix-ui/themes'

import { useViewMode } from '@/context/view-mode'
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
  const { mode } = useViewMode()

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
            {mode !== 'minimal' && (
              <Text className="leading-relaxed flex-grow markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {element.description}
                </ReactMarkdown>
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
          <Box>
            {element.links && (
              <Flex direction={'row'} wrap={'wrap'} gap={'3'}>
                {element.links.map((link, index) => {
                  const url = link
                  const label = link

                  return (
                    <Link
                      key={index + url}
                      href={url}
                      className="!underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {label}
                    </Link>
                  )
                })}
              </Flex>
            )}
          </Box>
        </Flex>
      </Card>
    </ResourceCardDialog>
  )
}
