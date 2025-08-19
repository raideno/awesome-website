import _ from 'lodash'

import { useEffect, useState } from 'react'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
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

import { getFieldType, groupFields, zodTypeGuards } from './helpers'
import { AutoFormContext, useAutoForm } from './context'

import type React from 'react'
import type * as z from 'zod/v4'
import type {
  FieldValues,
  Path,
  PathValue,
  SubmitErrorHandler,
  SubmitHandler,
} from 'react-hook-form'
import type { ButtonProps } from '@radix-ui/themes'
import type { AutoFormContextValue, FieldConfig } from './context'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FileUpload } from '@/components/ui/file-upload'
import { cn } from '@/lib/utils'
import { TagInput } from '@/components/ui/tag-input'

interface RootProps_<TSchemaType extends z.ZodObject<any, any>> {
  schema: TSchemaType
  defaultValues?: z.output<TSchemaType>
  onSubmit: (values: z.infer<TSchemaType>) => Promise<void> | void
  onCancel?: () => void
  onError?: () => void
  onChange?: (values: z.infer<TSchemaType>) => void
  className?: string
  children: React.ReactNode
  labels?: boolean
}

function Root_<TSchemaType extends z.ZodObject<any, any>>({
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  onError,
  onChange,
  className = '',
  children,
  labels = true,
}: RootProps_<TSchemaType>) {
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false)
  const [isCancelLoading, setIsCancelLoading] = useState<boolean>(false)

  if (!zodTypeGuards.object(schema)) {
    console.error(
      'AutoForm Error: The provided schema must be an instance of z.ZodObject.',
    )
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

  useEffect(() => {
    if (onChange) {
      const subscription = form.watch((value) => {
        onChange(value as z.infer<TSchemaType>)
      })
      return () => subscription.unsubscribe()
    }
  }, [form, onChange])

  const createAsyncHandler =
    (
      handler: () => Promise<void> | void,
      setLoading: (loading: boolean) => void,
      loadingStates: [boolean, boolean],
    ) =>
    async () => {
      if (loadingStates[0] || loadingStates[1]) return

      try {
        setLoading(true)
        await handler()
      } catch (error) {
        console.error('[form-error]:', error)
      } finally {
        setLoading(false)
      }
    }

  const handleSubmitWrapper: SubmitHandler<FormValues> = createAsyncHandler(
    () => onSubmit(form.getValues()),
    setIsSubmitLoading,
    [isSubmitLoading, isCancelLoading],
  )

  const handleErrorWrapper: SubmitErrorHandler<FormValues> = (errors) => {
    console.log('[form-errors]:', errors)
    if (isSubmitLoading || isCancelLoading) return
    onError?.()
  }

  const handleCancelWrapper = createAsyncHandler(
    () => (onCancel ? onCancel() : form.reset(defaultValues)),
    setIsCancelLoading,
    [isCancelLoading, isSubmitLoading],
  )

  const fields: Array<FieldConfig> = Object.entries(schema.shape).map(
    ([key, zodType]) => getFieldType(key, zodType),
  )

  const fieldGroups = groupFields(fields)

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
      <Form {...form}>
        <form
          className={className}
          onSubmit={form.handleSubmit(handleSubmitWrapper, handleErrorWrapper)}
          noValidate
        >
          {children}
        </form>
      </Form>
    </AutoFormContext.Provider>
  )
}

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
  const values = form.watch()

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
        return defaultValue
      }
    }
    return value
  }

  const renderFormControl = (fieldConfig: FieldConfig) => {
    const { key, type, placeholder, maxLength, options, meta } = fieldConfig
    const fieldName = key as Path<z.infer<TSchemaType>>

    const isDisabled = evaluateConditional(meta?.disabled, false)
    const isReadOnly = evaluateConditional(meta?.readonly, false)
    const isMultiple = Array.isArray(form.watch(fieldName))
    const currentValue = form.watch(fieldName)

    const commonProps = { disabled: isDisabled, readOnly: isReadOnly }

    switch (type) {
      case 'file':
        return (
          <FileUpload
            value={currentValue as Array<File>}
            onChange={(files) => {
              const value = isMultiple ? files : files[0] || null
              form.setValue(
                fieldName,
                value as PathValue<
                  z.core.output<TSchemaType>,
                  Path<z.core.output<TSchemaType>>
                >,
                { shouldValidate: true },
              )
            }}
            multiple={isMultiple}
            disabled={isDisabled}
            placeholder={placeholder}
            accept={meta?.accept}
            maxFiles={meta?.maxFiles}
            maxSize={meta?.maxSize}
          />
        )

      case 'textarea':
        return (
          <TextArea
            size={'3'}
            placeholder={placeholder}
            className="resize-y min-h-[80px]"
            maxLength={maxLength}
            {...commonProps}
            {...form.register(fieldName)}
          />
        )

      case 'tags':
        // eslint-disable-next-line no-case-declarations
        const currentTags = (currentValue || []) as Array<string>
        return (
          <TagInput.Root
            maxTags={maxLength}
            className="space-y-2"
            value={currentTags}
            defaultValue={currentTags}
            onValueChange={(newTags) => {
              form.setValue(
                fieldName,
                newTags as PathValue<
                  z.core.output<TSchemaType>,
                  Path<z.core.output<TSchemaType>>
                >,
              )
            }}
          >
            {/* form.setValue(fieldName, newTags, { shouldValidate: true }) */}
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
            checked={!!currentValue}
            disabled={isDisabled}
            onCheckedChange={(checked) => {
              form.setValue(
                fieldName,
                checked as PathValue<
                  z.core.output<TSchemaType>,
                  Path<z.core.output<TSchemaType>>
                >,
                { shouldValidate: true },
              )
            }}
          />
        )

      case 'select':
        return (
          <Select.Root
            size={'3'}
            value={String(currentValue)}
            disabled={isDisabled}
            onValueChange={(value) => {
              form.setValue(
                fieldName,
                value as PathValue<
                  z.core.output<TSchemaType>,
                  Path<z.core.output<TSchemaType>>
                >,
                { shouldValidate: true },
              )
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
        // eslint-disable-next-line no-case-declarations
        const showCharCount =
          ['text', 'password', 'url'].includes(type) && maxLength
        return (
          <TextField.Root
            size="3"
            type={type}
            placeholder={placeholder}
            maxLength={maxLength}
            {...commonProps}
            {...form.register(fieldName, { valueAsNumber: type === 'number' })}
          >
            {showCharCount && (
              <TextField.Slot side="right">
                <Badge color="gray" variant="soft">
                  {String(currentValue || '').length} / {maxLength}
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
            {...commonProps}
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
