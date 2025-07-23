import React from 'react'

import { GitHubLogoIcon } from '@radix-ui/react-icons'
import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Text,
} from '@radix-ui/themes'

import { getList } from '@/data/awesome-list'

export interface HeaderProps {}

const MAX_HEADER_TAGS = 4

export const Header: React.FC<HeaderProps> = () => {
  const list = getList()

  const [showAllHeaderTags, setShowAllHeaderTags] = React.useState(false)

  const tags = showAllHeaderTags
    ? list.tags
    : list.tags.slice(0, MAX_HEADER_TAGS)

  return (
    <Flex
      gap={'4'}
      direction={'column'}
      align={'center'}
      className="w-full text-center mb-12"
    >
      <Text size={'2'} color={'gray'}>
        Version {list.version} • By {list.author} • Updated {list.last_updated}
      </Text>

      <Flex
        className="w-full max-w-2xl"
        direction={'row'}
        wrap={'wrap'}
        justify={'center'}
        align={'center'}
        gap={'2'}
      >
        {tags.map((tag) => (
          <Badge variant="solid" size={'3'} key={tag}>
            {tag}
          </Badge>
        ))}
        {list.tags.length > MAX_HEADER_TAGS && (
          <Button
            className="!cursor-pointer"
            variant="outline"
            size={'1'}
            onClick={() => setShowAllHeaderTags((prev) => !prev)}
          >
            {showAllHeaderTags
              ? 'Show Less'
              : `+${list.tags.length - MAX_HEADER_TAGS} more`}
          </Button>
        )}
      </Flex>

      <Heading size={'8'} weight={'bold'}>
        {list.title}
      </Heading>

      <Text className="text-center max-w-3xl" as="p">
        {list.description}
      </Text>

      {list.thumbnail && (
        <Box className="w-full max-w-2xl">
          <AspectRatio
            ratio={16 / 9}
            className="rounded-[var(--radius-4)] overflow-hidden ring-2 ring-[var(--accent-9)] border border-[var(--accent-9)] transition-all"
          >
            <img
              src={list.thumbnail}
              alt={`${list.title} thumbnail`}
              className="w-full h-full object-cover"
            />
          </AspectRatio>
        </Box>
      )}

      <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
        <Link rel="noopener noreferrer" href={list.repository} target="_blank">
          <Button className="!cursor-pointer" size={'3'} variant="classic">
            <GitHubLogoIcon />
            View on GitHub
          </Button>
        </Link>
        {list.links &&
          list.links.map((link, idx) => (
            <Link
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                color="gray"
                className="!cursor-pointer"
                variant="surface"
                size={'3'}
              >
                {link.label}
              </Button>
            </Link>
          ))}
      </div>
    </Flex>
  )
}
