'use client'

import {
  CheckCircledIcon,
  Cross1Icon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  SymbolIcon,
} from '@radix-ui/react-icons'

import { Toaster as Sonner } from 'sonner'
import type { ToasterProps } from 'sonner'

import { useTheme } from '@/context/theme'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <CheckCircledIcon className="size-4" />,
        info: <InfoCircledIcon className="size-4" />,
        warning: <ExclamationTriangleIcon className="size-4" />,
        error: <Cross1Icon className="size-4" />,
        loading: <SymbolIcon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--color-panel-solid)',
          //   '--normal-text': 'var(--accent-11)',
          '--normal-border': 'var(--gray-7)',
          '--border-radius': 'var(--radius-4)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
