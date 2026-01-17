import { MetadataRegistry } from '@raideno/auto-form/registry'
import { z } from 'zod/v4'

export const AwesomeListElementSchema = z.object({
  name: z.string().max(128),
  description: z.string().max(192),
  notes: z.string().optional().register(MetadataRegistry, { type: 'textarea' }),
  link: z.url().optional(),
  tags: z.array(z.string()).max(16),
  group: z.string().max(64).optional(),
})
export type AwesomeListElement = z.infer<typeof AwesomeListElementSchema>

export const AwesomeListSchema = z.object({
  title: z.string().max(128),
  description: z.string().max(192),
  author: z.string().max(64),
  thumbnail: z.string().optional(),
  elements: z.array(AwesomeListElementSchema),
  links: z.array(z.url()).max(4).optional(),
})
export type AwesomeList = z.infer<typeof AwesomeListSchema>

export const AwesomeListMetadata = AwesomeListSchema.omit({
  elements: true,
})

export type AwesomeListWithoutLinks = z.infer<typeof AwesomeListMetadata>
