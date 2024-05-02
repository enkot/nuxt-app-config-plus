import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  appConfigPlus: {
    dir: 'config',
    case: {
      dir: 'camelCase',
      file: 'kebabCase',
    },
  },
})
