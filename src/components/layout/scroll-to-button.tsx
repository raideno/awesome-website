import React from 'react'

import { IconButton } from '@radix-ui/themes'
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'

import type { IconButtonProps } from '@radix-ui/themes'

export type ScrollToButtonProps = IconButtonProps & {
  to: 'top' | 'bottom'
}

export const ScrollToButton: React.FC<ScrollToButtonProps> = ({
  to,
  className,
  ...props
}) => {
  const scrollTo = () => {
    window.scrollTo({
      top: to === 'bottom' ? document.documentElement.scrollHeight : 0,
      behavior: 'smooth',
    })
  }

  return (
    <IconButton variant="surface" onClick={scrollTo} {...props}>
      {to === 'bottom' && <ChevronDownIcon width="18" height="18" />}
      {to === 'top' && <ChevronUpIcon width="18" height="18" />}
    </IconButton>
  )
}
