import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

import { AwesomeListSchema } from './src/data/awesome-list-schema'

import type { Plugin } from 'vite'
import type { AwesomeList } from './src/data/awesome-list-schema'

const validateListFile = (listPath: string | undefined): AwesomeList => {
  if (!listPath) {
    throw new Error('LIST_FILE_PATH environment variable is not set')
  }

  if (!fs.existsSync(listPath)) {
    throw new Error(`Awesome list file not found at ${listPath}`)
  }

  const yamlContent = fs.readFileSync(listPath, 'utf8')
  const rawList = yaml.load(yamlContent)

  const parsing = AwesomeListSchema.safeParse(rawList)
  if (!parsing.success) {
    throw new Error(`Invalid awesome list data: ${parsing.error.message}`)
  }

  return parsing.data
}

export default (): Plugin => {
  const virtualModuleId = 'virtual:awesome-list'
  const resolvedVirtualModuleId = '\0' + virtualModuleId
  let listPath: string | undefined

  return {
    name: 'yaml-awesome-list',
    enforce: 'pre',

    configResolved(config) {
      listPath = process.env.LIST_FILE_PATH

      validateListFile(listPath)

      if (listPath) {
        const absPath = path.resolve(config.root, listPath)
        config.logger.info(`[yaml-awesome-list] Watching: ${absPath}`)
      }
    },
    // NOTE: https://github.com/antfu/vite-plugin-restart/blob/main/src/index.ts
    configureServer(server) {
      if (listPath) {
        const absPath = path.resolve(server.config.root, listPath)
        server.watcher.add(absPath)
        server.watcher.on('change', () => {
          server.moduleGraph.invalidateAll()
          server.ws.send({ type: 'full-reload' })
        })
      }
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },

    load(id) {
      if (id === resolvedVirtualModuleId) {
        const awesomeList = validateListFile(listPath)
        return `export default ${JSON.stringify(awesomeList)}`
      }
    },
  }
}
