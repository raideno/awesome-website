import path from 'node:path'

import * as vite from 'vite'

import viteReact from '@vitejs/plugin-react'

import yamlAwesomeListPlugin from './plugins/yaml-awesome-list'

console.log('[process.env.BASE_PATH]:', process.env.BASE_PATH)
console.log('[process.env.LIST_FILE_PATH]:', process.env.LIST_FILE_PATH)
console.log(
  '[process.env.GITHUB_REPOSITORY_URL]:',
  process.env.GITHUB_REPOSITORY_URL,
)

const GITHUB_REPOSITORY_URL = process.env.GITHUB_REPOSITORY_URL || ''

const [GITHUB_REPOSITORY_OWNER, GITHUB_REPOSITORY_NAME] =
  GITHUB_REPOSITORY_URL.split('/').slice(-2)

const BASE_PATH = process.env.BASE_PATH
  ? process.env.BASE_PATH
  : `/${GITHUB_REPOSITORY_NAME}`

console.log('[BASE_PATH]:', BASE_PATH)
console.log('[GITHUB_REPOSITORY_URL]:', GITHUB_REPOSITORY_URL)
console.log('[GITHUB_REPOSITORY_OWNER]:', GITHUB_REPOSITORY_OWNER)
console.log('[GITHUB_REPOSITORY_NAME]:', GITHUB_REPOSITORY_NAME)

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
    __REPOSITORY_URL__: JSON.stringify(GITHUB_REPOSITORY_URL),
    __REPOSITORY_OWNER__: JSON.stringify(GITHUB_REPOSITORY_OWNER),
    __REPOSITORY_NAME__: JSON.stringify(GITHUB_REPOSITORY_NAME),
  },
  base: BASE_PATH,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
