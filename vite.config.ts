import path from 'node:path'
import child from 'node:child_process'

import * as vite from 'vite'

import { VitePWA } from 'vite-plugin-pwa'
import viteReact from '@vitejs/plugin-react'
import yamlAwesomeListPlugin, {
  loadAwesomeList,
} from './plugins/yaml-awesome-list'
import metadataAwesomeList from './plugins/metadata-awesome-list'

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

const AWESOME_LIST = loadAwesomeList(YAML_FILE_PATH)

const USER_REPOSITORY_COMMIT_HASH = (() => {
  if (process.env.USER_REPOSITORY_COMMIT_HASH) {
    return process.env.USER_REPOSITORY_COMMIT_HASH
  }
  try {
    return child.execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
  } catch (error) {
    console.warn('[error]: could not get user repository commit hash:', error)
    return ''
  }
})()

const AWESOME_WEBSITE_BUILD_COMMIT_HASH =
  process.env.AWESOME_WEBSITE_COMMIT_HASH || ''

const GITHUB_WORKFLOW_NAME = process.env.GITHUB_WORKFLOW_NAME || ''
const GITHUB_WORKFLOW_REF = process.env.GITHUB_WORKFLOW_REF || ''

// NOTE: try to extract workflow filename from github.workflow_ref or github.workflow
// github.workflow_ref format: owner/repo/.github/workflows/filename.yml@refs/heads/branch
// github.workflow can be either a name (e.g., "Build Awesome Website") or filename
const GITHUB_WORKFLOW_FILE_NAME = (() => {
  if (GITHUB_WORKFLOW_REF) {
    const match = GITHUB_WORKFLOW_REF.match(/\.github\/workflows\/([^@]+)/)
    if (match?.[1]) {
      return match[1]
    }
  }

  if (
    GITHUB_WORKFLOW_NAME &&
    (GITHUB_WORKFLOW_NAME.endsWith('.yml') ||
      GITHUB_WORKFLOW_NAME.endsWith('.yaml'))
  ) {
    return GITHUB_WORKFLOW_NAME
  }

  return ''
})()

console.log('[BASE_PATH]:', BASE_PATH)
console.log('[GITHUB_REPOSITORY_URL]:', GITHUB_REPOSITORY_URL)
console.log('[GITHUB_REPOSITORY_OWNER]:', GITHUB_REPOSITORY_OWNER)
console.log('[GITHUB_REPOSITORY_NAME]:', GITHUB_REPOSITORY_NAME)
console.log('[YAML_FILE_PATH]:', YAML_FILE_PATH)
console.log('[USER_REPOSITORY_COMMIT_HASH]:', USER_REPOSITORY_COMMIT_HASH)
console.log(
  '[AWESOME_WEBSITE_BUILD_COMMIT_HASH]:',
  AWESOME_WEBSITE_BUILD_COMMIT_HASH,
)
console.log('[GITHUB_WORKFLOW_NAME]:', GITHUB_WORKFLOW_NAME)
console.log('[GITHUB_WORKFLOW_REF]:', GITHUB_WORKFLOW_REF)
console.log('[GITHUB_WORKFLOW_FILE_NAME]:', GITHUB_WORKFLOW_FILE_NAME)

// NOTE: https://vitejs.dev/config/
export default vite.defineConfig({
  plugins: [
    viteReact(),
    yamlAwesomeListPlugin(YAML_FILE_PATH),
    metadataAwesomeList(AWESOME_LIST, GITHUB_REPOSITORY_URL),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB
      },
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
    __USER_REPOSITORY_COMMIT_HASH__: JSON.stringify(
      USER_REPOSITORY_COMMIT_HASH,
    ),
    __AWESOME_WEBSITE_BUILD_COMMIT_HASH__: JSON.stringify(
      AWESOME_WEBSITE_BUILD_COMMIT_HASH,
    ),
    __GITHUB_WORKFLOW_FILE_NAME__: JSON.stringify(GITHUB_WORKFLOW_FILE_NAME),
  },
  base: BASE_PATH,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
