import { existsSync, promises as fsp } from 'node:fs'
import { defineNuxtModule, findPath, addTemplate } from '@nuxt/kit'
import pathe from 'pathe'
import { camelCase, kebabCase } from 'scule'

const moduleName = 'app-config-plus'
const extensionsRe = /\.(js|mjs|cjs|ts|mts|cts|json)$/

type Case = 'camelCase' | 'kebabCase' | {
  dir?: 'camelCase' | 'kebabCase'
  file?: 'camelCase' | 'kebabCase'
}

export interface ModuleOptions {
  dir: string
  case?: Case
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
    const layersConfigs = (await Promise.all(nuxt.options._layers.map(async (layer, index) => {
      const filePath = await findPath(pathe.resolve(layer.config.srcDir, 'app.config'))

      if (filePath) return filePath

      const dirPath = pathe.resolve(layer.config.srcDir, options.dir)

      if (existsSync(dirPath) && await isDirectory(dirPath)) {
        const sources: { name: string, path: string }[] = []
        const config = await pathToNestedObject(dirPath, { sources, case: options.case })
        const filename = `app-configs/cfg${index}.ts`

        addTemplate({
          filename,
          getContents: () => `
${sources.map(({ name, path }) => `import ${name} from "${pathe.extname(path) === '.json' ? path : removeExtension(path)}"`).join('\n')}

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
      nitro.hooks.hook('prerender:config', async (config) => {
        config.appConfigFiles = layersConfigs
      })
    })
  },
})

async function pathToNestedObject(
  dirPath: string,
  opts?: {
    sources?: { name: string, path: string }[]
    serverSide?: boolean
    case?: Case
  },
  originalPath = dirPath,
) {
  const fileMap: Record<string, unknown> = {}
  const dirContent = await fsp.readdir(dirPath, { withFileTypes: true })

  for (const dirent of dirContent!) {
    const fullPath = pathe.resolve(dirPath, dirent.name)
    if (dirent.isDirectory()) {
      fileMap[changeCase(dirent.name, typeof opts?.case === 'object' ? opts.case.dir : opts?.case)] = await pathToNestedObject(fullPath, opts, originalPath)
    }
    else if (dirent.isFile() && extensionsRe.test(dirent.name)) {
      const relativePath = removeExtension(pathe.relative(originalPath, fullPath))
      const name = camelCase(relativePath.replaceAll(/@/g, ''))
      fileMap[changeCase(removeExtension(dirent.name), typeof opts?.case === 'object' ? opts.case.file : opts?.case)] = `{${name}}`
      opts?.sources?.push({ name, path: fullPath })
    }
  }

  if (fileMap.index) {
    const { index, ...rest } = fileMap
    return Object.keys(rest).length ? [index, rest] : index
  }

  return fileMap
}

function unpackObjectValues(config: object) {
  return removeNestedBrackets(JSON.stringify(config))
    .replaceAll(/"{(.+?)}"/g, '$1')
    .replaceAll(/"@(.+?)":/g, '"$1":import.meta.client?null:')
}

function removeNestedBrackets(val: string): string {
  const newVal = val.replace(/\[(.+?),{(.+?)}\]/g, '{...$1,$2}')
  return newVal === val ? val : removeNestedBrackets(newVal)
}

function removeExtension(path: string) {
  return path.replace(extensionsRe, '')
}

async function isDirectory(path: string) {
  return (await fsp.lstat(path)).isDirectory()
}

function changeCase(input: string, caseType?: 'camelCase' | 'kebabCase') {
  if (caseType === 'camelCase') return camelCase(input)
  if (caseType === 'kebabCase') return kebabCase(input)
  return input
}
