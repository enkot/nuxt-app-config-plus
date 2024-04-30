import { promises as fsp } from 'node:fs'
import { createResolver, defineNuxtModule, findPath, addTemplate } from '@nuxt/kit'
import pathe from 'pathe'
import { camelCase } from 'scule'

const moduleName = 'app-config-plus'

export interface ModuleOptions {
  dir: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: `nuxt-${moduleName}`,
    configKey: camelCase(moduleName),
  },
  defaults: {
    dir: 'app-config',
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    const layersConfigs = (await Promise.all(nuxt.options._layers.map(async (layer, index) => {
      const filePath = await findPath(resolve(layer.config.srcDir, 'app.config'))

      if (filePath) return filePath

      const dirPath = await findPath(resolve(layer.config.srcDir, options.dir), {}, 'dir')

      if (dirPath) {
        const sources: { name: string, path: string }[] = []
        const config = await pathToNestedObject(dirPath, sources)
        const filename = `app-configs/cfg${index}.ts`

        addTemplate({
          filename,
          getContents: () => `
${sources.map(({ name, path }) => `import ${name} from "${path}"`).join('\n')}

export default ${unpackObjectValues(config)}
          `,
          write: true,
        })

        return pathe.resolve(nuxt.options.buildDir, filename)
      }
    }))).filter(Boolean) as string[]

    nuxt.hook('app:resolve', (app) => {
      app.configs = layersConfigs
    })

    nuxt.hook('nitro:init', async (nitro) => {
      nitro.options.appConfigFiles = layersConfigs
    })
  },
})

async function pathToNestedObject(
  dirPath: string,
  sources?: { name: string, path: string }[],
  originalPath = dirPath,
) {
  const fileMap: Record<string, unknown> = {}
  const dirContent = await fsp.readdir(dirPath, { withFileTypes: true })

  for (const dirent of dirContent!) {
    const fullPath = pathe.resolve(dirPath, dirent.name)
    if (dirent.isDirectory()) {
      fileMap[dirent.name] = await pathToNestedObject(fullPath, sources, originalPath)
    }
    else if (dirent.isFile()) {
      const relativePath = removeExtension(pathe.relative(originalPath, fullPath))
      const name = camelCase(relativePath)
      fileMap[removeExtension(dirent.name)] = `{${name}}`
      sources?.push({ name, path: fullPath })
    }
  }

  if (fileMap.index) {
    const { index, ...rest } = fileMap
    return Object.keys(rest).length ? [index, rest] : index
  }

  return fileMap
}

function unpackObjectValues(config: object) {
  return JSON.stringify(config)
    .replaceAll(/\[(.+?),{(.+?)}\]/g, '{...$1,$2}')
    .replaceAll(/"{(.+?)}"/g, '$1')
}

function removeExtension(path: string) {
  return path.replace(/\.(js|mjs|cjs|ts|mts|cts|json)$/, '')
}
