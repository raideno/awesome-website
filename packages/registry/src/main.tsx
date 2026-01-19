import '@/css/global.css'
import '@/css/theme.dark.css'
import '@/css/theme.light.css'

import '@radix-ui/themes/styles.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import { ThemeProvider } from 'shared/contexts/theme'

import { App } from '@/app'
import { Providers } from '@/providers'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Providers>
        <App />
      </Providers>
    </ThemeProvider>
  </React.StrictMode>,
)
