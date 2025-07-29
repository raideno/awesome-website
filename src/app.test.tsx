import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'

import { App } from '@/app'
import { Providers } from '@/providers'
import { ThemeProvider } from '@/context/theme'

describe('App', () => {
  test('renders', () => {
    render(
      <ThemeProvider>
        <Providers>
          <App />
        </Providers>
        ,
      </ThemeProvider>,
    )
    expect(screen.getByText('Awesome List')).toBeDefined()
  })
})
