import { ExternalLinkIcon, TrashIcon } from '@radix-ui/react-icons'
import { Badge, Flex, IconButton, Link, Text } from '@radix-ui/themes'
import { type ColumnDef } from '@tanstack/react-table'
import * as React from 'react'

import type { AwesomeListRepository } from 'shared/types/awesome-list-repository'

interface UseTableColumnsProps {
  onDelete: (id: string) => void
}

export const useTableColumns = ({ onDelete }: UseTableColumnsProps) => {
  return React.useMemo<ColumnDef<AwesomeListRepository>[]>(
    () => [
      {
        accessorKey: 'repositoryName',
        header: 'Repository',
        cell: (info) => <Text weight="bold">{info.getValue() as string}</Text>,
      },
      {
        accessorKey: 'repositoryOwner',
        header: 'Owner',
        cell: (info) => <Text color="gray">{info.getValue() as string}</Text>,
      },
      {
        accessorKey: 'version',
        header: 'Version',
        cell: (info) => (
          <Badge variant="soft">{info.getValue() as string}</Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          return (
            <Flex gap="2">
              <Link
                href={`https://${info.row.original.repositoryOwner}.github.io/${info.row.original.repositoryName}`}
                target="_blank"
              >
                <IconButton
                  size="1"
                  variant="ghost"
                  disabled={info.row.original.status !== 'active'}
                  title="Open website"
                >
                  <ExternalLinkIcon />
                </IconButton>
              </Link>
              <IconButton
                size="1"
                variant="ghost"
                color="red"
                onClick={() => void onDelete(info.row.original.id)}
                title="Delete list"
              >
                <TrashIcon />
              </IconButton>
            </Flex>
          )
        },
        enableSorting: false,
      },
    ],
    [onDelete],
  )
}
