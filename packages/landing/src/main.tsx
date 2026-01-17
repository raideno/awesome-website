import React from 'react'
import ReactDOM from 'react-dom/client'

import { App } from '@/app'

interface ErrorBoundaryProps {
  fallback: React.ReactNode
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error | null
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error }
  }

  componentDidCatch(error: Error, _: React.ErrorInfo): void {
    /**
     * TODO: call posthog or something to notify about the error
     */
    console.error('[error]:', error)
  }

  render(): React.ReactNode {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <ErrorBoundary fallback={<div>Error</div>}>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  )
}
