import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  component: () => {
    return (
      <div>
        <div>display the user's lists</div>
        <Outlet />
      </div>
    )
  },
})
