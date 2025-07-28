import path from 'node:path'

import * as vite from 'vite'

import viteReact from '@vitejs/plugin-react'

import yamlAwesomeListPlugin from './plugins/yaml-awesome-list'

let base = '/'

if (process.env.BASE_PATH) {
  base = process.env.BASE_PATH
} else if (process.env.GITHUB_REPOSITORY_URL) {
  const [, repo] = process.env.GITHUB_REPOSITORY_URL.split('/')
  base = `/${repo}/`
}

console.log('[github-repository-url]', process.env.GITHUB_REPOSITORY_URL)

// NOTE: https://vitejs.dev/config/
export default vite.defineConfig({
  plugins: [
    viteReact(),
    yamlAwesomeListPlugin(process.env.LIST_FILE_PATH || ''),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __REPOSITORY_URL__: process.env.GITHUB_REPOSITORY_URL,
  },
  base: base,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
