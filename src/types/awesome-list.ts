import { z } from 'zod/v4'

import { MetadataRegistry } from '../components/modules/form/registry'

export const AwesomeListElementSchema = z.object({
  name: z.string().max(128),
  description: z
    .string()
    .register(MetadataRegistry, { type: 'textarea' })
    .max(512),
  links: z
    .array(
      z.union([
        z.url(),
        z.object({
          url: z.url(),
          label: z.string().max(64),
        }),
      ]),
    )
    .max(4)
    .optional(),
  tags: z.array(z.string()).max(16),
})
export type AwesomeListElement = z.infer<typeof AwesomeListElementSchema>

export const AwesomeListSchema = z.object({
  title: z.string().max(128),
  description: z
    .string()
    .max(512)
    .register(MetadataRegistry, { type: 'textarea' }),
  author: z.string().max(64),
  thumbnail: z.string().optional(),
  elements: z.array(AwesomeListElementSchema),
  links: z
    .array(
      z.union([
        z.url(),
        z.object({
          url: z.url(),
          label: z.string().max(64),
        }),
      ]),
    )
    .max(4)
    .optional(),
})
export type AwesomeList = z.infer<typeof AwesomeListSchema>

export const AwesomeListMetadata = AwesomeListSchema.omit({
  elements: true,
})

export type AwesomeListWithoutLinks = z.infer<typeof AwesomeListMetadata>
