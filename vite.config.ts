import path from 'node:path'
import child from 'node:child_process'

import * as vite from 'vite'

import { VitePWA } from 'vite-plugin-pwa'
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

const YAML_FILE_PATH = process.env.LIST_FILE_PATH || ''

const BUILD_COMMIT_HASH = (() => {
  try {
    return child.execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
  } catch (error) {
    console.warn('Could not get commit hash:', error)
    return ''
  }
})()

console.log('[BASE_PATH]:', BASE_PATH)
console.log('[GITHUB_REPOSITORY_URL]:', GITHUB_REPOSITORY_URL)
console.log('[GITHUB_REPOSITORY_OWNER]:', GITHUB_REPOSITORY_OWNER)
console.log('[GITHUB_REPOSITORY_NAME]:', GITHUB_REPOSITORY_NAME)
console.log('[YAML_FILE_PATH]:', YAML_FILE_PATH)
console.log('[BUILD_COMMIT_HASH]:', BUILD_COMMIT_HASH)

// NOTE: https://vitejs.dev/config/
export default vite.defineConfig({
  plugins: [
    viteReact(),
    yamlAwesomeListPlugin(YAML_FILE_PATH),
    VitePWA({
      registerType: 'autoUpdate',
    }),
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
    __YAML_FILE_PATH__: JSON.stringify(YAML_FILE_PATH),
    __BUILD_COMMIT_HASH__: JSON.stringify(BUILD_COMMIT_HASH),
  },
  base: BASE_PATH,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
