import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const [isAwesomeWebsite, setIsAwesomeWebsite] = useState(false)
  const [websiteInfo, setWebsiteInfo] = useState<{
    title?: string
    url?: string
  }>({})

  useEffect(() => {
    // Function to check if current tab is an awesome website
    const checkAwesomeWebsite = async () => {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        })

        if (!tab.id) return

        // Execute script in the page context to check for markers
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Check for various markers
            const hasMetaTag =
              document.querySelector('meta[name="awesome-website"]') !== null
            const hasDataAttr =
              document.documentElement.dataset.awesomeWebsite === 'true'
            const hasGlobalVar =
              '__AWESOME_WEBSITE__' in window &&
              window['__AWESOME_WEBSITE__'] === true
            const hasGeneratorMeta =
              document.querySelector(
                'meta[name="generator"][content="awesome-website"]',
              ) !== null

            return {
              isAwesome:
                hasMetaTag || hasDataAttr || hasGlobalVar || hasGeneratorMeta,
              title: document.title,
              url: window.location.href,
            }
          },
        })

        if (results.length > 0 && results[0]?.result) {
          const { isAwesome, title, url } = results[0].result
          setIsAwesomeWebsite(isAwesome)
          setWebsiteInfo({ title, url })
        }
      } catch (error) {
        console.error('Error checking awesome website:', error)
      }
    }

    checkAwesomeWebsite()

    // Listen for tab updates
    const handleTabUpdate = () => checkAwesomeWebsite()
    chrome.tabs.onUpdated.addListener(handleTabUpdate)
    chrome.tabs.onActivated.addListener(handleTabUpdate)

    return () => {
      chrome.tabs.onUpdated.removeListener(handleTabUpdate)
      chrome.tabs.onActivated.removeListener(handleTabUpdate)
    }
  }, [])

  return (
    <>
      <div className="p-4 space-y-4">
        {isAwesomeWebsite && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-6 h-6"
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
              <h2 className="font-bold text-lg">Awesome Website Detected!</h2>
            </div>
            <p className="text-sm mt-2 opacity-90">
              You're viewing an Awesome List website
            </p>
            {websiteInfo.title && (
              <p className="text-xs mt-1 opacity-75 truncate">
                {websiteInfo.title}
              </p>
            )}
          </div>
        )}

        <div className="text-gray-700 dark:text-gray-300">
          <h3 className="font-semibold mb-2">Extension Panel</h3>
          <p className="text-sm">
            {isAwesomeWebsite
              ? 'Browse this awesome list with enhanced features!'
              : 'Navigate to an Awesome Website to see enhanced features.'}
          </p>
        </div>
      </div>
    </>
  )
}
