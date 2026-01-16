import { Button, Flex } from '@radix-ui/themes'
import { useState } from 'react'

import { ErrorBoundary, ErrorComponent } from './index'

/**
 * Demo component showing different ways to use the error components
 */
export function ErrorComponentDemo() {
  const [showControlledError, setShowControlledError] = useState(false)
  const [controlledError] = useState(
    new Error('This is a controlled error example'),
  )

  return (
    <Flex direction="column" gap="4" p="4">
      <h1>Error Component Demo</h1>

      {/* Example 1: Controlled Error */}
      <section>
        <h2>1. Controlled Error (Manual)</h2>
        <Button onClick={() => setShowControlledError(!showControlledError)}>
          {showControlledError ? 'Hide' : 'Show'} Controlled Error
        </Button>

        {showControlledError && (
          <div style={{ marginTop: '1rem' }}>
            <ErrorComponent
              error={controlledError}
              resetError={() => setShowControlledError(false)}
              showDetails={true}
            />
          </div>
        )}
      </section>

      {/* Example 2: Error Boundary */}
      <section>
        <h2>2. Error Boundary (Automatic)</h2>
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.log('Error caught by boundary:', error, errorInfo)
          }}
        >
          <ComponentThatMightThrow />
        </ErrorBoundary>
      </section>

      {/* Example 3: Error Boundary with Custom Fallback */}
      <section>
        <h2>3. Error Boundary with Custom Fallback</h2>
        <ErrorBoundary
          fallback={(error, resetError) => (
            <div style={{ padding: '2rem', border: '2px solid red' }}>
              <h3>Custom Error UI</h3>
              <p>{error.message}</p>
              <Button onClick={resetError}>Reset</Button>
            </div>
          )}
        >
          <ComponentThatMightThrow />
        </ErrorBoundary>
      </section>
    </Flex>
  )
}

/**
 * A component that can throw an error for demonstration purposes
 */
function ComponentThatMightThrow() {
  const [shouldThrow, setShouldThrow] = useState(false)

  if (shouldThrow) {
    throw new Error('Component threw an error!')
  }

  return (
    <div>
      <p>This component is working fine!</p>
      <Button onClick={() => setShouldThrow(true)} color="red">
        Throw Error
      </Button>
    </div>
  )
}
