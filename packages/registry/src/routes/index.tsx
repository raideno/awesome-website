import { Button, Flex } from '@radix-ui/themes'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'

import { AuthDialog } from '@/components/auth-dialog'
import { PageHeader } from '@/components/page-header'

export const Route = createFileRoute('/')({
  head: () => {
    return {
      meta: [
        {
          title: 'Awesome Websites Registry',
        },
        {
          name: 'description',
          content: 'A registry of (your) awesome websites.',
        },
      ],
      links: [
        {
          rel: 'icon',
          href: '/favicon.ico',
        },
      ],
    }
  },
  component: () => {
    return (
      <Flex direction="column" align="center" className="gap-16">
        <section className="w-full">
          <PageHeader
            title="The Awesome Website"
            body="A simple github action able to generate your own website to save
              your awesome lists and edit them."
          />
          <div className="relative z-10 mx-auto w-full px-4 sm:px-6 lg:px-0">
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-2">
              <Unauthenticated>
                <AuthDialog>
                  <Button
                    className="w-full sm:w-auto"
                    variant="classic"
                    size="3"
                  >
                    <span className="text-nowrap">Get Started</span>
                  </Button>
                </AuthDialog>
              </Unauthenticated>
              <AuthLoading>
                <AuthDialog>
                  <Button
                    className="w-full sm:w-auto"
                    disabled
                    variant="classic"
                    size="3"
                  >
                    <span className="text-nowrap">Get Started</span>
                  </Button>
                </AuthDialog>
              </AuthLoading>
              <Authenticated>
                <Button
                  className="w-full sm:w-auto"
                  asChild
                  variant="classic"
                  size="3"
                >
                  <Link to="/dashboard">
                    <span className="text-nowrap">Dashboard</span>
                  </Link>
                </Button>
              </Authenticated>
              <Button
                className="w-full sm:w-auto"
                asChild
                variant="outline"
                size="3"
              >
                <a
                  href="https://raideno.github.io/awesome/website"
                  target="_blank"
                >
                  <span className="text-nowrap">View Demo</span>
                </a>
              </Button>
            </div>

            <div className="relative mt-12 overflow-hidden rounded-lg sm:rounded-[var(--radius-4)] bg-black/10 md:mt-16">
              <img
                src="https://images.unsplash.com/photo-1547623641-d2c56c03e2a7?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt=""
                className="absolute inset-0 size-full object-cover"
              />

              <div className="bg-background rounded-lg sm:rounded-[var(--radius-4)] relative m-2 overflow-hidden border border-transparent shadow-xl shadow-black/15 ring-1 ring-black/10 sm:m-4 md:m-8 lg:m-12">
                {/* https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4 */}
                <video
                  controls
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  // alt="video demonstration."
                  width="2880"
                  height="1842"
                  className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] md:max-h-none object-cover object-top-left"
                />
              </div>
            </div>
          </div>
        </section>
      </Flex>
    )
  },
})
