import { MagnifyingGlassIcon, StarIcon } from '@radix-ui/react-icons'
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Dialog,
  Flex,
  ScrollArea,
  Spinner,
  Text,
  TextField,
} from '@radix-ui/themes'
import {
  useQuery,
  useMutation as useTanstackMutation,
} from '@tanstack/react-query'
import { useAction, useMutation } from 'convex/react'
import * as React from 'react'

import { api } from 'backend/api'

import type { AwesomeListRepository } from '@/types/awesome-list-repository'

interface Repository {
  id: number
  owner: string
  name: string
  fullName: string
  private: boolean
  url: string
  canPush: boolean
  isAwesomeRepository: boolean
}

interface ImportRepositoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingLists: AwesomeListRepository[]
}

export const ImportRepositoryDialog: React.FC<ImportRepositoryDialogProps> = ({
  open,
  onOpenChange,
  existingLists,
}) => {
  const [selectedRepos, setSelectedRepos] = React.useState<Set<number>>(
    new Set(),
  )
  const [searchQuery, setSearchQuery] = React.useState('')
  const [visibility] = React.useState<'all' | 'public' | 'private'>('all')

  const listRepositories = useAction(api.github.repositories)
  const registerList = useMutation(api.lists.register)

  // Fetch repositories using TanStack Query
  const {
    data: repositories,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['repositories', visibility],
    queryFn: async () => {
      const repos = await listRepositories({ visibility })
      return repos as Repository[]
    },
    enabled: open, // Only fetch when dialog is open
  })

  const error = queryError?.message ?? null

  // Create a set of existing repository IDs for quick lookup
  const existingRepoIds = React.useMemo(() => {
    return new Set(existingLists.map((list) => list.id))
  }, [existingLists])

  // Sort repositories: awesome ones first, then alphabetically
  const sortedRepositories = React.useMemo(() => {
    if (!repositories) return []

    const filtered = repositories.filter((repo) =>
      repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return filtered.sort((a, b) => {
      // Awesome repos first
      if (a.isAwesomeRepository !== b.isAwesomeRepository) {
        return a.isAwesomeRepository ? -1 : 1
      }
      // Then alphabetically
      return a.fullName.localeCompare(b.fullName)
    })
  }, [repositories, searchQuery])

  const handleToggleRepo = (repoId: number, isDisabled: boolean) => {
    if (isDisabled) return

    setSelectedRepos((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(repoId)) {
        newSet.delete(repoId)
      } else {
        newSet.add(repoId)
      }
      return newSet
    })
  }

  const handleSelectAll = (repos: Repository[]) => {
    const selectableRepos = repos.filter(
      (repo) => !existingRepoIds.has(String(repo.id)),
    )
    if (selectedRepos.size === selectableRepos.length) {
      setSelectedRepos(new Set())
    } else {
      setSelectedRepos(new Set(selectableRepos.map((r) => r.id)))
    }
  }

  // Import mutation using TanStack Query
  const importMutation = useTanstackMutation({
    mutationFn: async (reposToImport: Repository[]) => {
      // Import repositories in parallel
      await Promise.all(
        reposToImport.map((repo) =>
          registerList({
            id: String(repo.id),
            login: repo.owner,
            name: repo.name,
            privacy: repo.private ? 'private' : 'public',
          }),
        ),
      )
    },
    onSuccess: () => {
      // Reset state and close dialog
      setSelectedRepos(new Set())
      onOpenChange(false)
    },
  })

  const handleImport = () => {
    if (selectedRepos.size === 0 || !repositories) return

    const reposToImport = repositories.filter((repo) =>
      selectedRepos.has(repo.id),
    )

    importMutation.mutate(reposToImport)
  }

  const awesomeRepos = sortedRepositories.filter((r) => r.isAwesomeRepository)
  const otherRepos = sortedRepositories.filter((r) => !r.isAwesomeRepository)

  const isImporting = importMutation.isPending
  const importError = importMutation.error

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 600 }}>
        <Dialog.Title>Import Repository</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Select repositories to import as awesome lists
        </Dialog.Description>

        {(error || importError) && (
          <Box
            mb="4"
            p="3"
            style={{ backgroundColor: 'var(--red-3)', borderRadius: 6 }}
          >
            <Text color="red" size="2">
              {error || importError?.message}
            </Text>
          </Box>
        )}

        <Flex direction="column" gap="3">
          <TextField.Root
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading || isImporting}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>

          {isLoading ? (
            <Flex align="center" justify="center" py="8">
              <Spinner size="3" />
            </Flex>
          ) : (
            <ScrollArea style={{ height: 400 }}>
              <Flex direction="column" gap="3">
                {/* Awesome Repositories Section */}
                {awesomeRepos.length > 0 && (
                  <Box>
                    <Flex justify="between" align="center" mb="2">
                      <Flex align="center" gap="2">
                        <StarIcon color="gold" />
                        <Text weight="bold" size="3">
                          Awesome Repositories
                        </Text>
                      </Flex>
                      <Button
                        size="1"
                        variant="ghost"
                        onClick={() => handleSelectAll(awesomeRepos)}
                      >
                        {selectedRepos.size ===
                        awesomeRepos.filter(
                          (r) => !existingRepoIds.has(String(r.id)),
                        ).length
                          ? 'Deselect All'
                          : 'Select All'}
                      </Button>
                    </Flex>
                    {awesomeRepos.map((repo) => {
                      const isDisabled = existingRepoIds.has(String(repo.id))
                      const isSelected = selectedRepos.has(repo.id)
                      return (
                        <Card
                          key={repo.id}
                          mb="2"
                          style={{
                            opacity: isDisabled ? 0.5 : 1,
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            background: 'var(--accent-2)',
                            borderColor: 'var(--accent-6)',
                          }}
                          onClick={() => handleToggleRepo(repo.id, isDisabled)}
                        >
                          <Flex align="center" gap="3">
                            <Checkbox
                              checked={isSelected}
                              disabled={isDisabled}
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={() =>
                                handleToggleRepo(repo.id, isDisabled)
                              }
                            />
                            <Flex
                              direction="column"
                              gap="1"
                              style={{ flex: 1 }}
                            >
                              <Text weight="bold" size="2">
                                {repo.fullName}
                              </Text>
                              {isDisabled && (
                                <Text size="1" color="gray">
                                  Already imported
                                </Text>
                              )}
                            </Flex>
                            {repo.private && (
                              <Badge size="1" color="gray">
                                Private
                              </Badge>
                            )}
                          </Flex>
                        </Card>
                      )
                    })}
                  </Box>
                )}

                {/* Other Repositories Section */}
                {otherRepos.length > 0 && (
                  <Box>
                    <Flex justify="between" align="center" mb="2">
                      <Text weight="bold" size="3">
                        Other Repositories
                      </Text>
                      <Button
                        size="1"
                        variant="ghost"
                        onClick={() => handleSelectAll(otherRepos)}
                      >
                        {selectedRepos.size ===
                        otherRepos.filter(
                          (r) => !existingRepoIds.has(String(r.id)),
                        ).length
                          ? 'Deselect All'
                          : 'Select All'}
                      </Button>
                    </Flex>
                    {otherRepos.map((repo) => {
                      const isDisabled = existingRepoIds.has(String(repo.id))
                      const isSelected = selectedRepos.has(repo.id)
                      return (
                        <Card
                          key={repo.id}
                          mb="2"
                          style={{
                            opacity: isDisabled ? 0.5 : 1,
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                          }}
                          onClick={() => handleToggleRepo(repo.id, isDisabled)}
                        >
                          <Flex align="center" gap="3">
                            <Checkbox
                              checked={isSelected}
                              disabled={isDisabled}
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={() =>
                                handleToggleRepo(repo.id, isDisabled)
                              }
                            />
                            <Flex
                              direction="column"
                              gap="1"
                              style={{ flex: 1 }}
                            >
                              <Text weight="bold" size="2">
                                {repo.fullName}
                              </Text>
                              {isDisabled && (
                                <Text size="1" color="gray">
                                  Already imported
                                </Text>
                              )}
                            </Flex>
                            {repo.private && (
                              <Badge size="1" color="gray">
                                Private
                              </Badge>
                            )}
                          </Flex>
                        </Card>
                      )
                    })}
                  </Box>
                )}

                {sortedRepositories.length === 0 && !isLoading && (
                  <Flex align="center" justify="center" py="8">
                    <Text color="gray">No repositories found</Text>
                  </Flex>
                )}
              </Flex>
            </ScrollArea>
          )}

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button
                variant="soft"
                color="gray"
                disabled={isLoading || isImporting}
              >
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              onClick={handleImport}
              disabled={selectedRepos.size === 0 || isLoading || isImporting}
            >
              {isImporting ? (
                <>
                  <Spinner />
                  Importing...
                </>
              ) : (
                <>
                  Import{' '}
                  {selectedRepos.size > 0 ? `(${selectedRepos.size})` : ''}
                </>
              )}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
