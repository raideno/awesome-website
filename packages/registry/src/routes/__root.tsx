import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => {
    return (
      <React.Fragment>
        <div className="mx-auto max-w-4xl">
          <div>Hello "__root"!</div>
          <Outlet />
        </div>
      </React.Fragment>
    )
  },
})
