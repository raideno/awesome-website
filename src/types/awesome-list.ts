import { z } from 'zod/v4'

export const ElementSchema = z.object({
  name: z.string().max(64),
  description: z.string().meta({ type: 'textarea' }).max(512),
  urls: z.array(z.url()).max(4),
  tags: z.array(z.string()).max(16),
})
export type Element = z.infer<typeof ElementSchema>

export const AwesomeListSchema = z.object({
  title: z.string().max(64),
  description: z.string().max(512).meta({ type: 'textarea' }),
  author: z.string().max(64),
  thumbnail: z.string().optional(),
  elements: z.array(ElementSchema),
  links: z.array(z.url()).max(8).optional(),
})
export type AwesomeList = z.infer<typeof AwesomeListSchema>

export const AwesomeListMetadata = AwesomeListSchema.omit({
  elements: true,
})

export type AwesomeListWithoutLinks = z.infer<typeof AwesomeListMetadata>
