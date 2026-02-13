import { useCallback, useEffect, useState } from "react";

/**
 * Generates a prefixed localStorage key to avoid conflicts between different
 * awesome lists hosted on the same domain (e.g., GitHub Pages).
 *
 * @param key - The original key
 * @returns The prefixed key in the format: `awesome-website:${repositoryName}:${key}`
 */
function getPrefixedKey(
  repositoryOwner: string,
  repositoryName: string,
  key: string,
): string {
  return `awesome-website=${repositoryOwner}:${repositoryName}:${key}`;
}

export function useLocalStorageStateFactory(
  repositoryOwner: string = "default-owner",
  repositoryName: string = "default-repository",
) {
  function useLocalStorageState<T>(
    key: string,
    initialValue: T,
    options: {
      serialize?: (value: T) => string;
      deserialize?: (value: string) => T;
    } = {},
  ) {
    const { serialize = JSON.stringify, deserialize = JSON.parse } = options;

    const prefixedKey = getPrefixedKey(repositoryOwner, repositoryName, key);

    const getStoredValue = useCallback((): T => {
      try {
        const item = window.localStorage.getItem(prefixedKey);
        return item ? deserialize(item) : initialValue;
      } catch (error) {
        console.warn(`Error reading localStorage key "${prefixedKey}":`, error);
        return initialValue;
      }
    }, [prefixedKey, initialValue, deserialize]);

    const [state, setState] = useState<T>(getStoredValue);

    const setValue = useCallback(
      (value: T | ((val: T) => T)) => {
        try {
          const valueToStore = value instanceof Function ? value(state) : value;

          setState(valueToStore);

          window.localStorage.setItem(prefixedKey, serialize(valueToStore));

          window.dispatchEvent(
            new CustomEvent("localStorage-update", {
              detail: { key: prefixedKey, value: valueToStore },
            }),
          );
        } catch (error) {
          console.warn(
            `Error setting localStorage key "${prefixedKey}":`,
            error,
          );
        }
      },
      [prefixedKey, serialize, state],
    );

    useEffect(() => {
      const handleStorageChange = (e: StorageEvent | CustomEvent) => {
        if ("key" in e && e.key === prefixedKey) {
          if (e.newValue !== null) {
            try {
              const newValue = deserialize(e.newValue);
              setState(newValue);
            } catch (error) {
              console.warn(
                `Error deserializing localStorage key "${prefixedKey}":`,
                error,
              );
            }
          }
        } else if ("detail" in e && e.detail?.key === prefixedKey) {
          setState(e.detail.value);
        }
      };

      window.addEventListener("storage", handleStorageChange);

      window.addEventListener(
        "localStorage-update",
        handleStorageChange as EventListener,
      );

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener(
          "localStorage-update",
          handleStorageChange as EventListener,
        );
      };
    }, [prefixedKey, deserialize]);

    const clearValue = useCallback(() => {
      try {
        window.localStorage.removeItem(prefixedKey);
        setState(initialValue);

        window.dispatchEvent(
          new CustomEvent("localStorage-update", {
            detail: { key: prefixedKey, value: initialValue },
          }),
        );
      } catch (error) {
        console.warn(
          `Error removing localStorage key "${prefixedKey}":`,
          error,
        );
      }
    }, [prefixedKey, initialValue]);

    return [state, setValue, clearValue] as const;
  }

  return useLocalStorageState;
}
