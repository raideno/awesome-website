import '@radix-ui/themes/styles.css'

import '@/css/global.css'
import '@/css/theme.dark.css'
import '@/css/theme.light.css'

import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import { App } from '@/app'
import { Providers } from '@/providers'

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <Providers>
        <App />
      </Providers>
    </StrictMode>,
  )
}
