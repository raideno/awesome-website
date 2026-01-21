import type { AwesomeList } from 'shared/types/awesome-list'

export interface SavedAwesomeWebsite {
  id: string
  title: string
  url: string
  savedAt: number
  list: AwesomeList
}

const STORAGE_KEY = 'saved-awesome-websites'

/**
 * Get all saved awesome websites from local storage
 */
export const getSavedWebsites = async (): Promise<
  Array<SavedAwesomeWebsite>
> => {
  try {
    const result = (await chrome.storage.local.get(STORAGE_KEY)) as unknown as {
      [STORAGE_KEY]: Array<SavedAwesomeWebsite> | undefined
    }

    return result[STORAGE_KEY] || []
  } catch (error) {
    alert(JSON.stringify(error))

    console.error('Error getting saved websites:', error)
    return []
  }
}

/**
 * Save an awesome website to local storage
 */
export const saveWebsite = async (
  website: Omit<SavedAwesomeWebsite, 'id' | 'savedAt'>,
): Promise<SavedAwesomeWebsite> => {
  try {
    const saved = await getSavedWebsites()

    // Check if website already exists by URL
    const existingIndex = saved.findIndex((w) => w.url === website.url)

    const newWebsite: SavedAwesomeWebsite = {
      ...website,
      id: existingIndex >= 0 ? saved[existingIndex].id : Date.now().toString(),
      savedAt: Date.now(),
    }

    if (existingIndex >= 0) {
      // Update existing
      saved[existingIndex] = newWebsite
    } else {
      // Add new
      saved.unshift(newWebsite)
    }

    await chrome.storage.local.set({ [STORAGE_KEY]: saved })
    return newWebsite
  } catch (error) {
    console.error('Error saving website:', error)
    throw error
  }
}

/**
 * Remove a saved website by ID
 */
export const removeWebsite = async (id: string): Promise<void> => {
  try {
    const saved = await getSavedWebsites()
    const filtered = saved.filter((w) => w.id !== id)
    await chrome.storage.local.set({ [STORAGE_KEY]: filtered })
  } catch (error) {
    console.error('Error removing website:', error)
    throw error
  }
}

/**
 * Check if a website is already saved
 */
export const isWebsiteSaved = async (url: string): Promise<boolean> => {
  try {
    const saved = await getSavedWebsites()
    return saved.some((w) => w.url === url)
  } catch (error) {
    console.error('Error checking if website is saved:', error)
    return false
  }
}
