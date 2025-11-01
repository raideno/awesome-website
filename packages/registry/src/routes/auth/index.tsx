import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/')({
  component: () => {
    return (
      <div>
        <div>Auth with GitHub.</div>
      </div>
    )
  },
})
