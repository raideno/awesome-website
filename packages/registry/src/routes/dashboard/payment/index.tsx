import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/payment/')({
  component: () => {
    return <div>Hello "/profile/payment"!</div>
  },
})
