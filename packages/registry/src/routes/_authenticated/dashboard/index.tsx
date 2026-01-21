import { createFileRoute, redirect } from '@tanstack/react-router'

import { PageHeader } from '@/components/page-header'
import { Box, Flex } from '@radix-ui/themes'
import * as React from 'react'

import { ImportRepositoryButton } from './-components/import-repository-button'
import { ImportRepositoryDialog } from './-components/import-repository-dialog'
import { ListsTable } from './-components/lists-table'
import { SearchBar } from './-components/search-bar'
import { useAwesomeLists, useListDelete, useTableColumns } from './-hooks'

import {
  REDIRECT_URL_SEARCH_KEY,
  REQUIRE_SUBSCRIPTION_URL_SEARCH_KEY,
} from '@/constants'

export const Route = createFileRoute('/_authenticated/dashboard/')({
  // TODO: by default this isn' valid, immediately redirect to /dashboard/lists
  beforeLoad: async ({ context }) => {
    if (!context.subscription.isSubscribed)
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: '/dashboard/payment',
        search: {
          [REQUIRE_SUBSCRIPTION_URL_SEARCH_KEY]: true,
          [REDIRECT_URL_SEARCH_KEY]: '/dashboard',
        },
      })
  },
  component: () => {
    const [globalFilter, setGlobalFilter] = React.useState('')
    const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false)

    const { lists, existingLists } = useAwesomeLists()
    const { handleDelete } = useListDelete(existingLists)
    const columns = useTableColumns({
      onDelete: (id: string) => void handleDelete(id),
    })

    return (
      <Box className="w-full space-y-6" style={{ position: 'relative' }}>
        <ImportRepositoryDialog
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          existingLists={lists}
        />

        <PageHeader
          title="Dashboard"
          body="Manage your awesome lists and repositories"
        />

        <ImportRepositoryButton onClick={() => setIsImportDialogOpen(true)} />

        <Flex
          gap="3"
          align="center"
          justify="between"
          wrap="wrap"
          className="w-full"
        >
          <SearchBar
            value={globalFilter}
            onChange={setGlobalFilter}
            placeholder="Search lists..."
          />
        </Flex>

        <ListsTable
          data={lists}
          columns={columns}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />
      </Box>
    )
  },
})
