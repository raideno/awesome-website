import _ from 'lodash'
import z from 'zod/v4'

import { MetadataRegistry } from './registry'

import type { FieldMetadata } from './registry'
import type { FieldConfig, FieldGroup } from './context'

export const zodTypeGuards = {
  string: (schema: z.ZodTypeAny): schema is z.ZodString =>
    schema.def.type === 'string',
  number: (schema: z.ZodTypeAny): schema is z.ZodNumber =>
    schema.def.type === 'number',
  boolean: (schema: z.ZodTypeAny): schema is z.ZodBoolean =>
    schema.def.type === 'boolean',
  union: (schema: z.ZodTypeAny): schema is z.ZodUnion<any> =>
    schema.def.type === 'union',
  enum: (schema: z.ZodTypeAny): schema is z.ZodEnum<any> =>
    schema.def.type === 'enum',
  object: (schema: z.ZodTypeAny): schema is z.ZodObject<any> =>
    schema.def.type === 'object',
  array: (schema: z.ZodTypeAny): schema is z.ZodArray<any> =>
    schema.def.type === 'array',
  optional: (schema: z.ZodTypeAny): schema is z.ZodOptional<any> =>
    schema.def.type === 'optional',
  nullable: (schema: z.ZodTypeAny): schema is z.ZodNullable<any> =>
    schema.def.type === 'nullable',
  date: (schema: z.ZodTypeAny): schema is z.ZodDate =>
    schema.def.type === 'date',
}

export const DEFAULT_PLACEHOLDERS = {
  text: 'Enter text',
  textarea: 'Enter detailed text',
  email: 'Enter email address',
  password: 'Enter password',
  url: 'Enter URL (https://example.com)',
  number: 'Enter number',
  date: 'Select date',
  'datetime-local': 'Select date and time',
  tags: 'Enter tags and press Enter',
  select: 'Select an option',
  file: 'Upload a file',
  files: 'Upload multiple files',
} as const

export const getConstraint = (
  checks: Array<z.core.$ZodCheck<never>>,
  checkType: string,
): number | undefined => {
  const check = checks.find((check_) => check_._zod.def.check === checkType)

  if (!check) return undefined

  switch (checkType) {
    case 'max_length':
      if ('maximum' in check._zod.def)
        return (check as z.core.$ZodCheckMaxLength)._zod.def.maximum
      return undefined
      break
    case 'min_length':
      if ('minimum' in check._zod.def)
        return (check as z.core.$ZodCheckMinLength)._zod.def.minimum
      return undefined
      break
    default:
      return undefined
  }

  return undefined
}

export const unwrapZodType = (zodType: z.ZodTypeAny): z.ZodTypeAny => {
  let baseType = zodType
  while (zodTypeGuards.optional(baseType) || zodTypeGuards.nullable(baseType)) {
    baseType = baseType.def.innerType
  }
  return baseType
}

export const inferTypeFromKey = (
  key: string,
  currentType: string,
): { type: string; placeholder: string } => {
  const keyLower = key.toLowerCase()
  const typeMap = [
    {
      keywords: ['password'],
      type: 'password',
      placeholder: DEFAULT_PLACEHOLDERS.password,
    },
    {
      keywords: ['date'],
      excludes: ['update'],
      type: 'date',
      placeholder: DEFAULT_PLACEHOLDERS.date,
    },
    {
      keywords: ['url', 'href', 'link'],
      type: 'url',
      placeholder: DEFAULT_PLACEHOLDERS.url,
    },
    {
      keywords: ['email'],
      type: 'email',
      placeholder: DEFAULT_PLACEHOLDERS.email,
    },
  ]

  for (const { keywords, excludes = [], type, placeholder } of typeMap) {
    if (
      keywords.some((k) => keyLower.includes(k)) &&
      !excludes.some((e) => keyLower.includes(e)) &&
      currentType === 'text'
    ) {
      return { type, placeholder }
    }
  }
  return {
    type: currentType,
    placeholder: Object.keys(DEFAULT_PLACEHOLDERS).includes(currentType)
      ? DEFAULT_PLACEHOLDERS[currentType as keyof typeof DEFAULT_PLACEHOLDERS]
      : DEFAULT_PLACEHOLDERS.text,
  }
}

export const getFieldType = (key: string, zodType: unknown): FieldConfig => {
  if (!(zodType instanceof z.ZodType)) {
    throw new Error(`Expected ZodType for key "${key}", got ${typeof zodType}`)
  }

  //   const meta = (zodType.meta() || {}) as FieldMetadata
  const meta = MetadataRegistry.get(zodType) || ({} as FieldMetadata)
  const label = meta.label || _.startCase(key)
  const baseType = unwrapZodType(zodType)

  let fieldType = meta.type || 'text'
  let placeholder = meta.placeholder
  let options: Array<string> | undefined
  let maxLength: number | undefined

  if (zodTypeGuards.boolean(baseType) || meta.type === 'switch') {
    fieldType = 'switch'
    placeholder = ''
  } else if (zodTypeGuards.array(baseType)) {
    if (meta.type === 'file' || meta.type === 'files') {
      fieldType = 'file'
      placeholder =
        placeholder ||
        (meta.type === 'files'
          ? DEFAULT_PLACEHOLDERS.files
          : DEFAULT_PLACEHOLDERS.file)
    } else {
      fieldType = 'tags'
      placeholder = placeholder || DEFAULT_PLACEHOLDERS.tags
      const checks = baseType.def.checks || []
      maxLength = getConstraint(checks, 'max_length')
    }
  } else if (
    zodTypeGuards.string(baseType) &&
    (meta.type === 'file' || key.toLowerCase().includes('file'))
  ) {
    fieldType = 'file'
    placeholder = placeholder || DEFAULT_PLACEHOLDERS.file
  } else if (zodTypeGuards.enum(baseType)) {
    fieldType = 'select'
    placeholder = placeholder || DEFAULT_PLACEHOLDERS.select
    options = baseType.options
  } else if (zodTypeGuards.string(baseType)) {
    const checks = baseType.def.checks || []
    const maxConstraint = getConstraint(checks, 'max_length')
    const minConstraint = getConstraint(checks, 'min_length')

    if (maxConstraint) maxLength = maxConstraint

    const TEXTAREA_THRESHOLD = 200
    if (
      (minConstraint && minConstraint > TEXTAREA_THRESHOLD) ||
      (maxConstraint && maxConstraint > TEXTAREA_THRESHOLD) ||
      meta.type === 'textarea'
    ) {
      fieldType = 'textarea'
      placeholder = placeholder || DEFAULT_PLACEHOLDERS.textarea
    } else {
      const formatChecks = [
        { check: 'url', type: 'url', placeholder: DEFAULT_PLACEHOLDERS.url },
        {
          check: 'email',
          type: 'email',
          placeholder: DEFAULT_PLACEHOLDERS.email,
        },
      ]

      for (const {
        check,
        type,
        placeholder: formatPlaceholder,
      } of formatChecks) {
        if (checks.some((c) => c._zod.def.check === check)) {
          fieldType = type
          placeholder = placeholder || formatPlaceholder
          break
        }
      }

      if (key.toLowerCase().includes('password')) {
        fieldType = 'password'
        placeholder = placeholder || DEFAULT_PLACEHOLDERS.password
      }
    }
  } else if (zodTypeGuards.date(baseType)) {
    fieldType = 'date'
    placeholder = placeholder || DEFAULT_PLACEHOLDERS.date
  } else if (zodTypeGuards.number(baseType)) {
    fieldType = 'number'
    placeholder = placeholder || DEFAULT_PLACEHOLDERS.number
  }

  if (!meta.placeholder) {
    const inferred = inferTypeFromKey(key, fieldType)
    fieldType = inferred.type
    placeholder = placeholder || inferred.placeholder
  }

  return {
    key,
    type: fieldType,
    label,
    placeholder: placeholder || DEFAULT_PLACEHOLDERS.text,
    halfWidth: meta.halfWidth || false,
    maxLength,
    options,
    meta,
  }
}

export const groupFields = (fields: Array<FieldConfig>): Array<FieldGroup> => {
  const fieldGroups: Array<FieldGroup> = []
  let currentGroup: Array<FieldConfig> = []

  fields.forEach((field) => {
    if (field.halfWidth) {
      currentGroup.push(field)
      if (currentGroup.length === 2) {
        fieldGroups.push([...currentGroup])
        currentGroup = []
      }
    } else {
      if (currentGroup.length > 0) {
        fieldGroups.push([...currentGroup])
        currentGroup = []
      }
      fieldGroups.push([field])
    }
  })

  if (currentGroup.length > 0) {
    fieldGroups.push([...currentGroup])
  }

  return fieldGroups
}
