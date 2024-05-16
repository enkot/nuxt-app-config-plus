import { existsSync, promises as fsp } from 'node:fs'
import { defineNuxtModule, findPath, addTemplate } from '@nuxt/kit'
import pathe from 'pathe'
import { camelCase, kebabCase } from 'scule'
import type { NuxtConfigLayer } from 'nuxt/schema'

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
    const layersConfigs = (await Promise.all(nuxt.options._layers.map(async (layer: NuxtConfigLayer, index: number) => {
      const filePath = await findPath(pathe.resolve(layer.config.srcDir, 'app.config'))

      if (filePath) return { nuxt: filePath, nitro: filePath }

      const dirPath = pathe.resolve(layer.config.srcDir, options.dir)

      if (existsSync(dirPath) && await isDirectory(dirPath)) {
        const name = `cfg${index}`
        const nuxtFilename = `app-configs/${name}.ts`
        const nitroFilename = `app-configs/server/${name}.ts`
        const sources: { name: string, path: string }[] = []
        const { server, ...config } = await pathToNestedObject(dirPath, { sources, case: options.case })

        addTemplate({
          filename: nuxtFilename,
          async getContents() {
            return (
`${mapImports(sources.filter(({ name }) => !kebabCase(name).startsWith('server-')))}
    
export default ${unpackObjectValues(config)}
`.trimStart())
          },
          write: true,
        })

        addTemplate({
          filename: nitroFilename,
          async getContents() {
            return (
`${mapImports(sources.filter(({ name }) => kebabCase(name).startsWith('server-')))}
import ${name} from "../${name}"
    
export default ${server ? `{...${name},server:${unpackObjectValues(server)}}` : `${name}`}
`.trimStart())
          },
          write: true,
        })

        return {
          nuxt: pathe.resolve(nuxt.options.buildDir, nuxtFilename),
          nitro: pathe.resolve(nuxt.options.buildDir, nitroFilename),
        }
      }
    }))).filter(Boolean) as {
      nuxt: string
      nitro: string
    }[]

    nuxt.hook('app:resolve', (app) => {
      app.configs = layersConfigs.map(({ nuxt }) => nuxt)
    })

    nuxt.hook('nitro:init', async (nitro) => {
      const appConfigFiles = layersConfigs.map(({ nitro }) => nitro)
      nitro.options.appConfigFiles = appConfigFiles
      nitro.hooks.hook('prerender:config', async (config) => {
        config.appConfigFiles = appConfigFiles
      })
    })
  },
})

async function pathToNestedObject(
  dirPath: string,
  opts?: {
    sources?: { name: string, path: string }[]
    case?: Case
  },
  originalPath = dirPath,
): Promise<{
  [key: string]: unknown
  server?: Record<string, unknown>
}> {
  const fileMap: Record<string, unknown> = {}
  const dirContent = await fsp.readdir(dirPath, { withFileTypes: true })

  for (const dirent of dirContent!) {
    const fullPath = pathe.resolve(dirPath, dirent.name)
    if (dirent.isDirectory()) {
      fileMap[changeCase(dirent.name, typeof opts?.case === 'object' ? opts.case.dir : opts?.case)] = await pathToNestedObject(fullPath, opts, originalPath)
    }
    else if (dirent.isFile() && extensionsRe.test(dirent.name)) {
      const relativePath = removeExtension(pathe.relative(originalPath, fullPath))
      const name = camelCase(relativePath)
      fileMap[changeCase(removeExtension(dirent.name), typeof opts?.case === 'object' ? opts.case.file : opts?.case)] = `{${name}}`
      opts?.sources?.push({ name, path: fullPath })
    }
  }

  if (fileMap.index) {
    const { index, ...rest } = fileMap
    // @ts-expect-error - TS doesn't understand that `index` is a key
    return Object.keys(rest).length ? [index, rest] : index
  }

  return fileMap
}

function mapImports(sources: { name: string, path: string }[]) {
  return sources.map(({ name, path }) => `import ${name} from "${pathe.extname(path) === '.json' ? path : removeExtension(path)}"`).join('\n')
}

function unpackObjectValues(config: object) {
  return removeNestedBrackets(JSON.stringify(config))
    .replaceAll(/"{(.+?)}"/g, '$1')
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
