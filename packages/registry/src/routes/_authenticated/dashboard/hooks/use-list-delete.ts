import { useConfirm } from '@/components/confirmation-dialog'
import { useMutation } from 'convex/react'
import * as React from 'react'

import { api } from '@/convex.generated/api'

export const useListDelete = (existingLists: any[]) => {
  const confirm = useConfirm()
  const unregisterList = useMutation(api.lists.unregister)

  const handleDelete = React.useCallback(
    async (id: string) => {
      const confirmation = await confirm({
        title: 'Confirm Deletion',
        body: "Are you sure you want to delete this list? This won't delete your repository.",
      })

      if (!confirmation) return

      const list = existingLists.find(
        (l: any) => String(l.repository.id) === id,
      )
      if (!list) return

      try {
        await unregisterList({ listId: list._id })
      } catch (error) {
        console.error('Failed to delete list:', error)
      }
    },
    [confirm, existingLists, unregisterList],
  )

  return { handleDelete }
}
