import '@/css/global.css'
import '@/css/theme.dark.css'
import '@/css/theme.light.css'
import '@radix-ui/themes/styles.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Pattern } from 'shared/components/layout/pattern'
import { ThemeProvider } from 'shared/contexts/theme'

import { App } from '@/app.tsx'
import { Providers } from '@/providers'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Providers>
        <Pattern />
        <App />
      </Providers>
    </ThemeProvider>
  </StrictMode>,
)
