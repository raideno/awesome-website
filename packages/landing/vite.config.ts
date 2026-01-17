import path from 'node:path'

import * as vite from 'vite'

import viteReact from '@vitejs/plugin-react'

// NOTE: https://vitejs.dev/config/
export default vite.defineConfig({
  plugins: [viteReact()],
  base: '/awesome',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
