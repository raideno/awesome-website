# Error Components

Comprehensive error handling components for the awesome-website project.

## Components

### `ErrorComponent`

A standalone error display component with useful debugging actions.

**Features:**
- Clean, user-friendly error display
- Collapsible error details (error name, message, and stack trace)
- Multiple recovery actions:
  - **Try Again**: Reset the error state (if `resetError` is provided)
  - **Refresh Page**: Reload the current page
  - **Clear Storage**: Remove only localStorage items specific to this awesome list
  - **Clear Cache**: Remove all browser caches
  - **Clear All & Refresh**: Clear storage and cache, then reload
- Visual feedback for all actions
- Safe localStorage clearing (only removes prefixed keys)

**Props:**
```tsx
interface ErrorComponentProps {
  error: Error
  resetError?: () => void
  showDetails?: boolean
}
```

**Example:**
```tsx
import { ErrorComponent } from '@/components/utils'

function MyComponent() {
  const [error, setError] = useState<Error | null>(null)

  if (error) {
    return (
      <ErrorComponent
        error={error}
        resetError={() => setError(null)}
        showDetails={true}
      />
    )
  }

  return <div>My content</div>
}
```

### `ErrorBoundary`

A React Error Boundary wrapper that automatically catches errors in child components.

**Features:**
- Catches JavaScript errors anywhere in the child component tree
- Uses `ErrorComponent` as the default fallback UI
- Optional custom fallback renderer
- Optional error logging callback
- Automatic error reset functionality

**Props:**
```tsx
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, resetError: () => void) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}
```

**Example (Basic):**
```tsx
import { ErrorBoundary } from '@/components/utils'

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  )
}
```

**Example (Custom Fallback):**
```tsx
import { ErrorBoundary } from '@/components/utils'

function App() {
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <div>
          <h1>Oops! Something went wrong</h1>
          <p>{error.message}</p>
          <button onClick={resetError}>Try Again</button>
        </div>
      )}
      onError={(error, errorInfo) => {
        // Send to error tracking service
        console.error('Error caught:', error, errorInfo)
      }}
    >
      <YourApp />
    </ErrorBoundary>
  )
}
```

## Actions Explained

### Clear Storage
Removes **only** localStorage items that belong to the current awesome list. This is safe because it uses the same prefixing logic as `useLocalStorageState`:

```
awesome-website=${ownerName}:${repositoryName}:*
```

This ensures that:
- Only data from the current repository is removed
- Other awesome lists on the same domain are unaffected
- No global localStorage items are touched

### Clear Cache
Clears all browser caches using the Cache API. This is useful for:
- Removing stale service worker caches
- Clearing cached API responses
- Forcing fresh data fetches

### Clear All & Refresh
Combines both storage and cache clearing, then automatically reloads the page. This is the "nuclear option" for when things are really broken.

## Safety Features

1. **Prefix-based filtering**: Only clears localStorage keys with the correct prefix
2. **Try-catch protection**: All operations are wrapped in error handlers
3. **User feedback**: Visual confirmation of successful/failed operations
4. **Non-destructive**: Won't affect other sites or global data

## Implementation Details

The error component uses:
- Radix UI components for consistent styling
- Radix Icons for visual elements
- LocalStorage prefix matching from `useLocalStorageState` hook
- Cache API for browser cache management
- Custom events for localStorage updates

## When to Use

- **ErrorBoundary**: Wrap your entire app or major sections to catch unexpected errors
- **ErrorComponent**: Use directly when you have controlled error states (try-catch, async operations, etc.)

## Browser Support

- **localStorage clearing**: All modern browsers
- **Cache API**: Chrome 40+, Firefox 41+, Safari 11.1+, Edge 79+
- Works gracefully in older browsers (operations fail silently)
