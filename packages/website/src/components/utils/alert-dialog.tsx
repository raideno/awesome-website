'use client'

import * as React from 'react'

import {
  AlertDialog,
  Box,
  Button,
  Heading,
  Separator,
  TextField,
} from '@radix-ui/themes'

export const AlertDialogContext = React.createContext<
  <T extends AlertAction>(
    params: T,
  ) => Promise<T['type'] extends 'alert' | 'confirm' ? boolean : null | string>
>(() => null!)

export type AlertAction =
  | { type: 'alert'; title: string; body?: string; cancelButton?: string }
  | {
      type: 'confirm'
      title: string
      body?: string
      cancelButton?: string
      actionButton?: string
    }
  | {
      type: 'prompt'
      title: string
      body?: string
      cancelButton?: string
      actionButton?: string
      defaultValue?: string
      inputProps?: TextField.RootProps
    }
  | { type: 'close' }

interface AlertDialogState {
  open: boolean
  title: string
  body: string
  type: 'alert' | 'confirm' | 'prompt'
  cancelButton: string
  actionButton: string
  defaultValue?: string
  inputProps?: TextField.RootProps
}

export function alertDialogReducer(
  state: AlertDialogState,
  action: AlertAction,
): AlertDialogState {
  switch (action.type) {
    case 'close':
      return { ...state, open: false }
    case 'alert':
    case 'confirm':
    case 'prompt':
      return {
        ...state,
        open: true,
        ...action,
        cancelButton:
          action.cancelButton || (action.type === 'alert' ? 'Okay' : 'Cancel'),
        actionButton:
          ('actionButton' in action && action.actionButton) || 'Okay',
      }
    default:
      return state
  }
}

export function AlertDialogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [state, dispatch] = React.useReducer(alertDialogReducer, {
    open: false,
    title: '',
    body: '',
    type: 'alert',
    cancelButton: 'Cancel',
    actionButton: 'Okay',
  })

  const resolveRef = React.useRef<(tf: any) => void>(null)

  function close() {
    dispatch({ type: 'close' })
    resolveRef.current?.(false)
  }

  function confirm(value?: string) {
    dispatch({ type: 'close' })
    resolveRef.current?.(value ?? true)
  }

  const dialog = React.useCallback(async <T extends AlertAction>(params: T) => {
    dispatch(params)

    return new Promise<
      T['type'] extends 'alert' | 'confirm' ? boolean : null | string
    >((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  return (
    <AlertDialogContext.Provider value={dialog}>
      {children}
      <AlertDialog.Root
        open={state.open}
        onOpenChange={(open) => {
          if (!open) close()
          return
        }}
      >
        <AlertDialog.Content asChild className="!p-0">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              confirm(event.currentTarget.prompt?.value)
            }}
          >
            <Box p="4">
              <AlertDialog.Title className="sr-only">
                {state.title}
              </AlertDialog.Title>
              <Heading weight={'bold'}>{state.title}</Heading>
            </Box>

            <Separator
              className="!w-full"
              orientation={'horizontal'}
              size={'4'}
            />

            <Box p="4">
              {state.body ? (
                <AlertDialog.Description>{state.body}</AlertDialog.Description>
              ) : null}

              {state.type === 'prompt' && (
                <TextField.Root
                  name="prompt"
                  {...state.inputProps}
                  defaultValue={state.defaultValue}
                />
              )}
            </Box>

            <Separator
              className="!w-full"
              orientation={'horizontal'}
              size={'4'}
            />

            <div className="flex flex-row items-center justify-end gap-2 p-4">
              {/* <Button type="button" variant="secondary" onClick={close}> */}
              <AlertDialog.Cancel>
                <Button type="reset" variant="soft" onClick={close}>
                  {state.cancelButton}
                </Button>
              </AlertDialog.Cancel>
              {state.type === 'alert' ? null : (
                // <AlertDialog.Action>
                <Button type="submit" variant="classic">
                  {state.actionButton}
                </Button>
                // </AlertDialog.Action>
              )}
            </div>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </AlertDialogContext.Provider>
  )
}
type Params<T extends 'alert' | 'confirm' | 'prompt'> =
  | Omit<Extract<AlertAction, { type: T }>, 'type'>
  | string

export function useConfirm() {
  const dialog = React.useContext(AlertDialogContext)

  return React.useCallback(
    (params: Params<'confirm'>) => {
      return dialog({
        ...(typeof params === 'string' ? { title: params } : params),
        type: 'confirm',
      })
    },
    [dialog],
  )
}
export function usePrompt() {
  const dialog = React.useContext(AlertDialogContext)

  return (params: Params<'prompt'>) =>
    dialog({
      ...(typeof params === 'string' ? { title: params } : params),
      type: 'prompt',
    })
}
export function useAlert() {
  const dialog = React.useContext(AlertDialogContext)
  return (params: Params<'alert'>) =>
    dialog({
      ...(typeof params === 'string' ? { title: params } : params),
      type: 'alert',
    })
}
