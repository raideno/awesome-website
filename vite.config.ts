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

console.log('[base]:', base)
console.log('[process.env.BASE_PATH]:', process.env.BASE_PATH)
console.log('[process.env.LIST_FILE_PATH]:', process.env.LIST_FILE_PATH)
console.log(
  '[process.env.GITHUB_REPOSITORY_URL]:',
  process.env.GITHUB_REPOSITORY_URL,
)

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
    __REPOSITORY_URL__: JSON.stringify(process.env.GITHUB_REPOSITORY_URL),
  },
  base: base,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
