export default defineNuxtConfig({
  modules: ['../src/module'],
  appConfigPlus: {
    dir: 'config/app',
    case: {
      dir: 'camelCase',
      file: 'kebabCase',
    },
  },
})
