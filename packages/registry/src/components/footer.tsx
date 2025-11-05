import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { Button } from '@radix-ui/themes'
import { Link } from '@tanstack/react-router'

import { Logo } from '@/components/logo'

const links = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Explore',
    href: '/explore',
  },
  {
    title: 'GitHub',
    href: 'https://github.com/raideno/awesome-website',
    external: true,
  },
]

export function Footer() {
  return (
    <footer className="w-full pb-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col w-full gap-6">
          <div className="order-last flex items-center gap-3 md:order-first">
            <Link to="/" aria-label="go home">
              <Logo />
            </Link>
            <span className="text-muted-foreground block text-center text-sm">
              © {new Date().getFullYear()} Awesome Website, All rights reserved
            </span>
          </div>

          {/* 
          <div className="w-full order-first flex flex-wrap gap-x-6 gap-y-4 md:order-last">
            {links.map((link, index) =>
              link.external ? (
                <Button key={index} variant="soft" asChild>
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    <span>{link.title}</span>
                    <ExternalLinkIcon />
                  </a>
                </Button>
              ) : (
                <Link key={index} to={link.href}>
                  {({ isActive }) => (
                    <Button
                      className="!m-0"
                      variant={'soft'}
                      color={isActive ? 'orange' : undefined}
                    >
                      <span>{link.title}</span>
                    </Button>
                  )}
                </Link>
              ),
            )}
          </div> */}
        </div>
      </div>
    </footer>
  )
}
