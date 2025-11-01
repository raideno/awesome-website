import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => {
    return (
      <div>
        <div>Nice video demonstrating how the site work.</div>
        <div>Potentially have the lists be displayed here directly.</div>
      </div>
    )
  },
})
