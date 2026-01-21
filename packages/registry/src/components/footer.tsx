import { Link } from '@tanstack/react-router'

import { Logo } from '@/components/logo'

export function Footer() {
  return (
    <footer className="w-full pb-4 pt-4 border-t border-[var(--gray-7)]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-0">
        <div className="flex flex-col w-full gap-6">
          <div className="order-last flex items-center gap-3 md:order-first">
            <Link to="/" aria-label="go home">
              <Logo />
            </Link>
            <span className="text-muted-foreground block text-center text-xs sm:text-sm">
              © {new Date().getFullYear()} Awesome Website, All rights reserved
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
