import '@radix-ui/themes/styles.css'

import '@/css/global.css'
import '@/css/theme.dark.css'
import '@/css/theme.light.css'

import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import { App } from '@/app'
import { Providers } from '@/providers'

import { ThemeProvider } from '@/context/theme'

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
