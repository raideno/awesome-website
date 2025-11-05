import { Heading, Text } from '@radix-ui/themes'
import React from 'react'

export interface PageHeaderProps {
  title: string
  body: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, body }) => {
  return (
    <div className="space-y-2">
      <Heading size="6" weight="bold">
        {title}
      </Heading>
      <Text size="3" color="gray">
        {body}
      </Text>
    </div>
  )
}
