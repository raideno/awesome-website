import type { Plugin } from 'vite'
import type { AwesomeList } from '../src/types/awesome-list'

export default (awesomeList: AwesomeList, url: string): Plugin => {
  return {
    name: 'metadata-awesome-list',
    enforce: 'pre',

    transformIndexHtml(_html, _context) {
      const { title, description, thumbnail, author } = awesomeList

      const tags = [
        {
          tag: 'title',
          attrs: { id: 'page-title' },
          children: title,
        },
        {
          tag: 'meta',
          attrs: {
            id: 'page-description',
            name: 'description',
            content: description,
          },
        },
        {
          tag: 'meta',
          attrs: { id: 'og-title', property: 'og:title', content: title },
        },
        {
          tag: 'meta',
          attrs: {
            id: 'og-description',
            property: 'og:description',
            content: description,
          },
        },
        {
          tag: 'meta',
          attrs: { id: 'og-url', property: 'og:url', content: url },
        },
        {
          tag: 'meta',
          attrs: { id: 'twitter-title', name: 'twitter:title', content: title },
        },
        {
          tag: 'meta',
          attrs: {
            id: 'twitter-description',
            name: 'twitter:description',
            content: description,
          },
        },
      ]

      if (author) {
        tags.push(
          {
            tag: 'meta',
            attrs: { id: 'author', name: 'author', content: author },
          },
          {
            tag: 'meta',
            attrs: {
              id: 'article-author',
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
              id: 'og-image',
              property: 'og:image',
              content: thumbnail,
            },
          },
          {
            tag: 'meta',
            attrs: {
              id: 'twitter-image',
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
