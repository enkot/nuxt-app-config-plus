<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: My Module
- Package name: my-module
- Description: My new Nuxt module
-->
[![Nuxt Configs](./public/cover.png)](https://nuxt-open-fetch.vercel.app/)

# Nuxt Configs

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Create complex directory-based App Config with ease.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/nuxt-configs?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

<!-- Highlight some of the features your module provide here -->
- 🗂 &nbsp;Generate App Config using folder structure
- 🍹 &nbsp;No need for redundant index files and re-exports
- 📃 &nbsp;Supports `js`, `ts` and `json` files
- 🥞 &nbsp;Supports Nuxt layers

![Nuxt Configs](./public/after.png)

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add nuxt-app-config-plus
```

That's it! You can now use Nuxt App Config Plus in your Nuxt app ✨


## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  pnpm install
  
  # Generate type stubs
  pnpm dev:prepare
  
  # Develop with the playground
  pnpm dev
  
  # Build the playground
  pnpm dev:build
  
  # Run ESLint
  pnpm lint
  
  # Run Vitest
  pnpm test
  pnpm test:watch
  
  # Release new version
  pnpm release
  ```

</details>

## License

Made with 💚

Published under the [MIT License](./LICENCE).


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-app-config-plus/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-app-config-plus

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-app-config-plus.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/nuxt-app-config-plus

[license-src]: https://img.shields.io/npm/l/nuxt-app-config-plus.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-app-config-plus

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
