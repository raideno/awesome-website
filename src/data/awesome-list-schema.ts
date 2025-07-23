import { z } from 'zod'

export const CategorySchema = z.object({
  name: z.string(),
  slug: z.string(),
  icon: z.string(),
})
export type Category = z.infer<typeof CategorySchema>

export const UrlLinkSchema = z.object({
  url: z.string().url(),
  label: z.string(),
})
export type UrlLink = z.infer<typeof UrlLinkSchema>

export const ElementSchema = z.object({
  name: z.string(),
  description: z.string(),
  content: z.string(),
  urls: z.array(UrlLinkSchema),
  thumbnail: z.string().optional(),
  category: z.string(),
  stars: z.number().optional(),
  tags: z.array(z.string()),
})
export type Element = z.infer<typeof ElementSchema>

export const AwesomeListLinkSchema = z.object({
  label: z.string(),
  url: z.string().url(),
})
export type AwesomeListLink = z.infer<typeof AwesomeListLinkSchema>

export const AwesomeListSchema = z.object({
  mode: z.enum(['table', 'detailed', 'minimal']),
  title: z.string(),
  description: z.string(),
  version: z.string(),
  tags: z.array(z.string()),
  author: z.string(),
  contributors: z.array(z.string()).optional(),
  date: z.string(),
  last_updated: z.string(),
  repository: z.string().url(),
  website: z.string().url(),
  thumbnail: z.string().optional(),
  categories: z.array(CategorySchema),
  elements: z.array(ElementSchema),
  links: z.array(AwesomeListLinkSchema).optional(),
})
export type AwesomeList = z.infer<typeof AwesomeListSchema>
