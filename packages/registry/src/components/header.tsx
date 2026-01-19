import { Logo } from '@/components/logo'
import { cn } from 'shared/lib/utils'
import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { Button } from '@radix-ui/themes'
import { Link } from '@tanstack/react-router'
import { Authenticated, Unauthenticated } from 'convex/react'
import { Menu, X } from 'lucide-react'
import React from 'react'

import { ProfileDialogWithTrigger } from './profile'
import { AuthDialog } from './auth-dialog'

const menuItems = [
  { name: 'Home', href: '/' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Explore', href: '/explore' },
  {
    name: 'GitHub',
    href: 'https://github.com/raideno/awesome',
    external: true,
  },
]

export const Header = () => {
  const [menuState, setMenuState] = React.useState(false)

  return (
    <header>
      <nav
        data-state={menuState && 'active'}
        className={cn('w-full', 'border-b border-[var(--gray-7)]')}
      >
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0">
            <div className="flex w-full justify-between gap-6 lg:w-auto">
              <Link
                to="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                {/* TODO: so we'll be doing some effect, like after we scroll past the icon in the hero, it'll enter in the header, like progressively */}
                <Logo />
                <span className="font-semibold text-lg">Awesome Website</span>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>

              <div className="m-auto hidden size-fit lg:block">
                <ul className="flex gap-4">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      {item.external ? (
                        <Button asChild variant="soft" size="2">
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span>{item.name}</span>
                            <ExternalLinkIcon />
                          </a>
                        </Button>
                      ) : (
                        <Link to={item.href}>
                          {({ isActive }) => (
                            <Button
                              className="!m-0"
                              variant={'soft'}
                              size="2"
                              color={isActive ? 'orange' : undefined}
                            >
                              <span>{item.name}</span>
                            </Button>
                          )}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="flex items-center space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      {item.external ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-accent-foreground flex items-center gap-2 duration-150"
                        >
                          <span>{item.name}</span>
                          <ExternalLinkIcon />
                        </a>
                      ) : (
                        <Link to={item.href}>
                          {({ isActive }) => (
                            <span
                              className={
                                isActive
                                  ? 'text-[var(--orange-9)] font-medium block duration-150'
                                  : 'text-muted-foreground hover:text-accent-foreground block duration-150'
                              }
                            >
                              {item.name}
                            </span>
                          )}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Unauthenticated>
                  <AuthDialog>
                    <Button variant="classic" size="2">
                      <span>Get Started</span>
                    </Button>
                  </AuthDialog>
                </Unauthenticated>
                <Authenticated>
                  <ProfileDialogWithTrigger />
                </Authenticated>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
