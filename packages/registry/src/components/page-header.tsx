import { Heading, Text } from '@radix-ui/themes'
import React from 'react'

export interface PageHeaderProps {
  title: string
  body: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, body }) => {
  return (
    <div className="space-y-2">
      <Heading
        size={{ initial: '7', sm: '8', md: '9' }}
        weight="bold"
        className="break-words"
      >
        {title}
      </Heading>
      <Text
        size={{ initial: '2', sm: '3' }}
        color="gray"
        className="block max-w-prose"
      >
        {body}
      </Text>
    </div>
  )
}
