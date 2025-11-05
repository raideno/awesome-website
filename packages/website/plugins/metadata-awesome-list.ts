import type { Plugin } from 'vite'

import type { AwesomeList } from '../src/types/awesome-list'

export const METADATA_ELEMENT_IDS = {
  PAGE_TITLE: 'page-title',
  PAGE_DESCRIPTION: 'page-description',
  OG_TITLE: 'og-title',
  OG_DESCRIPTION: 'og-description',
  OG_URL: 'og-url',
  OG_IMAGE: 'og-image',
  TWITTER_TITLE: 'twitter-title',
  TWITTER_DESCRIPTION: 'twitter-description',
  TWITTER_IMAGE: 'twitter-image',
  AUTHOR: 'author',
  ARTICLE_AUTHOR: 'article-author',
} as const

export type MetadataElementId =
  (typeof METADATA_ELEMENT_IDS)[keyof typeof METADATA_ELEMENT_IDS]

export default (awesomeList: AwesomeList, url: string): Plugin => {
  return {
    name: 'metadata-awesome-list',
    enforce: 'pre',

    transformIndexHtml(_html, _context) {
      const { title, description, thumbnail, author } = awesomeList

      const tags: Array<{
        tag: string
        attrs?: Record<string, string>
        children?: string
      }> = [
        {
          tag: 'title',
          attrs: { id: METADATA_ELEMENT_IDS.PAGE_TITLE },
          children: title,
        },
        {
          tag: 'meta',
          attrs: {
            id: METADATA_ELEMENT_IDS.PAGE_DESCRIPTION,
            name: 'description',
            content: description,
          },
        },
        {
          tag: 'meta',
          attrs: {
            id: METADATA_ELEMENT_IDS.OG_TITLE,
            property: 'og:title',
            content: title,
          },
        },
        {
          tag: 'meta',
          attrs: {
            id: METADATA_ELEMENT_IDS.OG_DESCRIPTION,
            property: 'og:description',
            content: description,
          },
        },
        {
          tag: 'meta',
          attrs: {
            id: METADATA_ELEMENT_IDS.OG_URL,
            property: 'og:url',
            content: url,
          },
        },
        {
          tag: 'meta',
          attrs: {
            id: METADATA_ELEMENT_IDS.TWITTER_TITLE,
            name: 'twitter:title',
            content: title,
          },
        },
        {
          tag: 'meta',
          attrs: {
            id: METADATA_ELEMENT_IDS.TWITTER_DESCRIPTION,
            name: 'twitter:description',
            content: description,
          },
        },
      ]

      if (author) {
        tags.push(
          {
            tag: 'meta',
            attrs: {
              id: METADATA_ELEMENT_IDS.AUTHOR,
              name: 'author',
              content: author,
            },
          },
          {
            tag: 'meta',
            attrs: {
              id: METADATA_ELEMENT_IDS.ARTICLE_AUTHOR,
              property: 'article:author',
              content: author,
            },
          },
        )
      }

      if (thumbnail) {
        tags.push(
          {
            tag: 'meta',
            attrs: {
              id: METADATA_ELEMENT_IDS.OG_IMAGE,
              property: 'og:image',
              content: thumbnail,
            },
          },
          {
            tag: 'meta',
            attrs: {
              id: METADATA_ELEMENT_IDS.TWITTER_IMAGE,
              name: 'twitter:image',
              content: thumbnail,
            },
          },
        )
      }

      return tags
    },
  }
}
