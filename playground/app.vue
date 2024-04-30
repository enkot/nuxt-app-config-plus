<template>
  <div>
    Nuxt module playground!
    {{ config.foo.fooBar.cat.name }}
  </div>
</template>

<script setup lang="ts">
const config = useAppConfig()
</script>
