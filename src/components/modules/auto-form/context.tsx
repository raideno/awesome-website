import { createContext, useContext } from 'react'

import type { z } from 'zod/v4'
import type { UseFormReturn } from 'react-hook-form'

import type { FieldMetadata } from './registry'

export interface AutoFormContextValue<
  TSchemaType extends z.ZodObject<any, any>,
> {
  form: UseFormReturn<
    z.core.output<TSchemaType>,
    any,
    z.core.output<TSchemaType>
  >
  schema: TSchemaType
  isSubmitLoading: boolean
  isCancelLoading: boolean
  handleSubmit: (values: z.infer<TSchemaType>) => unknown
  handleCancel: () => unknown
  fields: Array<FieldConfig>
  fieldGroups: Array<FieldGroup>
  labels: boolean
}

export interface FieldConfig {
  key: string
  type: string
  label: string
  placeholder: string
  halfWidth: boolean
  maxLength?: number
  options?: Array<string>
  meta?: FieldMetadata
}

export type FieldGroup = Array<FieldConfig>

export const AutoFormContext = createContext<AutoFormContextValue<any> | null>(
  null,
)

export function useAutoForm<TSchemaType extends z.ZodObject<any, any>>() {
  const context = useContext(AutoFormContext)
  if (!context) {
    throw new Error('useAutoForm must be used within an AutoForm.Root')
  }
  return context as AutoFormContextValue<TSchemaType>
}
