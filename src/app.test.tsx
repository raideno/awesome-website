import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'

import { App } from '@/app'
import { Providers } from '@/providers'

describe('App', () => {
  test('renders', () => {
    render(
      <Providers>
        <App />
      </Providers>,
    )
    expect(screen.getByText('Awesome List')).toBeDefined()
  })
})
