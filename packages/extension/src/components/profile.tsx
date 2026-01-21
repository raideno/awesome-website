import { Avatar, Button, DropdownMenu, Flex, Text } from '@radix-ui/themes'
import { ExitIcon, PersonIcon } from '@radix-ui/react-icons'

import { useAuthentication } from '@/contexts/authentication'

export const Profile: React.FC = () => {
  const { user, signOut } = useAuthentication()

  if (!user) return null

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost" className="!cursor-pointer">
          <Avatar
            size="1"
            src={user.image}
            fallback={<PersonIcon />}
            radius="full"
          />
          <Text size="2" weight="medium" className="hidden sm:block">
            {user.name}
          </Text>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={signOut}>
          <Flex align="center" gap="2">
            <ExitIcon />
            Sign Out
          </Flex>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
