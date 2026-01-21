import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import { IconButton } from '@radix-ui/themes'
import { useTheme } from 'shared/contexts/theme'
import { cn } from 'shared/lib/utils'

import type { IconButtonProps } from '@radix-ui/themes'

export type ThemeSwitchButtonProps = IconButtonProps & {}

export const ThemeSwitchButton = ({
  className,
  ...props
}: ThemeSwitchButtonProps) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <IconButton
      variant="classic"
      onClick={toggleTheme}
      className={cn(className)}
      {...props}
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </IconButton>
  )
}
