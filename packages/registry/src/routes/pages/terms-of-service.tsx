import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pages/terms-of-service')({
  component: () => {
    return (
      <div>
        <div>Hello "/pages/terms-of-service"!</div>
      </div>
    )
  },
})
