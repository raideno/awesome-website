import { PageHeader } from '@/components/page-header'
import { PlusIcon } from '@radix-ui/react-icons'
import { Badge, Heading, Spinner } from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/explore/')({
  component: () => (
    <div>
      <PageHeader
        title="Explore"
        body="Discover awesome lists and repositories shared by the community."
      />

      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
        <div className="space-y-6 max-w-2xl">
          <div className="">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              Check back soon for updates
            </div>
            <Heading className="!mb-2" size={'9'} weight="bold">
              Coming Soon
            </Heading>
            {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm font-medium">
            <PlusIcon />
            Under Construction
          </div> */}
            <Badge color="orange" size={'3'}>
              <PlusIcon />
              Under Construction
            </Badge>
          </div>

          <p className="text-lg text-muted-foreground sm:text-xl">
            We're working hard to bring you something amazing. This page is
            currently being built and will be available soon.
          </p>

          {/* <div className="pt-4">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Check back soon for updates
          </div>
        </div> */}
        </div>
      </div>
    </div>
  ),
})
