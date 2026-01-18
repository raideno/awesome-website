import { Outlet, createRootRoute } from '@tanstack/react-router'
import * as React from 'react'

export const Route = createRootRoute({
  notFoundComponent: () => <div>Extension Route Not Found</div>,
  component: () => {
    return (
      <React.Fragment>
        <Outlet />
      </React.Fragment>
    )
  },
})
