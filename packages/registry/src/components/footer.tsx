import { Link } from '@tanstack/react-router'

import { Logo } from '@/components/logo'

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
        </div>
      </div>
    </footer>
  )
}
