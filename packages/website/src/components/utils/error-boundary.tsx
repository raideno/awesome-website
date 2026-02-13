import { Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import {
  CodeIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  ReloadIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";

interface ErrorComponentProps {
  error: Error;
  resetError?: () => void;
  showDetails?: boolean;
}

/**
 * Gets the prefix for localStorage keys based on the current repository
 */
function getLocalStoragePrefix(): string {
  const repositoryName =
    __CONFIGURATION__.repository.name || "default-repository";
  const ownerName = __CONFIGURATION__.repository.owner || "default-owner";
  return `awesome-website=${ownerName}:${repositoryName}:`;
}

/**
 * Clears only localStorage keys that belong to this awesome website
 */
function clearWebsiteLocalStorage(): number {
  const prefix = getLocalStoragePrefix();
  let clearedCount = 0;

  try {
    const keysToRemove: Array<string> = [];

    // Collect all keys that match our prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    // Remove them
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      clearedCount++;
    });

    console.log(
      `Cleared ${clearedCount} localStorage items with prefix: ${prefix}`,
    );
  } catch (err) {
    console.error("Failed to clear localStorage:", err);
  }

  return clearedCount;
}

/**
 * Clears the browser cache using the Cache API
 */
async function clearBrowserCache(): Promise<number> {
  try {
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      console.log(`Cleared ${cacheNames.length} cache(s)`);
      return cacheNames.length;
    }
  } catch (err) {
    console.error("Failed to clear cache:", err);
  }
  return 0;
}

export function ErrorComponent({
  error,
  resetError,
  showDetails = true,
}: ErrorComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearMessage, setClearMessage] = useState<string | null>(null);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleClearLocalStorage = () => {
    setIsClearing(true);
    setClearMessage(null);

    try {
      const count = clearWebsiteLocalStorage();
      setClearMessage(`✓ Cleared ${count} item(s) from localStorage`);

      // Auto-hide message after 3 seconds
      setTimeout(() => {
        setClearMessage(null);
      }, 3000);
    } catch (err) {
      setClearMessage("✗ Failed to clear localStorage");
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    setClearMessage(null);

    try {
      const count = await clearBrowserCache();
      if (count > 0) {
        setClearMessage(`✓ Cleared ${count} cache(s)`);
      } else {
        setClearMessage("✓ No caches to clear");
      }

      // Auto-hide message after 3 seconds
      setTimeout(() => {
        setClearMessage(null);
      }, 3000);
    } catch (err) {
      setClearMessage("✗ Failed to clear cache");
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    setClearMessage(null);

    try {
      const localStorageCount = clearWebsiteLocalStorage();
      const cacheCount = await clearBrowserCache();

      setClearMessage(
        `✓ Cleared ${localStorageCount} localStorage item(s) and ${cacheCount} cache(s)`,
      );

      // Auto-hide message and reload after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setClearMessage("✗ Failed to clear data");
      setIsClearing(false);
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      className="min-h-screen p-4 bg-[var(--color-background)]"
    >
      <Card style={{ maxWidth: "600px", width: "100%" }} className="shadow-xl">
        <Flex direction="column" gap="4">
          {/* Header */}
          <Flex align="center" gap="3">
            <ExclamationTriangleIcon
              width="32"
              height="32"
              className="text-red-500"
            />
            <Heading size="6">Something went wrong</Heading>
          </Flex>

          {/* Error message */}
          <Text size="3" color="gray">
            We encountered an unexpected error. You can try one of the actions
            below to resolve the issue.
          </Text>

          {/* Error details (collapsible) */}
          {showDetails && (
            <Flex direction="column" gap="2">
              <Button
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ justifyContent: "flex-start" }}
              >
                <CodeIcon />
                {isExpanded ? "Hide" : "Show"} error details
              </Button>

              {isExpanded && (
                <Card
                  style={{
                    backgroundColor: "var(--gray-3)",
                    padding: "12px",
                  }}
                >
                  <Flex direction="column" gap="2">
                    <Text size="2" weight="bold" color="red">
                      {error.name}
                    </Text>
                    <Text
                      size="2"
                      style={{
                        fontFamily: "monospace",
                        wordBreak: "break-word",
                      }}
                    >
                      {error.message}
                    </Text>
                    {error.stack && (
                      <Text
                        size="1"
                        color="gray"
                        style={{
                          fontFamily: "monospace",
                          whiteSpace: "pre-wrap",
                          maxHeight: "200px",
                          overflow: "auto",
                        }}
                      >
                        {error.stack}
                      </Text>
                    )}
                  </Flex>
                </Card>
              )}
            </Flex>
          )}

          {/* Action message */}
          {clearMessage && (
            <Card
              style={{
                backgroundColor: clearMessage.startsWith("✓")
                  ? "var(--green-3)"
                  : "var(--red-3)",
                padding: "12px",
              }}
            >
              <Text size="2" weight="medium">
                {clearMessage}
              </Text>
            </Card>
          )}

          {/* Action buttons */}
          <Flex direction="column" gap="3">
            {resetError && (
              <Button
                size="3"
                variant="soft"
                color="blue"
                onClick={resetError}
                disabled={isClearing}
              >
                <Cross2Icon />
                Try again
              </Button>
            )}

            <Button
              size="3"
              variant="soft"
              color="green"
              onClick={handleRefresh}
              disabled={isClearing}
            >
              <ReloadIcon />
              Refresh page
            </Button>

            <Flex gap="2">
              <Button
                size="3"
                variant="soft"
                color="orange"
                onClick={handleClearLocalStorage}
                disabled={isClearing}
                style={{ flex: 1 }}
              >
                <TrashIcon />
                Clear storage
              </Button>

              <Button
                size="3"
                variant="soft"
                color="orange"
                onClick={handleClearCache}
                disabled={isClearing}
                style={{ flex: 1 }}
              >
                <TrashIcon />
                Clear cache
              </Button>
            </Flex>

            <Button
              size="3"
              variant="solid"
              color="red"
              onClick={handleClearAll}
              disabled={isClearing}
            >
              <TrashIcon />
              {isClearing ? "Clearing..." : "Clear all data & refresh"}
            </Button>
          </Flex>

          {/* Warning text */}
          <Text size="1" color="gray" align="center">
            Note: "Clear storage" only removes data specific to this awesome
            list
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
}
