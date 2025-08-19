import { z } from 'zod/v4'

// NOTE: moved into here in order to keep @ imports in auto.tsx and still be able to import registry at build time as @ imports aren't resolved yet

export type FieldMetadata = {
  disabled?: boolean | ((values: any) => boolean)
  hidden?: boolean | ((values: any) => boolean)
  readonly?: boolean | ((values: any) => boolean)
  placeholder?: string
  description?: string
  label?: string
  halfWidth?: boolean
  type?: string | 'file' | 'files'
  // --- --- --- --- --- ---
  accept?: string
  maxFiles?: number
  maxSize?: number
}

// NOTE: metadata only applicable to string or number fields
// https://zod.dev/metadata?id=referencing-inferred-types
export const MetadataRegistry = z.registry<
  FieldMetadata,
  // z.ZodString | z.ZodNumber | z.ZodBoolean | z.ZodArray
  | z.ZodType
  | z.ZodString
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodArray
  | z.ZodOptional<any>
>()
