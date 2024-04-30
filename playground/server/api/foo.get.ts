import { defineEventHandler } from 'h3'
// import { useAppConfig } from '#imports'

export default defineEventHandler(async () => {
  const config = useAppConfig()

  console.log('config', config.foo.catDog)

  return {}
})
