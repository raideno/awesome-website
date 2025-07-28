import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import { IconButton } from '@radix-ui/themes'
import type { IconButtonProps } from '@radix-ui/themes'

import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme'

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
