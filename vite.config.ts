import path from 'node:path'

import * as vite from 'vite'

import viteReact from '@vitejs/plugin-react'

import yamlAwesomeListPlugin from './yaml-plugin'

let base = '/'

if (process.env.BASE_PATH) {
  base = process.env.BASE_PATH
} else if (process.env.GITHUB_REPOSITORY) {
  const [, repo] = process.env.GITHUB_REPOSITORY.split('/')
  base = `/${repo}/`
}

// NOTE: https://vitejs.dev/config/
export default vite.defineConfig({
  plugins: [viteReact(), yamlAwesomeListPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  base: base,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
