import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { App } from '@/app'
import { TagFilterProvider } from '@/context/tag-filter'

describe('App', () => {
  test('renders', () => {
    render(
      <TagFilterProvider>
        <App />
      </TagFilterProvider>,
    )
    expect(screen.getByText('Awesome List')).toBeDefined()
  })
})
