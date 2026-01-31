import {
  BookmarkFilledIcon,
  BookmarkIcon,
  ExternalLinkIcon,
  StarIcon,
  TrashIcon,
} from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  ScrollArea,
  Text,
} from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import type { AwesomeList } from 'shared/types/awesome-list'
import type { SavedAwesomeWebsite } from '@/lib/storage'

import {
  getSavedWebsites,
  isWebsiteSaved,
  removeWebsite,
  saveWebsite,
} from '@/lib/storage'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const [awesomeList, setAwesomeList] = useState<AwesomeList | null>(null)
  const [isAwesomeWebsite, setIsAwesomeWebsite] = useState(false)
  const [websiteInfo, setWebsiteInfo] = useState<{
    title?: string
    url?: string
  }>({})
  const [savedWebsites, setSavedWebsites] = useState<
    Array<SavedAwesomeWebsite>
  >([])
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load saved websites
  const loadSavedWebsites = async () => {
    const websites = await getSavedWebsites()
    setSavedWebsites(websites)
  }

  // Check if current website is awesome and if it's saved
  const checkCurrentWebsite = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })

      if (!tab.id || !tab.url) {
        // Reset state for tabs without URLs (new tab, settings, etc.)
        setIsAwesomeWebsite(false)
        setWebsiteInfo({})
        setAwesomeList(null)
        setIsSaved(false)
        return
      }

      // Skip restricted URLs (chrome://, edge://, about:, etc.)
      if (
        tab.url.startsWith('chrome://') ||
        tab.url.startsWith('edge://') ||
        tab.url.startsWith('about:') ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('edge-extension://')
      ) {
        setIsAwesomeWebsite(false)
        setWebsiteInfo({})
        setAwesomeList(null)
        setIsSaved(false)
        return
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: 'MAIN',
        func: () => {
          const list = (
            '__AWESOME_LIST__' in window ? window['__AWESOME_LIST__'] : null
          ) as AwesomeList | null
          const hasGlobalVar =
            '__AWESOME_WEBSITE__' in window &&
            window['__AWESOME_WEBSITE__'] === true

          return {
            isAwesome: hasGlobalVar,
            title: document.title,
            url: window.location.href,
            list: list,
          }
        },
      })

      if (results.length > 0 && results[0]?.result) {
        const { isAwesome, title, url, list } = results[0].result
        setIsAwesomeWebsite(isAwesome)
        setWebsiteInfo({ title, url })
        setAwesomeList(list)

        if (url) {
          const saved = await isWebsiteSaved(url)
          setIsSaved(saved)
        }
      }
    } catch (error) {
      console.error('Error checking awesome website:', error)
      // Reset state on error (e.g., can't access restricted pages)
      setIsAwesomeWebsite(false)
      setWebsiteInfo({})
      setAwesomeList(null)
      setIsSaved(false)
    }
  }

  useEffect(() => {
    checkCurrentWebsite()
    loadSavedWebsites()

    const handleTabUpdate = () => {
      checkCurrentWebsite()
    }
    chrome.tabs.onUpdated.addListener(handleTabUpdate)
    chrome.tabs.onActivated.addListener(handleTabUpdate)

    return () => {
      chrome.tabs.onUpdated.removeListener(handleTabUpdate)
      chrome.tabs.onActivated.removeListener(handleTabUpdate)
    }
  }, [])

  const handleSaveWebsite = async () => {
    if (!websiteInfo.url || !websiteInfo.title || !awesomeList) return

    setIsLoading(true)
    try {
      await saveWebsite({
        title: websiteInfo.title,
        url: websiteInfo.url,
        list: awesomeList,
      })
      setIsSaved(true)
      await loadSavedWebsites()
    } catch (error) {
      console.error('Error saving website:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveWebsite = async (id: string) => {
    setIsLoading(true)
    try {
      await removeWebsite(id)
      await loadSavedWebsites()

      // Check if removed website is current page
      if (websiteInfo.url) {
        const saved = await isWebsiteSaved(websiteInfo.url)
        setIsSaved(saved)
      }
    } catch (error) {
      console.error('Error removing website:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openWebsite = (url: string) => {
    chrome.tabs.create({ url })
  }

  return (
    <Box className="w-full h-[600px] flex flex-col">
      {/* Header */}
      <Box className="p-4 border-b border-[var(--gray-7)]">
        <Flex justify="between" align="center">
          <Flex align="center" gap="2">
            <StarIcon className="w-5 h-5" />
            <Heading size="4">Awesome Lists</Heading>
          </Flex>
        </Flex>
      </Box>

      <ScrollArea className="flex-1">
        <Box className="p-4 space-y-4">
          {/* Current Page Section */}
          {isAwesomeWebsite && awesomeList && (
            <Card>
              <Flex direction="column" gap="3">
                <Flex align="center" gap="2">
                  <Box className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </Box>
                  <Heading size="3" className="flex-1 truncate">
                    {awesomeList.title}
                  </Heading>
                </Flex>

                <Text size="2" color="gray" className="line-clamp-2">
                  {awesomeList.description}
                </Text>

                <Flex gap="2">
                  <Button
                    size="2"
                    variant={isSaved ? 'soft' : 'classic'}
                    onClick={handleSaveWebsite}
                    disabled={isLoading || isSaved}
                    className="flex-1"
                  >
                    {isSaved ? (
                      <>
                        <BookmarkFilledIcon />
                        Saved
                      </>
                    ) : (
                      <>
                        <BookmarkIcon />
                        Save
                      </>
                    )}
                  </Button>
                </Flex>
              </Flex>
            </Card>
          )}

          {!isAwesomeWebsite && (
            <Card>
              <Flex direction="column" gap="2" align="center" className="py-6">
                <Text size="2" color="gray" align="center">
                  Navigate to an Awesome Website to save it
                </Text>
              </Flex>
            </Card>
          )}

          {/* Saved Websites Section */}
          <Box>
            <Heading size="3" mb="3">
              Your Saved Lists ({savedWebsites.length})
            </Heading>

            {savedWebsites.length === 0 ? (
              <Card>
                <Flex
                  direction="column"
                  gap="2"
                  align="center"
                  className="py-6"
                >
                  <BookmarkIcon className="w-8 h-8 text-gray-400" />
                  <Text size="2" color="gray" align="center">
                    No saved lists yet
                  </Text>
                </Flex>
              </Card>
            ) : (
              <Flex direction="column" gap="2">
                {savedWebsites.map((website) => (
                  <Card key={website.id}>
                    <Flex direction="column" gap="2">
                      <Flex justify="between" align="start" gap="2">
                        <Box className="flex-1 min-w-0">
                          <Text
                            size="2"
                            weight="bold"
                            className="truncate block"
                          >
                            {website.list.title}
                          </Text>
                          <Text
                            size="1"
                            color="gray"
                            className="truncate block"
                          >
                            {website.list.description}
                          </Text>
                        </Box>
                      </Flex>

                      <Flex gap="2" mt="2">
                        <Button
                          size="1"
                          variant="soft"
                          onClick={() => openWebsite(website.url)}
                          className="flex-1"
                        >
                          <ExternalLinkIcon />
                          Open
                        </Button>
                        <Button
                          size="1"
                          variant="soft"
                          color="red"
                          onClick={() => handleRemoveWebsite(website.id)}
                          disabled={isLoading}
                        >
                          <TrashIcon />
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            )}
          </Box>
        </Box>
      </ScrollArea>
    </Box>
  )
}
