import { Box, Flex, Table, Text } from '@radix-ui/themes'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import * as React from 'react'

import { TablePagination } from './table-pagination'

import type { AwesomeListRepository } from 'shared/types/awesome-list-repository'

interface ListsTableProps {
  data: AwesomeListRepository[]
  columns: ColumnDef<AwesomeListRepository>[]
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
}

export const ListsTable: React.FC<ListsTableProps> = ({
  data,
  columns,
  globalFilter,
  onGlobalFilterChange,
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  return (
    <Box className="w-full overflow-x-auto">
      <Table.Root variant="surface" className="min-w-full">
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeaderCell key={header.id}>
                  {header.isPlaceholder ? null : (
                    <Box
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        cursor: header.column.getCanSort()
                          ? 'pointer'
                          : 'default',
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() === 'asc' && ' ↑'}
                      {header.column.getIsSorted() === 'desc' && ' ↓'}
                    </Box>
                  )}
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          ))}
        </Table.Header>

        <Table.Body>
          {table.getRowModel().rows.length === 0 ? (
            <>
              <Table.Row>
                <Table.Cell colSpan={columns.length}>
                  <Flex
                    justify="center"
                    align="center"
                    style={{ height: '21px' }}
                  >
                    <Text color="gray">No lists found</Text>
                  </Flex>
                </Table.Cell>
              </Table.Row>

              {/* Fill remaining slots to maintain consistent height */}
              {Array.from({
                length: table.getState().pagination.pageSize - 1,
              }).map((_, index) => (
                <Table.Row key={`empty-${index}`}>
                  {columns.map((_, colIndex) => (
                    <Table.Cell key={`empty-cell-${colIndex}`}>
                      <Box style={{ height: '21px' }}>&nbsp;</Box>
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </>
          ) : (
            <>
              {table.getRowModel().rows.map((row) => (
                <Table.Row key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}

              {/* Fill empty slots to maintain consistent height */}
              {Array.from({
                length:
                  table.getState().pagination.pageSize -
                  table.getRowModel().rows.length,
              }).map((_, index) => (
                <Table.Row key={`empty-${index}`}>
                  {columns.map((_, colIndex) => (
                    <Table.Cell key={`empty-cell-${colIndex}`}>
                      <Box style={{ height: '21px' }}>&nbsp;</Box>
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </>
          )}
        </Table.Body>
      </Table.Root>

      <TablePagination table={table} />
    </Box>
  )
}
