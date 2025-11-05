import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pages/privacy-policy')({
  component: () => {
    return (
      <div>
        <div>Hello "/pages/privacy-policy"!</div>
      </div>
    )
  },
})
