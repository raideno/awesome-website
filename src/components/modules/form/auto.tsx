import * as z from 'zod/v4'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import _ from 'lodash'
import { createContext, useContext, useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Flex,
  ScrollArea,
  Select,
  Switch,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes'

import { useForm } from 'react-hook-form'

import type React from 'react'
import type {
  FieldValues,
  Path,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form'
// import { useToast } from "@/hooks/use-toast"; // Keep commented if not used/implemented
import type { ButtonProps } from '@radix-ui/themes'
import type { FieldMetadata } from './registry'
// import type * as z from 'zod/v4'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form' // Assuming these are Shadcn UI form components

import { FileUpload } from '@/components/ui/file-upload'

import { cn } from '@/lib/utils'
import { TagInput } from '@/components/ui/tag-input'
// import { MetadataRegistry } from './registery'

const isZodString = (schema: z.ZodTypeAny): schema is z.ZodString =>
  schema.def.type === 'string'

const isZodNumber = (schema: z.ZodTypeAny): schema is z.ZodNumber =>
  schema.def.type === 'number'

const isZodBoolean = (schema: z.ZodTypeAny): schema is z.ZodBoolean =>
  schema.def.type === 'boolean'

const isZodEnum = (schema: z.ZodTypeAny): schema is z.ZodEnum<any> =>
  schema.def.type === 'enum'

// const isZodNativeEnum = (schema: z.ZodTypeAny): schema is z.ZodEnum<any> =>
//   schema.def.type === 'enum'

const isZodObject = (schema: z.ZodTypeAny): schema is z.ZodObject<any> =>
  schema.def.type === 'object'

const isZodArray = (schema: z.ZodTypeAny): schema is z.ZodArray<any> =>
  schema.def.type === 'array'

const isZodOptional = (schema: z.ZodTypeAny): schema is z.ZodOptional<any> =>
  schema.def.type === 'optional'

const isZodNullable = (schema: z.ZodTypeAny): schema is z.ZodNullable<any> =>
  schema.def.type === 'nullable'

const isZodDate = (schema: z.ZodTypeAny): schema is z.ZodDate =>
  schema.def.type === 'date'

// --- Context ---

// Use generic FieldValues for better type compatibility with react-hook-form
interface AutoFormContextValue<TSchemaType extends z.ZodObject<any, any>> {
  // TODO: reset type
  // form: any
  form: UseFormReturn<
    z.core.output<TSchemaType>,
    any,
    z.core.output<TSchemaType>
  >
  // form: UseFormReturn<z.infer<TSchemaType>>;
  schema: TSchemaType
  isSubmitLoading: boolean
  isCancelLoading: boolean
  handleSubmit: (values: z.infer<TSchemaType>) => unknown
  handleCancel: () => unknown
  fields: Array<FieldConfig>
  fieldGroups: Array<FieldGroup>
  labels: boolean
}

interface FieldConfig {
  key: string
  type: string
  label: string
  placeholder: string
  halfWidth: boolean
  maxLength?: number
  options?: Array<string>
  meta?: FieldMetadata
}

type FieldGroup = Array<FieldConfig>

// Use a more specific generic type if possible, but 'any' works for broad compatibility
const AutoFormContext = createContext<AutoFormContextValue<any> | null>(null)

function useAutoForm<TSchemaType extends z.ZodObject<any, any>>() {
  const context = useContext(AutoFormContext)
  if (!context) {
    throw new Error('useAutoForm must be used within an AutoForm.Root')
  }
  // Cast the context value back to the specific schema type
  return context as AutoFormContextValue<TSchemaType>
}

// --- Constants ---

const DEFAULT_PLACEHOLDERS = {
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
}

interface RootProps_<TSchemaType extends z.ZodObject<any, any>> {
  schema: TSchemaType
  // TODO: some fields such as tags expect a specific format, thus the default values should account for it and not expect the exact format of the schema
  // defaultValues?: Partial<z.infer<TSchemaType>>
  defaultValues?: z.output<TSchemaType>
  onSubmit: (values: z.infer<TSchemaType>) => Promise<void> | void
  onCancel?: () => void
  onError?: () => void // New callback for validation errors
  onChange?: (values: z.infer<TSchemaType>) => void // New callback for form value changes
  className?: string
  children: React.ReactNode
  labels?: boolean
}

function Root_<TSchemaType extends z.ZodObject<any, any>>({
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  onError, // New prop
  onChange, // New prop for value changes
  className = '',
  children,
  labels = true,
}: RootProps_<TSchemaType>) {
  // const { toast } = useToast(); // Uncomment if using toast
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false)
  const [isCancelLoading, setIsCancelLoading] = useState<boolean>(false)

  // Ensure the passed schema is a ZodObject before proceeding
  if (!isZodObject(schema)) {
    console.error(
      'AutoForm Error: The provided schema must be an instance of z.ZodObject.',
    )
    // Render an error message or throw an error
    return (
      <div className="text-red-500 p-4 border border-red-500 rounded">
        AutoForm Error: Schema must be a ZodObject.
      </div>
    )
  }

  type FormValues = z.infer<TSchemaType>

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: defaultValues && (async () => await defaultValues),
  })

  // Watch for form changes and trigger onChange callback
  useEffect(() => {
    if (onChange) {
      const subscription = form.watch((value) => {
        onChange(value as z.infer<TSchemaType>)
      })
      return () => subscription.unsubscribe()
    }
  }, [form, onChange])

  const handleSubmitWrapper: SubmitHandler<FormValues> = async (values) => {
    if (isSubmitLoading || isCancelLoading) return

    try {
      setIsSubmitLoading(true)
      await onSubmit(values)
    } catch (error) {
      // Catch any error
      console.error('[form-submission](error):', error)
      // toast({ // Uncomment if using toast
      //   variant: "destructive",
      //   title: "Something went wrong",
      //   description: error.message || "Please try again.",
      // });
    } finally {
      setIsSubmitLoading(false)
    }
  }

  const handleErrorWrapper: SubmitErrorHandler<FormValues> = (errors) => {
    console.log('[form-errors]:', errors)

    if (isSubmitLoading || isCancelLoading) return // Check loading state here too

    // Call the onError callback if provided
    if (onError) {
      onError()
    }

    // toast({ // Uncomment if using toast
    //   variant: "destructive",
    //   title: "Validation Errors",
    //   description: "Please check the highlighted fields for errors.",
    // });
  }

  const handleCancelWrapper = async () => {
    if (isCancelLoading || isSubmitLoading) return

    try {
      setIsCancelLoading(true)
      if (onCancel) {
        await Promise.resolve(onCancel()) // Allow async onCancel
      } else {
        // Default cancel behavior: reset the form to default values
        form.reset(defaultValues as FormValues)
      }
    } catch (error) {
      console.error('[form-submission](error):', error)
      // toast({ // Uncomment if using toast
      //   variant: "destructive",
      //   title: "Something went wrong during cancel",
      //   description: error.message || "Please try again.",
      // });
    } finally {
      setIsCancelLoading(false)
    }
  }

  // Get schema shape for Zod v4
  const zodShape = schema.shape

  const getMaxConstraint = (
    checks: Array<z.core.$ZodCheck<never>>,
  ): number | undefined => {
    const maxCheck = checks.find(
      (check) => check._zod.def.check === 'max_length',
    )

    if (maxCheck)
      return (maxCheck as unknown as z.core.$ZodCheckMaxLength)._zod.def.maximum

    return undefined
  }

  const getMinConstraint = (
    checks: Array<z.core.$ZodCheck<never>>,
  ): number | undefined => {
    const minCheck = checks.find(
      (check) => check._zod.def.check === 'min_length',
    )

    if (minCheck)
      return (minCheck as unknown as z.core.$ZodCheckMinLength)._zod.def.minimum

    return undefined
  }

  const getFieldType = (
    key: string,
    zodType: unknown | z.ZodTypeAny,
  ): FieldConfig => {
    if (!(zodType instanceof z.ZodType)) {
      throw new Error(
        `Expected ZodType for key "${key}", got ${typeof zodType}`,
      )
    }

    const meta = (zodType.meta() || {}) as FieldMetadata

    // console.log("[meta]:", meta);

    const label = meta.label || _.startCase(key)

    // Base properties
    const fieldProps: Omit<FieldConfig, 'key'> = {
      type: meta.type || 'text',
      label,
      placeholder: meta.placeholder || DEFAULT_PLACEHOLDERS.text,
      halfWidth: meta.halfWidth || false,
      maxLength: undefined,
      options: undefined,
      meta,
    }

    // --- Type Determination Logic ---
    // Unwrap optional/nullable types to get the base type for checks
    let baseType = zodType
    while (isZodOptional(baseType) || isZodNullable(baseType)) {
      baseType = baseType.def.innerType
    }

    if (isZodBoolean(baseType) || meta.type === 'switch') {
      fieldProps.type = 'switch'
      fieldProps.placeholder = '' // Switches don't have placeholders
    } else if (isZodArray(baseType)) {
      // Check if this is a file array by looking at the element type or meta
      // const elementType = baseType.def.type
      if (meta.type === 'file' || meta.type === 'files') {
        fieldProps.type = 'file'
        fieldProps.placeholder =
          meta.placeholder ||
          (meta.type === 'files'
            ? DEFAULT_PLACEHOLDERS.files
            : DEFAULT_PLACEHOLDERS.file)
      } else {
        fieldProps.type = 'tags'
        fieldProps.placeholder = meta.placeholder || DEFAULT_PLACEHOLDERS.tags

        const checks = baseType.def.checks || []

        const maxConstraint = getMaxConstraint(checks)
        // const minConstraint = getMinConstraint(checks)

        if (maxConstraint) fieldProps.maxLength = maxConstraint
      }
    } else if (
      isZodString(baseType) &&
      (meta.type === 'file' || key.toLowerCase().includes('file'))
    ) {
      fieldProps.type = 'file'
      fieldProps.placeholder = meta.placeholder || DEFAULT_PLACEHOLDERS.file
    } else if (isZodEnum(baseType)) {
      fieldProps.type = 'select'
      fieldProps.placeholder = meta.placeholder || DEFAULT_PLACEHOLDERS.select
      // fieldProps.options = baseType.def.values;
      fieldProps.options = baseType.options
    }
    // else if (isZodNativeEnum(baseType)) {
    //   fieldProps.type = "select";
    //   fieldProps.placeholder = meta.placeholder || DEFAULT_PLACEHOLDERS.select;
    //   // Filter out numeric keys if it's a mixed enum
    //   fieldProps.options = Object.values(baseType.def.values).filter(
    //     (v) => typeof v === "string"
    //   );
    // }
    else if (isZodString(baseType)) {
      const checks = baseType.def.checks || []

      const maxConstraint = getMaxConstraint(checks)
      const minConstraint = getMinConstraint(checks)

      if (maxConstraint) fieldProps.maxLength = maxConstraint

      // Heuristic for textarea: min length > threshold or max length > threshold
      const TEXTAREA_THRESHOLD = 200 // Adjust as needed
      if (
        (minConstraint && minConstraint > TEXTAREA_THRESHOLD) ||
        (maxConstraint && maxConstraint > TEXTAREA_THRESHOLD) ||
        // NOTE: added recently
        meta.type === 'textarea'
      ) {
        fieldProps.type = 'textarea'
        fieldProps.placeholder =
          meta.placeholder || DEFAULT_PLACEHOLDERS.textarea
      } else {
        // Check specific string formats
        // if (checks.some((c) => c.kind === "url")) {
        if (checks.some((c) => c._zod.def.check === 'url')) {
          fieldProps.type = 'url'
          fieldProps.placeholder = meta.placeholder || DEFAULT_PLACEHOLDERS.url
        } else if (checks.some((c) => c._zod.def.check === 'email')) {
          fieldProps.type = 'email'
          fieldProps.placeholder =
            meta.placeholder || DEFAULT_PLACEHOLDERS.email
        } else if (key.toLowerCase().includes('password')) {
          // Also check key name
          fieldProps.type = 'password'
          fieldProps.placeholder =
            meta.placeholder || DEFAULT_PLACEHOLDERS.password
        }
      }
    } else if (isZodDate(baseType)) {
      fieldProps.type = 'date'
      fieldProps.placeholder = meta.placeholder || DEFAULT_PLACEHOLDERS['date']
    } else if (isZodNumber(baseType)) {
      fieldProps.type = 'number'
      fieldProps.placeholder = meta.placeholder || DEFAULT_PLACEHOLDERS.number
    }

    // --- Placeholder Overrides based on Name (if not set by meta) ---
    if (!meta.placeholder) {
      if (
        key.toLowerCase().includes('password') &&
        fieldProps.type !== 'password'
      ) {
        fieldProps.type = 'password' // Override type if name suggests it
        fieldProps.placeholder = DEFAULT_PLACEHOLDERS.password
      } else if (
        key.toLowerCase().includes('date') &&
        !key.toLowerCase().includes('update') &&
        fieldProps.type === 'text'
      ) {
        fieldProps.type = 'date'
        fieldProps.placeholder = DEFAULT_PLACEHOLDERS['date']
      } else if (
        (key.toLowerCase().includes('url') ||
          key.toLowerCase().includes('href') ||
          key.toLowerCase().includes('link')) &&
        fieldProps.type === 'text'
      ) {
        fieldProps.type = 'url'
        fieldProps.placeholder = DEFAULT_PLACEHOLDERS.url
      } else if (
        key.toLowerCase().includes('email') &&
        fieldProps.type === 'text'
      ) {
        fieldProps.type = 'email'
        fieldProps.placeholder = DEFAULT_PLACEHOLDERS.email
      }
    }

    // --- HalfWidth Logic (can be refined based on preferences) ---
    if (meta.halfWidth === undefined) {
      // Default remains false unless meta.halfWidth is true
    } else {
      fieldProps.halfWidth = meta.halfWidth // Respect meta setting
    }

    return { key, ...fieldProps }
  }

  // Process fields and create field configs
  const fields: Array<FieldConfig> = Object.entries(zodShape).map(
    ([key, zodType]) => {
      return getFieldType(key, zodType)
    },
  )

  // Group fields for half-width layout
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
        // Push the single half-width field if it didn't form a pair
        fieldGroups.push([...currentGroup])
        currentGroup = []
      }
      // Push the full-width field as its own group
      fieldGroups.push([field])
    }
  })

  // Add any remaining single half-width field
  if (currentGroup.length > 0) {
    fieldGroups.push([...currentGroup])
  }

  return (
    <AutoFormContext.Provider
      value={{
        form,
        schema,
        isSubmitLoading,
        isCancelLoading,
        handleSubmit: handleSubmitWrapper,
        handleCancel: handleCancelWrapper,
        fields,
        fieldGroups,
        labels,
      }}
    >
      {/* Use the Form component from react-hook-form context provider */}
      <Form {...form}>
        <form
          className={className}
          onSubmit={form.handleSubmit(handleSubmitWrapper, handleErrorWrapper)}
          noValidate // Prevent browser validation, rely on RHF/Zod
        >
          {children}
        </form>
      </Form>
    </AutoFormContext.Provider>
  )
}

// --- Content Component ---

interface ContentProps_<TSchemaType extends z.ZodObject<any, any>> {
  className?: string
  renderField?: (params: {
    field: FieldConfig
    renderDefault: () => React.ReactNode
    form: AutoFormContextValue<TSchemaType>['form']
  }) => React.ReactNode
}

function Content_<TSchemaType extends z.ZodObject<any, any>>({
  className = '',
  renderField,
}: ContentProps_<TSchemaType>) {
  const { form, fieldGroups, labels } = useAutoForm<TSchemaType>()
  const values = form.watch() // Watch all values for conditional logic

  // Helper to evaluate conditional properties (disabled, hidden, readonly)
  const evaluateConditional = <T,>(
    value: T | ((values: FieldValues) => T) | undefined,
    defaultValue: T,
  ): T => {
    if (value === undefined) return defaultValue
    if (typeof value === 'function') {
      try {
        return (value as (values: FieldValues) => T)(values)
      } catch (error) {
        console.error('Error evaluating conditional metadata:', error)
        return defaultValue // Fallback on error
      }
    }
    return value
  }

  // Helper to render appropriate form control based on field config
  const renderFormControl = (fieldConfig: FieldConfig) => {
    const { key, type, placeholder, maxLength, options, meta } = fieldConfig
    const fieldName = key as Path<z.infer<TSchemaType>>

    const isDisabled = evaluateConditional(meta?.disabled, false)
    const isReadOnly = evaluateConditional(meta?.readonly, false)

    const isMultiple = Array.isArray(form.watch(fieldName))
    const currentTags = (form.watch(fieldName) || []) as Array<string>

    switch (type) {
      case 'file':
        return (
          <FileUpload
            value={form.watch(fieldName) as Array<File>}
            onChange={(files) => {
              const value = isMultiple ? files : files[0] || null
              form.setValue(fieldName, value as any, {
                shouldValidate: true,
              })
            }}
            multiple={isMultiple}
            disabled={isDisabled}
            placeholder={placeholder}
            accept={meta?.accept as string}
            maxFiles={meta?.maxFiles as number}
            maxSize={meta?.maxSize as number}
          />
        )
      case 'textarea':
        return (
          <TextArea
            size={'3'}
            placeholder={placeholder}
            className="resize-y min-h-[80px]"
            disabled={isDisabled}
            readOnly={isReadOnly}
            maxLength={maxLength}
            {...form.register(fieldName)}
          />
        )
      case 'tags':
        return (
          <TagInput.Root
            maxTags={maxLength}
            className="space-y-2"
            value={currentTags}
            defaultValue={currentTags}
            onValueChange={(newTags) => {
              form.setValue(fieldName, newTags as any, {
                shouldValidate: true,
              })
            }}
          >
            <TagInput.Input
              size={'3'}
              disabled={
                isDisabled ||
                (maxLength !== undefined && currentTags.length >= maxLength)
              }
              readOnly={isReadOnly}
              placeholder={placeholder}
            >
              {maxLength && (
                <TagInput.Slot side="right">
                  {currentTags.length} / {maxLength}
                </TagInput.Slot>
              )}
            </TagInput.Input>
            <TagInput.Content />
          </TagInput.Root>
        )
      case 'switch':
        return (
          <Switch
            checked={!!form.watch(fieldName)}
            disabled={isDisabled}
            onCheckedChange={(checked) => {
              form.setValue(fieldName, checked as any, {
                shouldValidate: true,
              })
            }}
          />
        )
      case 'select':
        return (
          <Select.Root
            size={'3'}
            value={String(form.watch(fieldName))}
            disabled={isDisabled}
            onValueChange={(value) => {
              form.setValue(fieldName, value as any, { shouldValidate: true })
            }}
          >
            <Select.Trigger className="w-full" placeholder={placeholder} />
            <Select.Content className="z-50">
              <ScrollArea type="auto" style={{ maxHeight: '300px' }}>
                <Select.Group>
                  {options?.map((option) => (
                    <Select.Item key={option} value={option}>
                      {option}
                    </Select.Item>
                  ))}
                </Select.Group>
              </ScrollArea>
            </Select.Content>
          </Select.Root>
        )
      case 'text':
      case 'email':
      case 'password':
      case 'url':
      case 'number':
      case 'date':
      case 'time':
      case 'datetime-local':
        return (
          <TextField.Root
            size="3"
            type={type}
            placeholder={placeholder}
            disabled={isDisabled}
            readOnly={isReadOnly}
            maxLength={maxLength}
            {...form.register(fieldName, {
              valueAsNumber: type === 'number',
            })}
          >
            {(type === 'text' || type === 'password' || type === 'url') &&
              maxLength && (
                <TextField.Slot side="right">
                  <Badge color="gray" variant="soft">
                    {String(form.watch(fieldName) || '').length} / {maxLength}
                  </Badge>
                </TextField.Slot>
              )}
          </TextField.Root>
        )
      default:
        console.warn(
          `AutoForm: Unsupported field type "${type}" for key "${key}". Rendering default text input.`,
        )
        return (
          <TextField.Root
            size="3"
            type="text"
            placeholder={placeholder}
            disabled={isDisabled}
            readOnly={isReadOnly}
            {...form.register(fieldName)}
          />
        )
    }
  }

  return (
    <div className={cn('w-full flex flex-col gap-4', className)}>
      {fieldGroups.map((group, groupIndex) => (
        <div
          key={`group-${groupIndex}`}
          className={cn(
            'w-full grid gap-4',
            group.length > 1 ? 'grid-cols-2' : 'grid-cols-1',
          )}
        >
          {group.map((fieldConfig) => {
            const { key, type, label, meta } = fieldConfig
            const fieldName = key as Path<z.infer<TSchemaType>>

            // Check if the field should be hidden
            const isHidden = evaluateConditional(meta?.hidden, false)
            if (isHidden) return null

            const defaultRender = () => (
              <FormField
                key={key}
                control={form.control}
                name={fieldName}
                render={() => (
                  <FormItem className="w-full flex flex-col">
                    {type === 'switch' ? (
                      // <div className="flex flex-row items-center justify-between space-x-3 rounded-lg border p-4">
                      <div className="flex flex-row items-center justify-between space-x-3 rounded-lg border py-4">
                        {labels && (
                          <Flex direction={'column'} gap={'1'}>
                            <FormLabel htmlFor={key}>{label}</FormLabel>
                            {meta?.description && (
                              <Text size="2" color="gray">
                                {meta.description}
                              </Text>
                            )}
                          </Flex>
                        )}
                        <FormControl>
                          {renderFormControl(fieldConfig)}
                        </FormControl>
                      </div>
                    ) : (
                      <>
                        {labels && <FormLabel htmlFor={key}>{label}</FormLabel>}
                        <FormControl>
                          {renderFormControl(fieldConfig)}
                        </FormControl>
                        {meta?.description && (
                          <Text size="2" color="gray">
                            {meta.description}
                          </Text>
                        )}
                      </>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )

            return renderField
              ? renderField({
                  field: fieldConfig,
                  renderDefault: defaultRender,
                  form,
                })
              : defaultRender()
          })}
        </div>
      ))}
    </div>
  )
}

// --- Actions Components ---

interface ActionsProps_ {
  className?: string
  children: React.ReactNode
}

function Actions_({ className = '', children }: ActionsProps_) {
  return (
    <div
      className={cn(
        'w-full flex flex-row items-center justify-end gap-3',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface ActionProps_
  extends Omit<ButtonProps, 'type' | 'onClick' | 'disabled'> {
  type?: 'submit' | 'button' | 'reset'
  className?: string
  children: React.ReactNode
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

function Action_<TSchemaType extends z.ZodObject<any, any>>({
  type = 'button',
  className,
  children,
  onClick,
  ...props
}: ActionProps_) {
  const { handleCancel, isSubmitLoading, isCancelLoading } =
    useAutoForm<TSchemaType>()

  const isLoading =
    (type === 'submit' && isSubmitLoading) ||
    (type === 'reset' && isCancelLoading)
  const isDisabled = isSubmitLoading || isCancelLoading

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      event.preventDefault()
      return
    }
    if (type === 'reset') {
      event.preventDefault()
      handleCancel()
    } else if (type === 'button' && onClick) {
      onClick(event)
    }
  }

  return (
    <Button
      type={type}
      className={cn(className)}
      onClick={handleClick}
      // disabled={isDisabled || props.disabled}
      disabled={isDisabled}
      loading={isLoading}
      {...props}
    >
      {children}
    </Button>
  )
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AutoForm {
  export type RootProps<TSchemaType extends z.ZodObject<any, any>> =
    RootProps_<TSchemaType>
  export const Root = Root_
  export type ContentProps<TSchemaType extends z.ZodObject<any, any>> =
    ContentProps_<TSchemaType>
  export const Content = Content_
  export type ActionsProps = ActionsProps_
  export const Actions = Actions_
  export type ActionProps = ActionProps_
  export const Action = Action_
}
