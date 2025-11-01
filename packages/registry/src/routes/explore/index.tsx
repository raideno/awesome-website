import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/explore/')({
  component: () => {
    return <div>Hello "/explore"!</div>
  },
})
