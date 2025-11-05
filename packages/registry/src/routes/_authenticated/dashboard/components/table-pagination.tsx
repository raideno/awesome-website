import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { Flex, IconButton, Text } from '@radix-ui/themes'
import type { Table } from '@tanstack/react-table'

interface TablePaginationProps<T> {
  table: Table<T>
}

export const TablePagination = <T,>({ table }: TablePaginationProps<T>) => {
  return (
    <Flex gap="3" align="center" justify="between" mt="4" pb="4">
      <Flex gap="2" align="center">
        <Text size="2" color="gray">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </Text>
      </Flex>

      <Flex gap="2" align="center">
        <IconButton
          size="2"
          variant="soft"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <DoubleArrowLeftIcon />
        </IconButton>
        <IconButton
          size="2"
          variant="soft"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          size="2"
          variant="soft"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRightIcon />
        </IconButton>
        <IconButton
          size="2"
          variant="soft"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <DoubleArrowRightIcon />
        </IconButton>
      </Flex>
    </Flex>
  )
}
