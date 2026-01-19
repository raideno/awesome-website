import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Pattern } from 'shared/components/layout/pattern'

import '@/css/global.css'
import { App } from '@/app.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Pattern />
    <App />
  </StrictMode>,
)
