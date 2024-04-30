<template>
  <div>
    Nuxt module playground!
    {{ config.foo.bar }}
  </div>
</template>

<script setup lang="ts">
const config = useAppConfig()
</script>
