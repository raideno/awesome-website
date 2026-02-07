import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'shared/contexts/theme'
import { describe, expect, test } from 'vitest'

import { App } from '@/app'
import { Providers } from '@/providers'

describe('App', () => {
  test('renders', () => {
    render(
      <ThemeProvider>
        <Providers>
          <App />
        </Providers>
      </ThemeProvider>,
    )
    expect(screen.getByPlaceholderText('Search resources...')).toBeDefined()
  })
})
