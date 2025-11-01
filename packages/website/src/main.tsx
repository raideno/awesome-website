import '@radix-ui/themes/styles.css'

import '@/css/global.css'
import '@/css/theme.dark.css'
import '@/css/theme.light.css'

import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'

import { App } from '@/app'
import { Providers } from '@/providers'

import { ThemeProvider } from '@/contexts/theme'

registerSW({
  onNeedRefresh() {
    console.log('New content available; refresh the page.')
  },
  onOfflineReady() {
    console.log('App ready to work offline!')
  },
})

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ThemeProvider>
        <Providers>
          <App />
        </Providers>
      </ThemeProvider>
    </StrictMode>,
  )
}
