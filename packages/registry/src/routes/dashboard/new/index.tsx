import { AutoForm } from '@raideno/auto-form/ui'
import { z_ } from '@raideno/auto-form/zod'
import { createFileRoute } from '@tanstack/react-router'

const Schema = z_.object({
  name: z_.string().min(2).max(100),
  description: z_.string().min(2).max(500).optional(),
  // TODO: upload it to the GitHub repository and use the URL
  thumbnail: z_.file().optional(),
})

export const Route = createFileRoute('/dashboard/new/')({
  component: () => {
    return (
      <div>
        <AutoForm.Root schema={Schema}>
          <AutoForm.Content />
          <AutoForm.Actions className="mt-4">
            <AutoForm.Action
              variant="classic"
              type="submit"
              className="!w-full"
            >
              Create
            </AutoForm.Action>
          </AutoForm.Actions>
        </AutoForm.Root>
      </div>
    )
  },
})
