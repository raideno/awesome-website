import {
  AlertDialog,
  Box,
  Button,
  Flex,
  Heading,
  Text,
  TextField,
} from '@radix-ui/themes'
import * as React from 'react'

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
        <AlertDialog.Content asChild>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              confirm(event.currentTarget.prompt?.value)
            }}
          >
            <Box>
              <>
                <AlertDialog.Title className="sr-only">
                  {state.title}
                </AlertDialog.Title>
                <AlertDialog.Description className="sr-only">
                  {state.body}
                </AlertDialog.Description>
              </>
              <Heading weight={'bold'}>{state.title}</Heading>
              {state.body && <Text>{state.body}</Text>}
            </Box>
            {state.type === 'prompt' && (
              <TextField.Root
                {...state.inputProps}
                type="text"
                name="prompt"
                defaultValue={state.defaultValue}
              />
            )}
            <Flex justify="end" gap="2" mt="4">
              <Button type="button" variant="soft" onClick={close}>
                {state.cancelButton}
              </Button>
              {state.type === 'alert' ? null : (
                <Button type="submit" variant="classic">
                  {state.actionButton}
                </Button>
              )}
            </Flex>
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
