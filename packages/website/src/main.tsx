import '@radix-ui/themes/styles.css'

import '@/css/global.css'
import '@/css/theme.dark.css'
import '@/css/theme.light.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from 'shared/contexts/theme'
import { registerSW } from 'virtual:pwa-register'
import { Pattern } from 'shared/components/layout/pattern'

import { App } from '@/app'
import { Providers } from '@/providers'

import { ErrorComponent } from '@/components/utils'

registerSW({
  onNeedRefresh() {
    console.log('New content available; refresh the page.')
  },
  onOfflineReady() {
    console.log('App ready to work offline!')
  },
})

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
      <ErrorBoundary
        fallback={
          <ErrorComponent showDetails={true} error={new Error('Idk')} />
        }
      >
        <ThemeProvider>
          <Providers>
            <Pattern />
            <App />
          </Providers>
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  )
}
