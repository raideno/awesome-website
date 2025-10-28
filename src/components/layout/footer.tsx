import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { Flex, Link, Text } from '@radix-ui/themes'

import type React from 'react'

const AWESOME_WEBSITE_REPOSITORY_URL =
  'https://github.com/raideno/awesome-website'

export interface FooterProps {}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <Flex className="pb-32" direction="column" align="center" gap="2" pt="8">
      <Flex align="center" gap="2">
        <Text size="2" color="gray">
          Made with ❤️ by
        </Text>
        <Link href={AWESOME_WEBSITE_REPOSITORY_URL} target="_blank">
          <Flex align="center" gap="1">
            <GitHubLogoIcon />
            <Text
              className="underline hover:opacity-75 transition-opacity"
              weight={'bold'}
              size="2"
            >
              Awesome Site
            </Text>
          </Flex>
        </Link>
      </Flex>
    </Flex>
  )
}
