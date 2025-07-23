import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { Flex, Link, Text } from '@radix-ui/themes'

import type React from 'react'

export interface FooterProps {}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <Flex direction="column" align="center" gap="2" py="8" mt="12">
      <Flex align="center" gap="2">
        <Text size="2" color="gray">
          Made with ❤️ by
        </Text>
        <Link href="https://github.com/raideno/awesome-site" target="_blank">
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
