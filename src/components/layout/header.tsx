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
import { useList } from '@/context/list'

export interface HeaderProps {}

const MAX_HEADER_TAGS = 4

export const Header: React.FC<HeaderProps> = () => {
  const list = useList()

  const [showAllHeaderTags, setShowAllHeaderTags] = React.useState(false)

  const tags = showAllHeaderTags
    ? list.allTags
    : list.allTags.slice(0, MAX_HEADER_TAGS)

  return (
    <Flex
      gap={'4'}
      direction={'column'}
      align={'center'}
      className="w-full text-center mb-12"
    >
      <Text size={'2'} color={'gray'}>
        By {list.content.new.author} • Updated{' '}
        {new Date(__BUILD_TIME__).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}{' '}
        at{' '}
        {new Date(__BUILD_TIME__).toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        })}
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
        {list.allTags.length > MAX_HEADER_TAGS && (
          <Button
            className="!cursor-pointer"
            variant="outline"
            size={'1'}
            onClick={() => setShowAllHeaderTags((prev) => !prev)}
          >
            {showAllHeaderTags
              ? 'Show Less'
              : `+${list.allTags.length - MAX_HEADER_TAGS} more`}
          </Button>
        )}
      </Flex>

      <Heading size={'8'} weight={'bold'}>
        {list.content.new.title}
      </Heading>

      <Text className="text-center max-w-3xl" as="p">
        {list.content.new.description}
      </Text>

      {list.content.new.thumbnail && (
        <Box className="w-full max-w-2xl">
          <AspectRatio
            ratio={16 / 9}
            className="rounded-[var(--radius-4)] overflow-hidden ring-2 ring-[var(--accent-9)] border border-[var(--accent-9)] transition-all"
          >
            <img
              src={list.content.new.thumbnail}
              alt={`${list.content.new.title} thumbnail`}
              className="w-full h-full object-cover"
            />
          </AspectRatio>
        </Box>
      )}

      <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
        <Link
          rel="noopener noreferrer"
          href={__REPOSITORY_URL__}
          target="_blank"
        >
          <Button className="!cursor-pointer" size={'3'} variant="classic">
            <GitHubLogoIcon />
            View on GitHub
          </Button>
        </Link>
        {list.content.new.links &&
          list.content.new.links.map((link, idx) => {
            // const url = typeof link === 'string' ? link : link.url
            const url = link
            // const label = typeof link === 'string' ? link : link.label
            const label = link

            return (
              <Link
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  color="gray"
                  className="!cursor-pointer"
                  variant="surface"
                  size={'3'}
                >
                  <Text className="line-clamp-1">{label}</Text>
                </Button>
              </Link>
            )
          })}
      </div>
    </Flex>
  )
}
