import { NotebookPenIcon } from 'lucide-react'

import { cn } from 'shared/lib/utils'

export const Logo = ({ className }: { className?: string }) => (
  <div
    aria-hidden
    className={cn(
      'relative flex size-9 translate-y-0.5 items-center justify-center',
      'bg-[var(--accent-9)] rounded-[var(--radius-4)]',
      'border border-[var(--accent-7)]',
      className,
    )}
  >
    <NotebookPenIcon className="fill-white stroke-black" />
  </div>
)
